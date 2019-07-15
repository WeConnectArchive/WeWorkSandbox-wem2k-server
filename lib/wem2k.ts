/**
 * This module controls how we use [nock](http://github.com/nock/nock) and defines the methods that
 * are made available to the `serverConfig` file.
 */

/**
 * Imports
 */
import * as jwt from 'jwt-simple';
import nock from 'nock';
import * as UUID from './UUIDUtils';

/**
 * The WeM2k class controls how the server handles mocking and sets up methods that can be used in
 * the `serverConfig` file.
 */
class WeM2k {
  private remoteTarget: string;
  private enableNetConnect: boolean;

  /**
   * @param remoteTarget The URI to the response generator.
   * @param enableNetConnect This controls how the server handles un-mocked calls. If it is set to
   * true the server will forward un-mocked calls to the responseGenerator. If it is set to false
   * the server will reply with an error for un-mocked calls.
   */
  constructor(remoteTarget: string, enableNetConnect: boolean) {
    this.remoteTarget = remoteTarget;
    this.enableNetConnect = enableNetConnect;
  }

  /**
   * This function is used to abstract nock from end users.
   * @param options
   * @returns scope
   */
  public mock(options: nock.Options = { allowUnmocked: this.enableNetConnect }): nock.Scope {
    const scope = nock(this.remoteTarget, options);
    return scope;
  }

  /**
   * This function is used to create a JWT (JSON Web Token) for authentication.  It requires
   * WE_AUTH_PRIVATE_KEY to be set to a valid RS256 private key in the environment.
   * @param payload
   * @returns an encoded JWT
   */
  public makeJWT(payload: object): string {
    const encodedJWT = jwt.encode(payload, process.env.WE_AUTH_PRIVATE_KEY, 'RS256');
    return encodedJWT;
  }

  /**
   * This function is used to create a token transform for authentication.
   * @param uuid in any format
   * @returns base64 encoded raw UUID, or empty string for invalid inputs.
   */
  public networkEncodeUUID(uuid: string): string {
      const rawUUID = UUID.sanitizeUUID(uuid);
      return !rawUUID ? '' : UUID.encodeUUID(rawUUID);
  }
}

export = WeM2k;
