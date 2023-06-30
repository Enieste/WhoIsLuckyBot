"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var bot_exports = {};
__export(bot_exports, {
  bot: () => bot
});
module.exports = __toCommonJS(bot_exports);
var import_node_telegram_bot_api = __toESM(require("node-telegram-bot-api"));
var import_pick = __toESM(require("lodash/pick"));
var import_addUser = require("./commands/addUser");
var import_pickRandomUser = require("./commands/pickRandomUser");
var import_showStats = require("./commands/showStats");
const token = process.env.TOKEN;
if (!token)
  throw new Error("no process.env.TOKEN");
const cleanMsgObj = (msg) => (0, import_pick.default)(msg, ["from", "chat", "date"]);
const BOT_NAME = "WhoIsLuckyTodayBot";
const bot = new import_node_telegram_bot_api.default(token, { polling: true });
const runCommands = {
  finduser: import_pickRandomUser.getWinner,
  findbestuser: import_pickRandomUser.getLoser,
  adduser: import_addUser.registerNewUser,
  stats: import_showStats.showStats
};
const ACCEPTED_COMMANDS = Object.keys(
  runCommands
);
bot.on("message", (msg) => {
  console.log(msg);
  const messageIsCommand = (msg2) => (msg2.text || "")[0] === "/";
  if (!messageIsCommand(msg)) {
    console.log("Message isn'r command", msg);
    return;
  }
  const indexOfBotName = msg.text.indexOf(`@${BOT_NAME}`);
  const command = msg.text.substring(
    1,
    indexOfBotName === -1 ? void 0 : indexOfBotName
  );
  const isCommandAccepted = (command2) => ACCEPTED_COMMANDS.indexOf(command2) !== -1;
  if (!isCommandAccepted(command)) {
    console.log(`Command wasn't accepted: ${command}`);
    return;
  }
  const isFromHere = (m) => !!m.from;
  if (!isFromHere(msg)) {
    console.log("Doesn't have From field");
    return;
  }
  console.log("command accepted", command);
  runCommands[command](bot)(cleanMsgObj(msg));
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  bot
});
