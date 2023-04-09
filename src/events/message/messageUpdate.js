const Event = require("../../structures/Event");
const { MessageEmbed } = require("discord.js");
require("moment-duration-format");
const Logging = require("../../database/schemas/logging");
const Snipe = require("../../database/schemas/editsnipe");
const Maintenance = require("../../database/schemas/maintenance");

module.exports = class extends Event {
  async run(oldMessage, newMessage) {
    const maintenance = await Maintenance.findOne({
      maintenance: "maintenance",
    });

    if (maintenance && maintenance.toggle == "true") return;

    if (newMessage.webhookID) return;

    if (
      newMessage.member &&
      newMessage.id === newMessage.member.lastMessageID &&
      !oldMessage.command
    ) {
      newMessage.client.emit("message", newMessage);
    }

    if (!oldMessage || !newMessage) return;

    if (!oldMessage.content) return;
    if (!newMessage.content) return;

    if (
      oldMessage.content.length === null ||
      newMessage.content.length === null
    )
      return;
    if (newMessage === null) return;
    if (oldMessage === null) return;

    let snipe = await Snipe.findOne({
      guildId: newMessage.guild.id,
      channel: newMessage.channel.id,
    });
    const logging = await Logging.findOne({ guildId: newMessage.guild.id });

    if (newMessage.author && !newMessage.author.bot) {
      if (oldMessage.content != newMessage.content) {
        if (!snipe) {
          const snipeSave = new Snipe({
            guildId: newMessage.guild.id,
            channel: newMessage.channel.id,
          });

          snipeSave.oldmessage.push(oldMessage.content || null);
          snipeSave.newmessage.push(newMessage.content || null);
          snipeSave.url.push(newMessage.url || null);
          snipeSave.id.push(newMessage.author.id);

          snipeSave.save().catch(() => {});

          snipe = await Snipe.findOne({
            guildId: newMessage.guild.id,
            channel: newMessage.channel.id,
          });
        } else {
          if (snipe.oldmessage.length > 4) {
            snipe.oldmessage.splice(-5, 1);
            snipe.newmessage.splice(-5, 1);
            snipe.id.splice(-5, 1);
            snipe.url.splice(-5, 1);

            snipe.oldmessage.push(oldMessage.content || null);
            snipe.newmessage.push(newMessage.content || null);
            snipe.url.push(newMessage.url || null);
            snipe.id.push(newMessage.author.id);
          } else {
            snipe.oldmessage.push(oldMessage.content || null);
            snipe.newmessage.push(newMessage.content || null);
            snipe.url.push(newMessage.url || null);
            snipe.id.push(newMessage.author.id);
          }

          snipe.save().catch(() => {});
        }
      }
    }

    if (logging) {
      if (logging.message_events.toggle == "true") {
        if (logging.message_events.ignore == "true") {
          if (newMessage.author.bot) return;
        }

        const channelEmbed = await newMessage.guild.channels.cache.get(
          logging.message_events.channel
        );

        if (channelEmbed) {
          let color = logging.message_events.color;
          if (color == "#000000") color = newMessage.client.color.yellow;

          if (logging.message_events.deleted == "true") {
            if (oldMessage.content && newMessage.content) {
              if (oldMessage.content.length && newMessage.content.length) {
                if (oldMessage.content != newMessage.content) {
                  if (newMessage.content.length > 1024)
                    newMessage.content =
                      newMessage.content.slice(0, 1021) + "...";
                  if (oldMessage.content.length > 1024)
                    oldMessage.content =
                      oldMessage.content.slice(0, 1021) + "...";

                  const embed = new MessageEmbed()
                    .setAuthor(
                      `${newMessage.member.user.tag} | Mensagem Editada`,
                      newMessage.member.user.displayAvatarURL({ dynamic: true })
                    )
                    .setTimestamp()
                    .setDescription(
                      `
          ${newMessage.member} editou uma mensagem em ${newMessage.channel}\n\n[Ir para a Mensagem](${newMessage.url})
        `
                    )
                    .addField("Mensagem Antiga", oldMessage.content)
                    .addField("Nova", newMessage.content)
                    .setFooter({ text: `ID do usuário: ${newMessage.member.id}` })
                    .setColor(newMessage.guild.me.displayHexColor);

                  if (
                    channelEmbed &&
                    channelEmbed.viewable &&
                    channelEmbed
                      .permissionsFor(newMessage.guild.me)
                      .has(["SEND_MESSAGES", "EMBED_LINKS"])
                  ) {
                    channelEmbed.send({ embeds: [embed] }).catch(() => {});
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
