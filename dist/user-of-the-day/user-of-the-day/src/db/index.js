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
var db_exports = {};
__export(db_exports, {
  addCount: () => addCount,
  prisma: () => prisma,
  updateUser: () => updateUser
});
module.exports = __toCommonJS(db_exports);
var import_client = require("@prisma/client");
var import_types = require("../utils/types");
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl)
  throw new Error("process.env.DATABASE_URL is empty");
const prisma = new import_client.PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});
const updateUser = async ({
  userId,
  chatId,
  username,
  firstName,
  status
}) => {
  const uniqWhere = {
    userId,
    chatId
  };
  const deactivatedAt = status === "here" ? null : /* @__PURE__ */ new Date();
  await prisma.chat.upsert({
    where: {
      id: uniqWhere.chatId
    },
    create: {
      id: uniqWhere.chatId
    },
    update: {}
  });
  await prisma.userChatStats.upsert({
    where: {
      userId_chatId: uniqWhere
    },
    create: {
      userCount: 0,
      loserCount: 0,
      username_transient: username,
      firstName_transient: firstName,
      deactivated_at: deactivatedAt,
      ...uniqWhere
    },
    update: {
      ...username ? { username_transient: username } : {},
      firstName_transient: firstName,
      deactivated_at: deactivatedAt
    }
  });
};
const addCount = (tx) => async ({
  userId,
  chatId,
  title
}) => {
  const uniqWhere = {
    userId,
    chatId
  };
  const increment1 = { increment: 1 };
  await tx.userChatStats.update({
    where: {
      userId_chatId: uniqWhere
    },
    data: {
      ...title === import_types.LOSER ? { loserCount: increment1 } : { userCount: increment1 }
    }
  });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  addCount,
  prisma,
  updateUser
});
