const Event = require("../structures/Event");
const Discord = require("discord.js");
const config = require("../../config.json");
const webhookClient = new Discord.WebhookClient({ url: config.webhooks.maintenance_logs });
const logger = require("../utils/logger");
const Maintenance = require("../database/schemas/maintenance");
let number = 1;
module.exports = class extends Event {
  async run(info) {
    let embed;
    if (info.includes("hit")) {
      if (config.maintenance === "true") {
        const maintenance = await Maintenance.findOne({
          maintenance: "maintenance",
        });
        number = ++number;

        embed = `${info} - ${number}`;
        logger.info(info, { label: "Debug" });

        if (number >= parseInt(config.maintenance_threshold)) {
          embed = `${info} - ${number} - MODO DE SEGURANÇA ALCANÇADO`;
          const maintenanceEmbed = new Discord.MessageEmbed()
            .setDescription(embed)
            .setColor("RED");

          webhookClient.sendCustom(maintenanceEmbed);

          console.log("Modo de Segurança Alcançada - Ativando o modo de manutenção.");
          maintenance.toggle = "true";
          await maintenance.save();
          process.exit(1);
        }
      }
    }
  }
};
