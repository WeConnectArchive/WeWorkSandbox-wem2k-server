import config from 'config';
import debug from 'debug';
import httpProxy from 'http-proxy';
import nock from 'nock';
import WeM2k from './wem2k';

let responseGeneratorUrl: string;
const port: string = config.get('port');

if (config.has('responseGenerator')) {
  responseGeneratorUrl = config.get('responseGenerator');
} else {
  responseGeneratorUrl = 'http://example.com';
}

global.WeM2k = new WeM2k(responseGeneratorUrl);

if (config.has('serverConfig')) {
  require(config.get('serverConfig'));
  debug('nock.mocks')(`${nock.pendingMocks()}`);
}

const proxyServer = httpProxy.createProxyServer({
  changeOrigin: true,
  selfHandleResponse: false,
  target: responseGeneratorUrl,
});

debug('wem2k')('listening on port %s', port);
proxyServer.listen(+port);
