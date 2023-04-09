module.exports = {
  name: "ajuda",
  description: "Mostra os comandos do bot.",
  category: "general",
  slash: "true",
  global: true,
  error: async () => {},
  run: async (data) => {
    data.interaction.editReply({
      content: `Ainda estamos trabalhando nos SlashCommands, avisaremos quando estiver disponível. Enquanto isso, você pode usar o comando **n!ajuda** para ver meus comandos.`,
    });
  },
};
