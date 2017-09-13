const fetch = require.requireActual('node-fetch');

const protocolRe = /^https?:/;

module.exports = (url, config) => {
  if (protocolRe.test(url)) {
    return fetch(url, config);
  }
  return fetch(`http://localhost${url}`, config);
};