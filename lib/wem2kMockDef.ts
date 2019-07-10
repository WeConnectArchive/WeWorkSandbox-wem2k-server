/**
 * This module contains Wem2kMockDef that we use to define mocks added on the fly.
 */

/**
 * Interface that represents on the fly mock definition
 */

interface Wem2kMockDef {
    method: string;
    path: string;
    port?: number | string;
    response?: any;
    status?: number;
    body?: any;
}

export = Wem2kMockDef;
