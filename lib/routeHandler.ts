/**
 * This module contains methods to handle various routes supported by the server.
 */

/**
 * Imports
 */
import http from 'http'
import nock from 'nock'
import { collectBody, writeErrorResponse } from './utilities'
import WeM2kMockDef from './wem2kMockDef'

class RouteHandler {
  private remoteTarget: string
  private actions: {[httpMethod: string]: (req: http.IncomingMessage, res: http.ServerResponse) => void} = {
    POST: (req: http.IncomingMessage, res: http.ServerResponse) => {
      const url = req.url.replace(/\/?(\?[^\?\/]+)?$/, '')
      if (url === '/wem2k/v1/update') {
        collectBody(req, (formattedBody: string) => {
          try {
            const bodyObj = JSON.parse(formattedBody)
            if (bodyObj.body === undefined) {
              bodyObj.body = /.*/
            }
            this.addMock(bodyObj)
            res.writeHead(204)
            res.end()
          } catch (e) {
            writeErrorResponse(res, 422, 'Could not process request. Invalid mock definition.')
          }
        })
      } else {
        writeErrorResponse(res, 404, `${req.method} ${req.url} did not match any WeM2k routes.`)
      }
    },
  }

  /**
   * @param remoteTarget The URI to the response generator.
   */
  constructor(remoteTarget: string) {
    this.remoteTarget = remoteTarget
  }

  /**
   * This function is used to add a mock.
   * @param mockDef
   */
  addMock(mockDef: WeM2kMockDef): nock.Scope[] {
    (mockDef as nock.NockDefinition).scope = this.remoteTarget
    return nock.define([mockDef as nock.NockDefinition])
  }

  /**
   * @param req
   * @returns boolean The boolean value that represents if an endpoint received is a WeM2k endpoint.
   */
  isWeM2kRoute(url: string): boolean {
    return /^\/wem2k($|\/)/.test(url)
  }

  /**
   * @param req
   * @param res
   * @returns void
   */
  route(req: http.IncomingMessage, res: http.ServerResponse): void {
    const action = this.actions[req.method]
    if (action) {
      action(req, res)
    } else {
      writeErrorResponse(res, 404, `${req.method} ${req.url} did not match any WeM2k routes.`)
    }
  }
}

export = RouteHandler
