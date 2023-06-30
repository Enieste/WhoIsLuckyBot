"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var pickRandomUser_exports = {};
__export(pickRandomUser_exports, {
  getLoser: () => getLoser,
  getWinner: () => getWinner,
  pickRandomUser: () => pickRandomUser
});
module.exports = __toCommonJS(pickRandomUser_exports);
var import_types = require("../utils/types");
var import_db = require("../db");
var import_utils = require("../utils");
var import_date_fns = require("date-fns");
let pickingUserNow = false;
const loserTitle = process.env.LOSER_TITLE || "\u043D\u0435\u0443\u0434\u0430\u0447\u043D\u0438\u043A";
const designationToIdField = (d) => d === import_types.LOSER ? "currentLoserId" : "currentUserId";
const designationToLastDrawDateField = (d) => d === import_types.LOSER ? "lastLoserDrawDate" : "lastWinnerDrawDate";
const pickRandomUser = (bot) => async (msg, title) => {
  const getRandomUserForChat = async (chatId) => {
    const chat = await import_db.prisma.chat.findUnique({
      where: {
        id: msg.chat.id
      }
    });
    const fieldToCheck = designationToLastDrawDateField(title);
    const lastDrawDate = chat && chat[fieldToCheck];
    if (lastDrawDate && (0, import_date_fns.isEqual)((0, import_date_fns.startOfDay)(lastDrawDate), (0, import_date_fns.startOfDay)(Date.now()))) {
      return chat[designationToIdField(title)];
    }
    await bot.sendMessage(
      msg.chat.id,
      `\u041D\u0430\u0447\u0438\u043D\u0430\u044E \u043F\u043E\u0438\u0441\u043A ${title === import_types.LOSER ? loserTitle + "a" : "\u043A\u043E\u0442\u0438\u043A\u0430"} \u0434\u043D\u044F...`
    );
    const gameParticipants = await import_db.prisma.userChatStats.findMany({
      where: {
        chatId
      }
    });
    if (!gameParticipants.length)
      return null;
    const randomUser = gameParticipants[(0, import_utils.getRandomFromNumber)(gameParticipants.length)];
    await import_db.prisma.$transaction(async (tx) => {
      await Promise.all([
        (0, import_db.addCount)(tx)({
          userId: randomUser.userId,
          chatId: BigInt(msg.chat.id),
          title
        }),
        tx.chat.update({
          where: {
            id: msg.chat.id
          },
          data: {
            [designationToIdField(title)]: randomUser.userId,
            [fieldToCheck]: /* @__PURE__ */ new Date()
          }
        })
      ]);
    });
    return randomUser.userId;
  };
  if (pickingUserNow)
    return {
      tag: "error",
      message: "Calculating user, please wait"
    };
  pickingUserNow = true;
  const MAX_TRIES = 20;
  const recurse = async (msg2, tries) => {
    if (tries >= MAX_TRIES)
      return {
        tag: "error",
        message: "Sorry no users found"
      };
    const chatId = msg2.chat.id;
    const randomUserId = await getRandomUserForChat(BigInt(chatId));
    if (randomUserId === null)
      return {
        tag: "error",
        message: "No users to choose from"
      };
    const selectedUser = await bot.getChatMember(chatId, Number(randomUserId));
    if (selectedUser.status === "left") {
      await (0, import_db.updateUser)({
        userId: selectedUser.user.id,
        chatId,
        username: selectedUser.user.username,
        firstName: selectedUser.user.first_name,
        status: "gone"
      });
      await recurse(msg2, tries + 1);
    }
    return {
      tag: "success",
      member: selectedUser
    };
  };
  return recurse(msg, 0).finally(() => {
    pickingUserNow = false;
  });
};
const getDude = (tag, messagePrefix) => (bot) => async (msg) => {
  const selectedDude = await pickRandomUser(bot)(msg, tag);
  if (selectedDude.tag === "error") {
    await bot.sendMessage(msg.chat.id, selectedDude.message);
    return;
  }
  await bot.sendMessage(
    msg.chat.id,
    `${messagePrefix} \u2014 ${selectedDude.member.user.username ? `${selectedDude.member.user.first_name} (@${selectedDude.member.user.username})` : `${selectedDude.member.user.first_name}`}`
  );
};
const getWinner = getDude(import_types.WINNER, "\u{1F408} \u041A\u043E\u0442\u0438\u043A \u0434\u043D\u044F");
const getLoser = getDude(import_types.LOSER, `\u{1F308} ${(0, import_utils.capitalize)(loserTitle)} \u0434\u043D\u044F`);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  getLoser,
  getWinner,
  pickRandomUser
});
//# sourceMappingURL=pickRandomUser.js.map
