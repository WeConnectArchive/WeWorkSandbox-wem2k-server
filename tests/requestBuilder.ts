import { IConfig } from 'config'
import request from 'request'
import * as cb from '../lib/callbacks'

export interface RBResponse {
  response: request.Response
  body: any
}

/**
 * This is a test utility to build requests as Promises against localhost.
 */
export class RequestBuilder {
  private baseURI: string
  /**
   * @param config The configuration settings must contain a `port` setting.
   */
  constructor(config: IConfig) {
    this.baseURI = 'http://localhost:' + config.get('port')
  }

  /**
   * Construct a request against localhost.
   * @param httpMethod
   * @param path The URI path.
   * @returns The [[RBResponse]] as a Promise.
   */
  request(httpMethod: string, path: string, requestBody?: string): Promise<RBResponse> {
    return new Promise((resolve: cb.Callback<RBResponse>, reject: cb.ErrorCallback) => {
      request({
        body: requestBody,
        method: httpMethod,
        timeout: 500,
        uri: this.baseURI + path,
      }, (error: any, response: request.Response, body: any): void  => {
        if (error) {
          return reject(error)
        }
        return resolve({response, body})
      })
    })
  }
}
