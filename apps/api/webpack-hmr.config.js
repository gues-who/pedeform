/* eslint-disable @typescript-eslint/no-var-requires */
const { composePlugins, withNx } = require('@nx/webpack');

// Se você não está usando Nx, mas quer garantir que pacotes locais sejam bundleados:
// NestJS standard webpack config:
module.exports = function (options) {
  return {
    ...options,
    externals: [], // Não considere nada como externo, fure o bundle inteiro! (Exceto talvez se necessário)
  };
};
