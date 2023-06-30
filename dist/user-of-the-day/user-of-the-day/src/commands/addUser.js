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
var addUser_exports = {};
__export(addUser_exports, {
  registerNewUser: () => registerNewUser
});
module.exports = __toCommonJS(addUser_exports);
var import_db = require("../db");
const registerNewUser = (bot) => async (msg) => {
  console.log("from register", msg);
  const userId = msg.from.id;
  const firstName = msg.from.first_name;
  const uniqWhere = {
    userId,
    chatId: msg.chat.id
  };
  const existing = await import_db.prisma.userChatStats.findUnique({
    where: {
      userId_chatId: uniqWhere
    }
  });
  if (existing) {
    await bot.sendMessage(msg.chat.id, `${firstName}, \u0432\u044B \u0443\u0436\u0435 \u0432 \u0438\u0433\u0440\u0435.`);
    return;
  }
  await (0, import_db.updateUser)({
    ...uniqWhere,
    username: msg.from.username,
    firstName: msg.from.first_name,
    status: "here"
  });
  return bot.sendMessage(
    msg.chat.id,
    `${firstName}, \u0434\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C \u0432 \u0438\u0433\u0440\u0443. \u041E\u0441\u0442\u0430\u043B\u043E\u0441\u044C \u0442\u043E\u043B\u044C\u043A\u043E \u0434\u043E\u0436\u0434\u0430\u0442\u044C\u0441\u044F...`
  );
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  registerNewUser
});
//# sourceMappingURL=addUser.js.map
