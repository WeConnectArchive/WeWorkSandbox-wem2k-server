/**
 * This module contains methods that we use for handling http requests and responses.
 */

import http from 'http'

/**
 * @param req
 * @param callback
 * @returns void
 */
export function collectBody(req: http.IncomingMessage, callback: any): void {
  let body = ''
  req.on('data', (chunk) => {
    body += chunk
  })
  req.on('end', () => {
    callback(body)
  })
}

/**
 * @param res
 * @param statusCode
 * @param message The error message
 * @returns void
 */
export function writeErrorResponse(res: http.ServerResponse, statusCode: number, message: string): void {
  res.writeHead(statusCode)
  res.write(JSON.stringify({ message }))
  res.end()
}
