"use strict";

const logger = require("../../../func/logger");
const { generateOfflineThreadingID } = require("../../utils/format");

module.exports = function (defaultFuncs, api, ctx) {
  return function setMessageReaction(reaction, messageID, threadID, callback, forceCustomReaction) {

    const cb = typeof callback === "function" ? callback : () => {};

    return new Promise((resolve, reject) => {

      if (!ctx.mqttClient) {
        const err = new Error("MQTT client not connected");
        cb(err);
        return reject(err);
      }

      if (!reaction || !messageID || !threadID) {
        const err = new Error("Missing parameters");
        cb(err);
        return reject(err);
      }

      if (!ctx.wsReqNumber) ctx.wsReqNumber = 0;
      if (!ctx.wsTaskNumber) ctx.wsTaskNumber = 0;

      const reqID = ++ctx.wsReqNumber;
      const taskID = ++ctx.wsTaskNumber;

      // FIXED thread key
      const threadKey =
        threadID.length > 15
          ? { thread_fbid: threadID }
          : { other_user_fbid: threadID };

      const payload = {
        thread_key: threadKey,
        message_id: messageID,
        reaction: reaction,
        actor_id: ctx.userID,
        timestamp_ms: Date.now(),
        sync_group: 1
      };

      const task = {
        label: "29",
        payload: JSON.stringify(payload),
        queue_name: "reaction",
        task_id: taskID
      };

      const mqttPayload = {
        app_id: "772021112871879",
        payload: JSON.stringify({
          epoch_id: generateOfflineThreadingID(),
          tasks: [task],
          version_id: "25376272951962053"
        }),
        request_id: reqID,
        type: 3
      };

      ctx.mqttClient.publish("/ls_req", JSON.stringify(mqttPayload), { qos: 1 }, err => {

        if (err) {
          logger("setMessageReaction " + err, "error");
          cb(err);
          return reject(err);
        }

        cb(null, true);
        resolve(true);

      });

    });
  };
};
