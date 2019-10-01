import express from 'express'
import http from 'http'
import * as cb from '../lib/callbacks'

/**
 * This class lets you construct a server with static responses.
 */
class StaticServer {
  private server: http.Server
  private port: number

  /**
   * Initialize the static server. See the express documentation for more information.
   * @param port
   * @param config Configure the server with a callback that accepts an express app.
   * #### Example Configuration
   * ```typescript
   * let server = new StaticServer(1234, (app: express.Express) => {
   *   app.get('/route1', (_: express.Request, res: express.Response) => {
   *    res.status(200).send('Some static test');
   *   })
   * })
   * ```
   */
  constructor(port: number, config: (app: express.Express) => void ) {
    const app = express()
    config(app)
    this.server = http.createServer(app)
    this.port = port
  }

  /**
   * Start the server.
   * @returns The http.Server as a Promise.
   */
  start(): Promise<http.Server> {
    return new Promise((resolve: cb.Callback<http.Server>, reject: cb.ErrorCallback) => {
      this.server.on('listening', () => {
        resolve(this.server)
      })
      this.server.on('error', reject)
      this.server.listen(this.port)
    })
  }
  /**
   * Stop the server.
   * @returns The http.Server as a Promise.
   */
  stop(): Promise<http.Server> {
    return new Promise((resolve: cb.Callback<http.Server>, reject: cb.ErrorCallback) => {
      this.server.close((err?: Error) => {
        if (err) {
          return reject(err)
        }
        return resolve(this.server)
      })
    })
  }
}

export = StaticServer
