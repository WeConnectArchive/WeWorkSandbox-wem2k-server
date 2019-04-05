import config from 'config';
import debug from 'debug';
import httpProxy from 'http-proxy';
import nock from 'nock';
import WeM2k from './wem2k';

let responseGeneratorUrl: string;
const port: string = config.get('port');

if (config.has('targetServer')) {
  responseGeneratorUrl = config.get('targetServer');
} else {
  responseGeneratorUrl = 'http://example.com';
}

global.WeM2k = new WeM2k(responseGeneratorUrl);

if (config.has('mockConfig')) {
  require(config.get('mockConfig'));
  debug('wem2k')(`nock.pendingMocks(): ${nock.pendingMocks()}`);
}

const proxyServer = httpProxy.createProxyServer({
  changeOrigin: true,
  selfHandleResponse: false,
  target: responseGeneratorUrl,
});

proxyServer.listen(+port);
