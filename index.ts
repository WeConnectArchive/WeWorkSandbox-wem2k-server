import httpProxy from 'http-proxy';
import config from 'config';
require('./wem2k');

let targetServer: string;
let port: string = config.get('port');
if(config.has('responseGenerator')) {
	targetServer = config.get('responseGenerator');
} else {
	targetServer = 'http://example.com'
}
if(config.has('serverConfig')){
	require(config.get('serverConfig'));
}

let proxyServer = httpProxy.createProxyServer({
	changeOrigin: true,
	selfHandleResponse: false,
	target: targetServer,
  });
proxyServer.listen(+port);

