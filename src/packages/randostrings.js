module.exports = class randoStrings {
  password(option) {
    if (!option) {
      var length = 12,
        charset =
          "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$&*()'%-+=/",
        retVal = "";
      for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
      }
      return retVal;
    }

    if (option) {
      if (!option.string)
        option.string =
          "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$&*()'%-+=/";
      if (!option.length) option.length = 12;

      (length = option.length), (charset = option.string), (retVal = "");
      for (i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
      }
      return retVal;
    }
  }

  captcha(option) {
    if (!option) {
      var length = 5,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
        retVal = "";
      for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
      }
      return retVal;
    }

    if (option) {
      if (!option.string)
        option.string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      if (!option.length) option.length = 5;

      (length = option.length), (charset = option.string), (retVal = "");
      for (i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
      }
      return retVal;
    }
  }

  numberGenerator(option) {
    if (!option.min)
      throw new Error(
        "GERADOR DE NÚMERO - Você não especificou um valor mínimo. Está confuso? Entre no nosso discord: https://discord.gg/DDejTvt46r"
      );
    if (!option.max)
      throw new Error(
        "GERADOR DE NÚMERO - Você não especificou um valor máximo. Está confuso? Entre no nosso discord: https://discord.gg/DDejTvt46r"
      );
    if (isNaN(option.min))
      throw new Error(
        "GERADOR DE NÚMERO - O valor mínimo informado não é um número.  Está confuso? Entre no nosso discord: https://discord.gg/DDejTvt46r"
      );
    if (isNaN(option.max))
      throw new Error(
        "GERADOR DE NÚMERO - O valor mínimo informado não é um número. Está confuso? Entre no nosso discord: https://discord.gg/DDejTvt46r"
      );
    if (option.min > option.max)
      throw new Error(
        "GERADOR DE NÚMERO - O valor mínimo informado é maior que o valor máximo. Está confuso? Entre no nosso discord: https://discord.gg/DDejTvt46r"
      );

    let min = (option.min = Math.ceil(option.min));
    let max = (option.max = Math.floor(option.max));
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};
