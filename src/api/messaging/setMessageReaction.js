"use strict";

const logger = require("../../../func/logger");
const { generateOfflineThreadingID, getCurrentTimestamp } = require("../../utils/format");

module.exports = function (defaultFuncs, api, ctx) {
  return function setMessageReaction(reaction, messageID, threadID, callback, forceCustomReaction) {

    if (typeof callback !== "function") callback = () => {};

    return new Promise((resolve, reject) => {

      if (!ctx.mqttClient) {
        const err = new Error("MQTT client not connected");
        callback(err);
        return reject(err);
      }

      if (!reaction || !messageID || !threadID) {
        const err = new Error("Missing required parameters (reaction, messageID, threadID)");
        callback(err);
        return reject(err);
      }

      if (typeof ctx.wsReqNumber !== "number") ctx.wsReqNumber = 0;
      if (typeof ctx.wsTaskNumber !== "number") ctx.wsTaskNumber = 0;

      const reqID = ++ctx.wsReqNumber;
      const taskID = ++ctx.wsTaskNumber;

      const taskPayload = {
        thread_key: {
          thread_fbid: threadID
        },
        timestamp_ms: getCurrentTimestamp(),
        message_id: messageID,
        reaction: reaction,
        actor_id: ctx.userID,
        reaction_style: forceCustomReaction ? 1 : null,
        sync_group: 1,
        send_attribution: 65537
      };

      const task = {
        label: "29",
        payload: JSON.stringify(taskPayload),
        queue_name: "reaction",
        task_id: taskID
      };

      const mqttForm = {
        app_id: "772021112871879",
        payload: JSON.stringify({
          epoch_id: parseInt(generateOfflineThreadingID()),
          tasks: [task],
          version_id: "25376272951962053"
        }),
        request_id: reqID,
        type: 3
      };

      const handleResponse = (topic, message) => {
        if (topic !== "/ls_resp") return;

        try {
          const json = JSON.parse(message.toString());
          if (json.request_id !== reqID) return;

          ctx.mqttClient.removeListener("message", handleResponse);

          callback(null, { success: true });
          resolve({ success: true });

        } catch {}
      };

      ctx.mqttClient.on("message", handleResponse);

      ctx.mqttClient.publish("/ls_req", JSON.stringify(mqttForm), { qos: 1 }, (err) => {
        if (err) {
          ctx.mqttClient.removeListener("message", handleResponse);
          logger("setMessageReaction " + err, "error");
          callback(err);
          return reject(err);
        }
      });

    });
  };
};
