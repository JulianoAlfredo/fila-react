const path = require('path');

module.exports = function override(config, env) {
  // Configuração para desenvolvimento
  if (env === 'development') {
    config.devServer = {
      ...config.devServer,
      allowedHosts: 'all',
      // Alternativas para versões mais antigas:
      // disableHostCheck: true, // Para webpack-dev-server v3
      // host: '0.0.0.0', // Permite acesso externo
    };
  }
  
  return config;
};