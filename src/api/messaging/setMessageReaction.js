"use strict";

const utils = require("../utils");
const logger = require("../../../func/logger");
const { generateOfflineThreadingID } = require("../../utils/format");

module.exports = function (defaultFuncs, api, ctx) {
  return function setMessageReaction(reaction, messageID, threadID, callback) {

    if (typeof callback !== "function") callback = () => {};

    return new Promise(async (resolve, reject) => {

      const mqttReact = () => {
        return new Promise((res, rej) => {

          if (!ctx.mqttClient) return rej("No MQTT");

          if (!ctx.wsReqNumber) ctx.wsReqNumber = 0;
          if (!ctx.wsTaskNumber) ctx.wsTaskNumber = 0;

          const reqID = ++ctx.wsReqNumber;
          const taskID = ++ctx.wsTaskNumber;

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
            if (err) return rej(err);
            res(true);
          });

        });
      };

      const graphQLReact = () => {

        const variables = {
          data: {
            client_mutation_id: ctx.clientMutationId++,
            actor_id: ctx.userID,
            action: reaction === "" ? "REMOVE_REACTION" : "ADD_REACTION",
            message_id: messageID,
            reaction: reaction
          }
        };

        const qs = {
          doc_id: "1491398900900362",
          variables: JSON.stringify(variables),
          dpr: 1
        };

        return defaultFuncs
          .postFormData(
            "https://www.facebook.com/webgraphql/mutation/",
            ctx.jar,
            {},
            qs
          )
          .then(utils.parseAndCheckLogin(ctx.jar, defaultFuncs));
      };

      try {

        // Try MQTT first
        await mqttReact();
        callback(null, true);
        resolve(true);

      } catch (mqttError) {

        try {

          // Fallback GraphQL
          await graphQLReact();
          callback(null, true);
          resolve(true);

        } catch (gqlError) {

          logger("Reaction Error: " + gqlError, "error");
          callback(gqlError);
          reject(gqlError);

        }

      }

    });
  };
};
