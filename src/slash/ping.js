module.exports = {
  name: "ping",
  description: "Ver o ping da API do bot!",
  category: "general",
  slash: "true",
  global: true,
  error: async () => {},
  run: async (data) => {
    data.interaction.editReply({
      content: `Ping: \`${Math.floor(
        data.interaction.client.ws.ping
      )} ms\``,
    });
  },
};
