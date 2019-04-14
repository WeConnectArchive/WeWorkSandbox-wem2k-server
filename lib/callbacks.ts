/**
 * The modules contains callbacks that we use across the server code
 */

/**
 * Generic callback
 */
export type Callback<T> = (result?: T) => void;

/**
 * ErrorCallback
 */
export type ErrorCallback = Callback<Error>;
