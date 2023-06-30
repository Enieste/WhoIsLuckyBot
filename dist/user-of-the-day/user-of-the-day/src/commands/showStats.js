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
var showStats_exports = {};
__export(showStats_exports, {
  showStats: () => showStats
});
module.exports = __toCommonJS(showStats_exports);
var import_types = require("../utils/types");
var import_db = require("../db");
var import_lodash = require("lodash");
var import_utils = require("../utils");
const loserTitle = process.env.LOSER_TITLE || "\u043D\u0435\u0443\u0434\u0430\u0447\u043D\u0438\u043A";
const messageCharLimit = 4096;
const composeMessage = (title, records) => {
  const heading = `\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442\u044B ${title === import_types.LOSER ? `\u{1F308} ${(0, import_utils.capitalize)(loserTitle)}` : "\u{1F408} \u041A\u043E\u0442\u0438\u043A"} \u0414\u043D\u044F:
`;
  const usersList = records.reduce((acc, current, index) => {
    if (acc.finished)
      return acc;
    const userString = `${index + 1}) ${current.firstName_transient}${current.username_transient ? ` (@${current.username_transient})` : ""} - ${title === import_types.LOSER ? current.loserCount : current.userCount} \u0440\u0430\u0437(\u0430)
`;
    if (acc.res.length + userString.length > messageCharLimit + heading.length) {
      return { ...acc, finished: true };
    }
    return { ...acc, res: acc.res + userString };
  }, { res: "", finished: false });
  return heading + usersList.res;
};
const showStats = (bot) => async (msg) => {
  const allChatRecords = await import_db.prisma.userChatStats.findMany({
    where: {
      chatId: msg.chat.id
    }
  });
  const losers = (0, import_lodash.orderBy)(allChatRecords, (r) => r.loserCount, "desc");
  const winners = (0, import_lodash.orderBy)(allChatRecords, (r) => r.userCount, "desc");
  console.log("losers", losers, "winners", winners);
  await bot.sendMessage(msg.chat.id, composeMessage(import_types.WINNER, winners));
  await bot.sendMessage(msg.chat.id, composeMessage(import_types.LOSER, losers));
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  showStats
});
//# sourceMappingURL=showStats.js.map
