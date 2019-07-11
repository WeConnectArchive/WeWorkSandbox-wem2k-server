/**
 * This module contains methods to handle various routes supported by the server.
 */
import nock from 'nock';
import WeM2kMockDef from './wem2kMockDef';

class RouteHandler {
  private responseGenerator: string;

  /**
   * @param responseGenerator The URI to the response generator.
   */
  constructor(responseGenerator: string) {
    this.responseGenerator = responseGenerator;
  }

  /**
   * This function is used to add a mock.
   * @param mockDef defines the mock to be added
   */
  public addMock(mockDef: WeM2kMockDef): nock.Scope[] {
    (mockDef as nock.NockDefinition).scope = this.responseGenerator;
    return nock.define([mockDef as nock.NockDefinition]);
  }
}

export = RouteHandler;
