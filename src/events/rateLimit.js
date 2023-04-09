const Event = require("../structures/Event");
const logger = require("../utils/logger");
const Discord = require("discord.js");
const config = require("../../config.json");
const webhookClient = new Discord.WebhookClient({
  url: config.webhooks.ratelimit_logs,
});

module.exports = class extends Event {
  async run(rl) {
    const embed = new Discord.MessageEmbed()
      .setColor("RED")
      .setDescription(
        `**Time out**\n\`${rl.timeout}ms\`\n**Limite:**\n\`${rl.limit}\`\n\n__**Informação**__\n**Metodo:**${rl.method}\n\n**Path:**\n${rl.path} ${rl.route}`
      )
      .setTimestamp();

    setTimeout(function () {
      webhookClient.sendCustom(embed);
      logger.info(`Time out: ${rl.timeout}ms. Limite: ${rl.limit}`, {
        label: "Rate Limit",
      });
    }, rl.timeout + 10);
  }
};
