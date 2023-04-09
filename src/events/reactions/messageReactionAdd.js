const Event = require("../../structures/Event"); ////("discord.js")
const { MessageEmbed } = require("discord.js");
const Db = require("../../packages/reactionrole/models/schema.js");
const reactionTicket = require("../../database/models/tickets.js");
const reactionCooldown = new Set();
const discord = require("discord.js");
const moment = require("moment");
const send = require(`../../packages/logs/index.js`);
const GuildDB = require("../../database/schemas/Guild");
const Maintenance = require("../../database/schemas/maintenance");
const ticketCooldownLol = new Set();
const botCooldown = new Set();

/**
 *
 * @param {MessageReaction} reaction
 * @param {User} user
 */

module.exports = class extends Event {
  async run(messageReaction, user) {
    if (this.client.user === user) return;

    const { message, emoji } = messageReaction;

    const maintenance = await Maintenance.findOne({
      maintenance: "maintenance",
    });

    if (maintenance && maintenance.toggle == "true") return;

    const member = message.guild.members.cache.get(user.id);

    const guildDB = await GuildDB.findOne({
      guildId: message.guild.id,
    });

    let prefix = guildDB.prefix;
    await Db.findOne(
      {
        guildid: message.guild.id,
        reaction: emoji.toString(),
        msgid: message.id,
      },

      async (err, db) => {
        if (!db) return;

        if (message.id != db.msgid) return;

        const rrRole = message.guild.roles.cache.get(db.roleid);

        if (!rrRole) return;

        if (botCooldown.has(message.guild.id)) return;

        let guild = this.client.guilds.cache.get(db.guildid);
        let guildName = guild.name;

        let slowDownEmbed = new MessageEmbed()
          .setDescription(
            `${message.client.emoji.fail}, calma aí meu patrão! Aguarde um instante e tente novamente.`
          )
          .setColor(message.client.color.red);

        let addEmbed = new MessageEmbed()
        .setAuthor(
          "Cargo Adicionado",
          `https://nevis.website/logo.png`,
          `${message.url}`
        )
        .setDescription(
          `Você recebeu o cargo **${rrRole.name}** em ${guildName}.`
        )
        .setFooter({ text: "https://nevis.website/" })
        .setColor(message.client.color.green);

      let remEmbed = new MessageEmbed()
        .setAuthor(
          "Cargo Removido",
          `https://nevis.website/logo.png`,
          `${message.url}`
        )
        .setDescription(
          `Você retirou o seu cargo **${rrRole.name}** no servidor ${guildName}.`
        )
        .setFooter({ text: "https://nevis.website/" })
        .setColor(message.client.color.green);

        let errorReaction = new MessageEmbed()
          .setAuthor(
            "Erro",
            `https://nevis.website/logo.png`,
            `${message.url}`
          )
          .setDescription(
            `${message.client.emoji.fail} Ocorreu um erro ao adicionar o cargo, pois estou sem a permissão **Gerenciar Cargos**.\n\nPor favor, informe um administrador do servidor.`
          )
          .setFooter({ text: "https://pogy.xyz/" })
          .setColor(message.client.color.green);

        if (reactionCooldown.has(user.id)) {
          if (
            message.channel &&
            message.channel.viewable &&
            message.channel
              .permissionsFor(message.guild.me)
              .has(["SEND_MESSAGES", "EMBED_LINKS"])
          ) {
            user.send({ embeds: [slowDownEmbed] }).catch(() => {});
            botCooldown.add(message.guild.id);
            setTimeout(() => {
              botCooldown.delete(message.guild.id);
            }, 4000);
          }
        }

        if (db.option === 1) {
          try {
            if (
              !member.roles.cache.find(
                (r) => r.name.toLowerCase() === rrRole.name.toLowerCase()
              )
            ) {
              await member.roles.add(rrRole).catch(() => {});
              if (guildDB.reactionDM === true) {
                member.send({ embeds: [addEmbed] }).catch(() => {});
              }
              reactionCooldown.add(user.id);
              setTimeout(() => {
                reactionCooldown.delete(user.id);
              }, 2000);
            }
          } catch (err) {
            console.log(err);
            if (
              !message.channel
                .permissionsFor(message.guild.me)
                .has("SEND_MESSAGES")
            )
              return;
            botCooldown.add(message.guild.id);
            setTimeout(() => {
              botCooldown.delete(message.guild.id);
            }, 6000);
            return member.send({ embeds: [errorReaction] }).catch(() => {});
          }
        }

        if (db.option === 2) {
          try {
            if (
              !member.roles.cache.find(
                (r) => r.name.toLowerCase() === rrRole.name.toLowerCase()
              )
            ) {
              await member.roles.add(rrRole).catch(() => {});
              if (guildDB.reactionDM === true) {
                member.send({ embeds: [addEmbed] }).catch(() => {});
              }
              reactionCooldown.add(user.id);
              setTimeout(() => {
                reactionCooldown.delete(user.id);
              }, 2000);
            }
          } catch (err) {
            if (
              !message.channel
                .permissionsFor(message.guild.me)
                .has("SEND_MESSAGES")
            )
              return;
            botCooldown.add(message.guild.id);
            setTimeout(() => {
              botCooldown.delete(message.guild.id);
            }, 6000);
            return member.send({ embeds: [errorReaction] }).catch(() => {});
          }
        }

        if (db.option === 3) {
          try {
            if (
              member.roles.cache.find(
                (r) => r.name.toLowerCase() === rrRole.name.toLowerCase()
              )
            ) {
              await member.roles.remove(rrRole).catch(() => {});
              if (guildDB.reactionDM === true) {
                member.send({ embeds: [remEmbed] }).catch(() => {});
              }
              reactionCooldown.add(user.id);
              setTimeout(() => {
                reactionCooldown.delete(user.id);
              }, 2000);
            }
          } catch (err) {
            if (
              !message.channel
                .permissionsFor(message.guild.me)
                .has("SEND_MESSAGES")
            )
              return;
            botCooldown.add(message.guild.id);
            setTimeout(() => {
              botCooldown.delete(message.guild.id);
            }, 6000);
            return member.send({ embeds: [errorReaction] }).catch(() => {});
          }
        }

        if (db.option === 4) {
          try {
            if (
              member.roles.cache.find(
                (r) => r.name.toLowerCase() === rrRole.name.toLowerCase()
              )
            ) {
              await member.roles.remove(rrRole).catch(() => {});
              reactionCooldown.add(user.id);
              if (guildDB.reactionDM === true) {
                member.send({ embeds: [remEmbed] }).catch(() => {});
              }
              setTimeout(() => {
                reactionCooldown.delete(user.id);
              }, 2000);
            }
          } catch (err) {
            if (
              !message.channel
                .permissionsFor(message.guild.me)
                .has("SEND_MESSAGES")
            )
              return;
            botCooldown.add(message.guild.id);
            setTimeout(() => {
              botCooldown.delete(message.guild.id);
            }, 6000);
            return member.send({ embeds: [errorReaction] }).catch(() => {});
          }
        }

        if (db.option === 5) {
          try {
            if (
              member.roles.cache.find(
                (r) => r.name.toLowerCase() === rrRole.name.toLowerCase()
              )
            ) {
              await member.roles.remove(rrRole);
              message.reactions.cache
                .find((r) => r.emoji.name == emoji.name)
                .users.remove(user.id)
                .catch(() => {});

              if (guildDB.reactionDM === true) {
                member.send({ embeds: [remEmbed] }).catch(() => {});
              }
              reactionCooldown.add(user.id);
              setTimeout(() => {
                reactionCooldown.delete(user.id);
              }, 2000);
            }
          } catch (err) {
            if (
              !message.channel
                .permissionsFor(message.guild.me)
                .has("SEND_MESSAGES")
            )
              return;
            botCooldown.add(message.guild.id);
            setTimeout(() => {
              botCooldown.delete(message.guild.id);
            }, 6000);
            return member.send({ embeds: [errorReaction] }).catch(() => {});
          }
        }

        if (db.option === 6) {
          try {
            if (
              member.roles.cache.find(
                (r) => r.name.toLowerCase() === rrRole.name.toLowerCase()
              )
            ) {
              message.reactions.cache
                .find((r) => r.emoji.name == emoji.name)
                .users.remove(user.id)
                .catch(() => {});
              await member.roles.remove(rrRole).catch(() => {});

              reactionCooldown.add(user.id);
              setTimeout(() => {
                reactionCooldown.delete(user.id);
              }, 5000);

              return;
            } else if (
              !member.roles.cache.find(
                (r) => r.name.toLowerCase() === rrRole.name.toLowerCase()
              )
            ) {
              message.reactions.cache
                .find((r) => r.emoji.name == emoji.name)
                .users.remove(user.id)
                .catch(() => {});
              await member.roles.add(rrRole).catch(() => {});

              if (guildDB.reactionDM === true) {
                member.send({ embeds: [addEmbed] }).catch(() => {});
              }
              reactionCooldown.add(user.id);
              setTimeout(() => {
                reactionCooldown.delete(user.id);
              }, 5000);
            }
          } catch (err) {
            if (
              !message.channel
                .permissionsFor(message.guild.me)
                .has("SEND_MESSAGES")
            )
              return;
            botCooldown.add(message.guild.id);
            setTimeout(() => {
              botCooldown.delete(message.guild.id);
            }, 6000);
            return member.send({ embeds: [errorReaction] }).catch(() => {});
          }
        }
      }
    );

    //ticket stuff
    await reactionTicket.findOne(
      {
        guildID: message.guild.id,
      },
      async (err, db) => {
        if (!db) return;

        if (db.ticketType == "reaction") {
          if (db.messageID.includes(message.id)) {
            if (
              emoji.toString() === "🎫" ||
              emoji.toString() === "🎟️" ||
              emoji.toString() === "📩" ||
              emoji.toString() === "✅" ||
              emoji.toString() === "📻" ||
              emoji.toString() === "☑️" ||
              emoji.toString() === "📲" ||
              emoji.toString() === "📟" ||
              emoji.toString() === "🆕" ||
              emoji.toString() === "📤" ||
              emoji.toString() === "📨" ||
              emoji.toString() === "🔑" ||
              emoji.toString() === "🏷️"
            ) {
              if (guildDB.isPremium == "false") {
                if (
                  emoji.toString() === "🎟️" ||
                  emoji.toString() === "✅" ||
                  emoji.toString() === "📻" ||
                  emoji.toString() === "☑️" ||
                  emoji.toString() === "📲" ||
                  emoji.toString() === "📟" ||
                  emoji.toString() === "🆕" ||
                  emoji.toString() === "📤" ||
                  emoji.toString() === "📨" ||
                  emoji.toString() === "🔑" ||
                  emoji.toString() === "🏷️"
                )
                  return;
              }
              let serverCase = db.ticketCase;
              if (!serverCase || serverCase === null) serverCase = "1";

              let ticketRole = message.guild.roles.cache.get(db.supportRoleID);
              let ticketCategory = message.guild.channels.cache.get(
                db.categoryID
              );
              let ticketLog = message.guild.channels.cache.get(
                db.ticketModlogID
              );

              message.reactions.cache
                .find((r) => r.emoji.name == emoji.name)
                .users.remove(user.id)
                .catch(() => {});

              let id = user.id.toString().substr(0, 4) + user.discriminator;
              let chann = `ticket-${id}`;

              let array = [];

              message.guild.channels.cache.forEach((channel) => {
                if (channel.name == chann) array.push(channel.id);
              });

              let ticketlimit = db.maxTicket;
              if (!ticketlimit) ticketlimit = 1;

              let arraylength = array.length;

              if (arraylength > ticketlimit || arraylength == ticketlimit) {
                if (ticketCooldownLol.has(user.id)) return;
                if (
                  !message.channel
                    .permissionsFor(message.guild.me)
                    .has("SEND_MESSAGES")
                )
                  return;
                if (
                  !message.channel
                    .permissionsFor(message.guild.me)
                    .has("EMBED_LINKS")
                )
                  return;
                message.channel
                  .sendCustom({
                    embeds: [
                      new discord.MessageEmbed()
                        .setColor(message.client.color.red)
                        .setDescription(
                          `Ops, você já tem ${arraylength} tickets abertos, que atualmente o limite de tickets é ${ticketlimit} `
                        )
                        .setAuthor(user.tag, user.displayAvatarURL())
                        .setFooter({ text: "https://nevis.website/" }),
                    ],
                  })
                  .then((m) => {
                    setTimeout(() => {
                      m.delete();
                    }, 5000);
                  });
                ticketCooldownLol.add(user.id);
                setTimeout(() => {
                  ticketCooldownLol.delete(user.id);
                }, 10000);

                return;
              }

              message.guild.channels
                .create(chann, {
                  permissionOverwrites: [
                    {
                      allow: [
                        "VIEW_CHANNEL",
                        "SEND_MESSAGES",
                        "ATTACH_FILES",
                        "READ_MESSAGE_HISTORY",
                        "ADD_REACTIONS",
                        "MANAGE_CHANNELS",
                      ],
                      id: message.guild.me,
                    },

                    {
                      allow: [
                        "VIEW_CHANNEL",
                        "SEND_MESSAGES",
                        "ATTACH_FILES",
                        "READ_MESSAGE_HISTORY",
                        "ADD_REACTIONS",
                      ],
                      id: user,
                    },
                    {
                      allow: [
                        "VIEW_CHANNEL",
                        "SEND_MESSAGES",
                        "ATTACH_FILES",
                        "READ_MESSAGE_HISTORY",
                        "ADD_REACTIONS",
                      ],
                      id: ticketRole,
                    },

                    {
                      deny: ["VIEW_CHANNEL", "SEND_MESSAGES"],
                      id: message.guild.roles.everyone,
                    },
                  ],
                  parent: ticketCategory.id,
                  reason: `Ticket`,
                  topic: `**ID:** ${user.id} | **Tag:** ${user.tag}`,
                })
                .then(async (chan) => {
                  await chan.permissionOverwrites.edit(user, {
                    VIEW_CHANNEL: true,
                    SEND_MESSAGES: true,
                    READ_MESSAGE_HISTORY: true,
                    ATTACH_FILES: true,
                  });
                  await db.updateOne({ ticketCase: serverCase + 1 });

                  let color = db.ticketWelcomeColor;
                  if (color == "#000000")
                    color = message.guild.me.displayHexColor;

                  if (db.ticketPing == "true") {
                    if (chan) {
                      if (
                        !chan.permissionsFor(chan.guild.me).has("SEND_MESSAGES")
                      )
                        return;
                      if (
                        !chan.permissionsFor(chan.guild.me).has("EMBED_LINKS")
                      )
                        return;

                      chan.send(`${member} ${ticketRole}`).catch(() => {});
                    }
                  }

                  chan.send({
                    embeds: [
                      new discord.MessageEmbed()
                        .setAuthor(user.tag, user.displayAvatarURL())

                        .setDescription(
                          db.ticketWelcomeMessage
                            .replace(/{user}/g, `${member}`)
                            .replace(/{user_tag}/g, `${member.tag}`)
                            .replace(/{user_name}/g, `${member.username}`)
                            .replace(/{reason}/g, `${member.username}`)
                            .replace(/{user_ID}/g, `${member.id}`)
                        )

                        .setColor(color),
                    ],
                  });

                  chan.sendCustom({
                    embeds: [
                      new MessageEmbed()
                        .setDescription(
                          `Por favor use \`${prefix}fechar\` para fechar o ticket.`
                        )
                        .setColor(message.client.color.red)
                        .setFooter({ text: "https://nevis.website/" }),
                    ],
                  });

                  let color2 = db.ticketLogColor;
                  if (color2 == "#000000") color2 = `#36393f`;

                  const embedLog = new discord.MessageEmbed()
                    .setColor(color2)
                    .setFooter({ text: "https://nevis.website/" })
                    .setTitle("Ticket Criado")
                    .setTimestamp()
                    .addField(
                      "Informações",
                      `**Usuário:** ${user}\n**Canal: **${
                        chan.name
                      }\n**Ticket:** #${serverCase}\n**Data:** ${moment(
                        new Date()
                      ).format("dddd, MMMM Do YYYY")} `
                    );

                  if (ticketLog) {
                    send(ticketLog, {
                      embeds: [embedLog],
                      name: `Ticket - Logs`,
                      icon: `https://nevis.website/logo.png`,
                    }).catch(() => {});
                  }
                })
                .catch((e) => {
                  console.log(e);
                  if (
                    !message.channel
                      .permissionsFor(message.guild.me)
                      .has("SEND_MESSAGES")
                  )
                    return;
                  message.channel
                    .sendCustom({
                      embeds: [
                        new discord.MessageEmbed()
                          .setColor(message.client.color.red)
                          .setDescription(
                            "Ocorreu um erro ao criar o ticket, verifique minhas permissões ou entre em contato conosco."
                          ),
                      ],
                    })
                    .then((m) => {
                      setTimeout(() => {
                        m.delete();
                      }, 5000);
                    })
                    .catch(() => {});
                });
            }
          }
        }
      }
    );
  }
};
