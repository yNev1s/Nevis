const mongoose = require("mongoose");
const serverset = require("./models/schema.js");

module.exports = class react {
  /**
   * @param {string} [dbUrl] - A valid mongo database URI.
   */

  async setURL(dbUrl) {
    if (!dbUrl) throw new TypeError("Um URL de banco de dados não foi fornecido.");

    return mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }

  /**
   * @param {object} [client] - Discord client, will save the data in a Map to prevent multiple fetches
   * @param {string} [guildId] - Discord guild id.
   * @param {string} [msgid] - on which should the reaction roles be.
   * @param {string} [roleid] - Discord guild id.
   * @param {string} [emoji] - on which emoji u would get the role
   * @param {Boolean} [dm] - Discord guild id.
   */

  async reactionCreate(client, guildId, msgid, roleid, emoji, dm, option) {
    if (!client) throw new TypeError("O bot não foi fornecido.");
    if (!guildId) throw new TypeError("O id do servidor não foi fornicido.");
    if (!msgid) throw new TypeError("O id da mensagem não foi fornecido.");
    if (!emoji) throw new TypeError("Uma reação/emoji não foi fornecida.");
    if (!roleid) throw new TypeError("Um id de grupo não foi fornecido.");
    dm = dm ? dm : false;
    if (!option) option = 1;

    const issame = await serverset.findOne({
      guildid: guildId,
      msgid: msgid,
      reaction: emoji,
      roleid: roleid,
    });
    if (issame) return false;

    const newRR = new serverset({
      guildid: guildId,
      msgid: msgid,
      reaction: emoji,
      roleid: roleid,
      dm: dm,
      option: option,
    });

    await newRR
      .save()
      .catch((e) => console.log(`Ocorreu um erro ao criar o sistema **Cargo por Reção**. Devido ao erro: ${e}`));
    client.react.set(msgid + emoji, {
      guildid: guildId,
      msgid: msgid,
      reaction: emoji,
      roleid: roleid,
      dm: dm,
      option: option,
    });
    return newRR;
  }

  /**
   * @param {object} [client] - Discord client, will save the data in a Map to prevent multiple fetches
   * @param {string} [guildId] - Discord guild id.
   * @param {string} [msgid] - on which should the reaction roles be.
   * @param {string} [emoji] - on which emoji u would get the role
   */

  async reactionDelete(client, guildId, msgid, emoji) {
    if (!client) throw new TypeError("O bot não foi fornecido.");
    if (!guildId) throw new TypeError("O id do servidor não foi fornicido.");
    if (!msgid) throw new TypeError("O id da mensagem não foi fornecido.");
    if (!emoji) throw new TypeError("Uma reação/emoji não foi fornecida.");

    const reactionRole = await serverset.findOne({
      guildid: guildId,
      msgid: msgid,
      reaction: emoji,
    });
    if (!reactionRole) return false;

    await serverset
      .findOneAndDelete({
        guildid: guildId,
        msgid: msgid,
        reaction: emoji,
        option: reactionRole.option,
      })
      .catch((e) => console.log(`Ocorreu um erro ao deletar a reação. Devido ao erro: ${e}`));

    client.react.delete(msgid + emoji);

    return reactionRole;
  }

  /**
   * @param {object} [client] - Discord client, will save the data in a Map to prevent multiple fetches
   * @param {string} [guildId] - Discord guild id.
   * @param {string} [msgid] - on which should the reaction roles be.
   * @param {string} [newroleid] - Discord guild id.
   * @param {string} [emoji] - on which emoji u would get the role
   */

  async reactionEdit(client, guildId, msgid, newroleid, emoji, newoption) {
    if (!client) throw new TypeError("O bot não foi fornecido.");
    if (!guildId) throw new TypeError("O id do servidor não foi fornicido.");
    if (!msgid) throw new TypeError("O id da mensagem não foi fornecido.");
    if (!emoji) throw new TypeError("Uma reação/emoji não foi fornecida.");
    if (!newroleid) throw new TypeError("Um id de grupo não foi fornecido.");
    if (!newoption) newoption = 1;

    const reactionRole = await serverset.findOne({
      guildid: guildId,
      msgid: msgid,
      reaction: emoji,
    });
    if (!reactionRole) return false;
    reactionRole.roleid = newroleid;

    await reactionRole
      .save()
      .catch((e) => console.log(`Ocorreu um erro ao salvar o novo prefixo. Devido ao erro: ${e}`));
    client.react.set(msgid + emoji, {
      guildid: guildId,
      msgid: msgid,
      reaction: emoji,
      roleid: newroleid,
      dm: reactionRole.dm,
      option: reactionRole.option,
    });
    return;
  }

  /**
   * @param {object} [client] - Discord client, will save the data in a Map to prevent multiple fetches
   * @param {string} [guildId] - Discord guild id.
   * @param {string} [msgid] - Discord guild id.
   * @param {string} [emoji] - Discord guild id.
   */

  async reactionFetch(client, guildId, msgid, emoji) {
    if (!client) throw new TypeError("O bot não foi fornecido.");
    if (!guildId) throw new TypeError("O id do servidor não foi fornicido.");
    if (!client.fetchforguild.has(guildId)) {
      let allrole = await serverset
        .find({ guildid: guildId })
        .sort([["guildid", "descending"]])
        .exec();
      let i = 0;
      for (i; i < Object.keys(allrole).length; i++) {
        await client.react.set(allrole[i].msgid + allrole[i].reaction, {
          guildid: allrole[i].guildid,
          msgid: allrole[i].msgid,
          reaction: allrole[i].reaction,
          roleid: allrole[i].roleid,
          dm: allrole[i].dm,
        });
      }
      client.fetchforguild.set(guildId, {
        guildid: guildId,
        totalreactions: Object.keys(allrole).length,
      });
    }
    return client.react.get(msgid + emoji);
  }

  /**
   * @param {object} [client] - Discord client, will save the data in a Map to prevent multiple fetches
   */
  async reactionFetchAll(client) {
    if (!client) throw new TypeError("O bot não foi fornecido.");
    let all = await serverset
      .find({})
      .sort([["guildid", "descending"]])
      .exec();

    return all;
  }
};

//module.exports = react;
