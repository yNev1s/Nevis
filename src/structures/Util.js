const fs = require("fs").promises;
const path = require("path");
const Command = require("./Command.js");
const Event = require("./Event.js");

module.exports = class Util {
  constructor(client) {
    this.client = client;
  }

  isClass(input) {
    return (
      typeof input === "function" &&
      typeof input.prototype === "object" &&
      input.toString().substring(0, 5) === "class"
    );
  }

  trimArray(arr, maxLen = 10) {
    if (arr.length > maxLen) {
      const len = arr.length - maxLen;
      arr = arr.slice(0, maxLen);
      arr.push(`${len} more...`);
    }
    return arr;
  }

  get directory() {
    return `${path.dirname(require.main.filename)}${path.sep}`;
  }

  removeDuplicates(arr) {
    return [...new Set(arr)];
  }

  capitalise(string) {
    return string
      .split(" ")
      .map((str) => str.slice(0, 1).toUpperCase() + str.slice(1))
      .join(" ");
  }

  async *loadFiles(dir) {
    const files = await fs.readdir(dir);
    for (const file of files) {
      const pathToFile = path.join(dir, file);
      const isDirectory = (await fs.stat(pathToFile)).isDirectory();
      if (isDirectory) {
        yield* this.loadFiles(pathToFile);
      } else {
        yield pathToFile;
      }
    }
  }

  async loadCommands() {
    for await (const commandFile of this.loadFiles(
      `${this.directory}src/commands`
    )) {
      delete require.cache[commandFile];
      const { name } = path.parse(commandFile);
      const File = require(commandFile);
      if (!this.isClass(File))
        throw new TypeError(`O comando ${name} não exporta uma class.`);
      const command = new File(this.client, name.toLowerCase());
      if (!(command instanceof Command))
        throw new TypeError(`O comando ${name} não pertence à categoria Comandos.`);
      this.client.botCommands.set(command.name, command);

      if (command.aliases.length) {
        for (const alias of command.aliases) {
          this.client.aliases.set(alias, command.name);
        }
      }
    }
  }

  async loadEvents() {
    for await (const eventFile of this.loadFiles(
      `${this.directory}src/events`
    )) {
      delete require.cache[eventFile];
      const { name } = path.parse(eventFile);
      const File = require(eventFile);
      if (!this.isClass(File))
        throw new TypeError(`O evento ${name} não exporta uma class.`);
      const event = new File(this.client, name);
      if (!(event instanceof Event))
        throw new TypeError(`O evento ${name} não pertence à categoria Eventos.`);
      this.client.botEvents.set(event.name, event);
      //logger.info(`✅ loaded: ${event.name}`, { label: 'Events' })
      event.emitter[event.type](name, (...args) => event.run(...args));
    }
  }
};
