module.exports = class Command {
  constructor(client, name, options = {}) {
    this.client = client;
    this.name = options.name || name;
    this.aliases = options.aliases || [];
    this.description = options.description || "Nenhuma descrição fornecida.";
    this.category = options.category || "Geral";
    this.usage = `${this.name} ${options.usage || ""}` || "Nenhum modo de uso fornecido.";
    this.examples = options.examples || [];
    this.disabled = options.disabled || false;
    this.cooldown = "cooldown" in options ? options.cooldown : 5 || 5;
    this.ownerOnly = options.ownerOnly || false;
    this.guildOnly = options.guildOnly || false;
    this.botPermission = options.botPermission || [
      "SEND_MESSAGES",
      "EMBED_LINKS",
    ];
    this.userPermission = options.userPermission || null;
  }

  // eslint-disable-next-line no-unused-vars
  async run(message, args) {
    throw new Error(`O método run não foi implementado em ${this.name}`);
  }

  reload() {
    return this.store.load(this.file.path);
  }
};
