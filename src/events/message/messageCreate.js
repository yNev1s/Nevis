const Event = require("../../structures/Event");
const { Permissions, Collection } = require("discord.js");
const moment = require("moment");
const { MessageEmbed } = require("discord.js");
const logger = require("../../utils/logger");
const Guild = require("../../database/schemas/Guild");
const User = require("../../database/schemas/User");
const Blacklist = require("../../database/schemas/blacklist");
const maintenanceCooldown = new Set();
const metrics = require("datadog-metrics");
const permissions = require("../../assets/json/permissions.json");
const Maintenance = require("../../database/schemas/maintenance");
const config = require("../../../config.json");
require("moment-duration-format");
require("dotenv").config();

module.exports = class extends Event {
  constructor(...args) {
    super(...args);

    this.impliedPermissions = new Permissions([
      "VIEW_CHANNEL",
      "SEND_MESSAGES",
      "SEND_TTS_MESSAGES",
      "EMBED_LINKS",
      "ATTACH_FILES",
      "READ_MESSAGE_HISTORY",
      "MENTION_EVERYONE",
      "USE_EXTERNAL_EMOJIS",
      "ADD_REACTIONS",
    ]);

    this.ratelimits = new Collection();
  }

  async run(message) {
    try {
      if (!message.guild) return;

      let metricsEnabled = false;
      if (process.env.DATADOG_API_KEY) {
        metricsEnabled = true;
      }

      const mentionRegex = RegExp(`^<@!?${this.client.user.id}>$`);
      const mentionRegexPrefix = RegExp(`^<@!?${this.client.user.id}>`);

      if (!message.guild || message.author.bot) return;

      let settings = await Guild.findOne({
        guildId: message.guild.id,
      });

      if (!settings) {
        await Guild.create({
          guildId: message.guild.id,
          prefix: config.prefix,
          language: "portugues",
        });

        settings = await Guild.findOne({
          guildId: message.guild.id,
        });
      }

      if (message.content.match(mentionRegex)) {
        //if (!settings) return message.channel.sendCustom('Oops, this server was not found in the database. Please try to run the command again now!');

        const prefixstart = `\`${settings.prefix || "n!"}\``;
        const startingcmd = `\`${settings.prefix || "n!"}ajuda\``;
        const embed = new MessageEmbed()
          .setTitle("Olá, sou o Nevis.")
          .setDescription(
            `Você pode ver meus comandos digitando **${prefixstart}ajuda** na área de texto.\n\n:incoming_envelope:┆Me adicione!\nMe adicione ao seu servidor! Você pode clicar [aqui](https://discord.com/api/oauth2/authorize?client_id=1091738508282052688&permissions=8&scope=bot%20applications.commands) para me adicionar. (Isso me deixa muito feliz, sabia?)\n:question:┆Precisa de ajuda?\nSe você precisar de ajuda com alguma função minha, você pode entrar no meu servidor e lá iremos te ajudar com isso. Você pode entrar lá clicando [aqui](https://discord.gg/DDejTvt46r)!\n:lady_beetle:┆Encontrou um bug?\nReporte **todos** os bugs usando: \`/reportar bug\`!`
          )
          .setFooter("Obrigado por me adicionar.")
          .setColor("#FF2C98");
        message.channel.sendCustom(embed);
      }

      // Add increment after every fucking message lmfao!
      if (metricsEnabled) metrics.increment("messages_seen");

      let mainPrefix = settings ? settings.prefix : "n!";

      const prefix = message.content.match(mentionRegexPrefix)
        ? message.content.match(mentionRegexPrefix)[0]
        : mainPrefix;

      const userBlacklistSettings = await Blacklist.findOne({
        discordId: message.author.id,
      });
      const guildBlacklistSettings = await Blacklist.findOne({
        guildId: message.guild.id,
      });

      const maintenance = await Maintenance.findOne({
        maintenance: "maintenance",
      });

      if (!message.content.startsWith(prefix)) return;

      // eslint-disable-next-line no-unused-vars
      const [cmd, ...args] = message.content
        .slice(prefix.length)
        .trim()
        .split(/ +/g);
      const command =
        this.client.botCommands.get(cmd.toLowerCase()) ||
        this.client.botCommands.get(this.client.aliases.get(cmd.toLowerCase()));

      // maintenance mode

      if (!this.client.config.developers.includes(message.author.id)) {
        if (maintenance && maintenance.toggle == "true") {
          if (maintenanceCooldown.has(message.author.id)) return;

          message.channel.sendCustom(
            `Atualmente estou em manutenção, por isso não é possível usar meus comandos. Tente novamente mais tarde. Para mais informações entre no meu [discord](${config.discord})`
          );

          maintenanceCooldown.add(message.author.id);
          setTimeout(() => {
            maintenanceCooldown.delete(message.author.id);
          }, 10000);

          return;
        }
      }

      if (command) {
        await User.findOne(
          {
            discordId: message.author.id,
          },
          (err, user) => {
            if (err) console.log(err);

            if (!user) {
              const newUser = new User({
                discordId: message.author.id,
              });

              newUser.save();
            }
          }
        );

        let disabledCommands = settings.disabledCommands;
        if (typeof disabledCommands === "string")
          disabledCommands = disabledCommands.split(" ");

        const rateLimit = this.ratelimit(message, cmd);

        if (
          !message.channel.permissionsFor(message.guild.me).has("SEND_MESSAGES")
        )
          return;

        // Check if user is Blacklisted
        if (userBlacklistSettings && userBlacklistSettings.isBlacklisted) {
          logger.warn(
            `${message.author.tag} tentou usar o comando "${cmd}" mas ele está em minha blacklist!`,
            { label: "Comandos" }
          );
          return;
        }

        // Check if server is Blacklisted
        if (guildBlacklistSettings && guildBlacklistSettings.isBlacklisted) {
          logger.warn(
            `${message.author.tag} tentou usar o comando "${cmd}" mas o servidor está em minha blacklist!`,
            { label: "Commands" }
          );
          return;
        }

        let number = Math.floor(Math.random() * 10 + 1);
        if (typeof rateLimit === "string")
          return message.channel
            .sendCustom(
              ` ${
                message.client.emoji.fail
              } Calma lá meu patrão! Aguarde **${rateLimit}** segundos antes de usar este comando novamente. - ${
                message.author
              }\n\n${
                number === 1
                  ? "*Você conhece o painel de configuração do Nevis? Venha conhecer clicando [aqui](https://nevis.website/dashboard)*"
                  : ""
              }${
                number === 2
                  ? "*Você pode dar uma olhadinha na nossa página do tog.gg (e votar em mim, claro) [aqui](https://aindanao)*"
                  : ""
              }`
            )
            .then((s) => {
              message.delete().catch(() => {});
              setTimeout(() => {
                s.delete().catch(() => {});
              }, 4000);
            })
            .catch(() => {});

        if (command.botPermission) {
          const missingPermissions = message.channel
            .permissionsFor(message.guild.me)
            .missing(command.botPermission)
            .map((p) => permissions[p]);

          if (missingPermissions.length !== 0) {
            const embed = new MessageEmbed()
              .setAuthor(
                `${this.client.user.tag}`,
                message.client.user.displayAvatarURL({ dynamic: true })
              )
              .setTitle(`<:wrong:822376943763980348> Não tenho permissão :(`)
              .setDescription(
                `Comando: **${
                  command.name
                }**\nPermissão necessária: **${missingPermissions
                  .map((p) => `${p}`)
                  .join(" - ")}**`
              )
              .setTimestamp()
              .setFooter("https://nevis.website")
              .setColor(message.guild.me.displayHexColor);
            return message.channel.sendCustom(embed).catch(() => {});
          }
        }

        if (command.userPermission) {
          const missingPermissions = message.channel
            .permissionsFor(message.author)
            .missing(command.userPermission)
            .map((p) => permissions[p]);
          if (missingPermissions.length !== 0) {
            const embed = new MessageEmbed()
              .setAuthor(
                `${message.author.tag}`,
                message.author.displayAvatarURL({ dynamic: true })
              )
              .setTitle(`<:wrong:822376943763980348> Você não tem permissão!`)
              .setDescription(
                `Comando: **${
                  command.name
                }**\nPermissão necessária: **${missingPermissions
                  .map((p) => `${p}`)
                  .join("\n")}**`
              )
              .setTimestamp()
              .setFooter("https://nevis.website")
              .setColor(message.guild.me.displayHexColor);
            return message.channel.sendCustom(embed).catch(() => {});
          }
        }
        if (disabledCommands.includes(command.name || command)) return;

        if (command.ownerOnly) {
          if (!this.client.config.developers.includes(message.author.id))
            return;
        }

        if (metricsEnabled) metrics.increment("commands_served");

        if (command.disabled)
          return message.channel.sendCustom(
            `Este comando foi desabilitado pelos menus desenvolvedores. Para mais informações acesse o meu [discord](${config.discord}).`
          );

        await this.runCommand(message, cmd, args).catch((error) => {
          return this.client.emit("commandError", error, message, cmd);
        });
      }
    } catch (error) {
      return this.client.emit("fatalError", error, message);
    }
  }

  async runCommand(message, cmd, args) {
    if (
      !message.channel.permissionsFor(message.guild.me) ||
      !message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")
    )
      return message.channel.sendCustom(
        `${message.client.emoji.fail} Não tenho permissão :(`
      );

    const command =
      this.client.botCommands.get(cmd.toLowerCase()) ||
      this.client.botCommands.get(this.client.aliases.get(cmd.toLowerCase()));
    logger.info(
      `"${message.author.tag}" (${message.author.id}) usou o comando "${message.content}" (${command.name}) no servidor "${message.guild.name}" (${message.guild.id}) no canal "#${message.channel.name}" (${message.channel.id})`,
      { label: "Comandos" }
    );

    await command.run(message, args);
  }

  ratelimit(message, cmd) {
    try {
      const command =
        this.client.botCommands.get(cmd.toLowerCase()) ||
        this.client.botCommands.get(this.client.aliases.get(cmd.toLowerCase()));
      if (message.author.permLevel > 4) return false;

      const cooldown = command.cooldown * 1000;
      const ratelimits = this.ratelimits.get(message.author.id) || {}; // get the ENMAP first.
      if (!ratelimits[command.name])
        ratelimits[command.name] = Date.now() - cooldown; // see if the command has been run before if not, add the ratelimit
      const difference = Date.now() - ratelimits[command.name]; // easier to see the difference
      if (difference < cooldown) {
        // check the if the duration the command was run, is more than the cooldown
        return moment
          .duration(cooldown - difference)
          .format("D [dias], H [horas], m [minutos], s [segundos]", 1); // returns a string to send to a channel
      } else {
        ratelimits[command.name] = Date.now(); // set the key to now, to mark the start of the cooldown
        this.ratelimits.set(message.author.id, ratelimits); // set it
        return true;
      }
    } catch (e) {
      this.client.emit("fatalError", e, message);
    }
  }
};
