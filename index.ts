/**
 * This is the entry point to the server. It simply loads the server settings and starts the mocking
 * server.
 */

/**
 * Imports
 */
import config from 'config';
import Server from './lib/server';
const mockServer = new Server(config);
mockServer.start();
