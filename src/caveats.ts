/// <reference path="./@types/is-subset.d.ts" />

import { JsonRpcMiddleware } from 'json-rpc-engine';
import { isSubset } from './@types/is-subset';
import { IOcapLdCaveat } from './@types/ocap-ld'
import { unauthorized } from './errors';
const isSubset = require('is-subset');

export type ICaveatFunction = JsonRpcMiddleware;

export type ICaveatFunctionGenerator = (caveat:IOcapLdCaveat) => ICaveatFunction;

/*
 * Filters params shallowly.
 * MVP caveats with lots of room for enhancement later.
 */
export const filterParams: ICaveatFunctionGenerator = function filterParams(serialized: IOcapLdCaveat) {
  const { value } = serialized;
  return (req, res, next, end) => {
    const permitted = isSubset(req.params, value);

    if (!permitted) {
      res.error = unauthorized({ data: req });
      return end(res.error);
    }

    next();
  }
}

/*
 * Filters array results shallowly.
 * MVP caveat for signing in with accounts.
 * Lots of room for enhancement later.
 */
export const filterResponse: ICaveatFunctionGenerator = function filterResponse(serialized: IOcapLdCaveat) {
  const { value } = serialized;
  return (_req, res, next, _end) => {

    next((done) => {
      if (Array.isArray(res.result)) {
        res.result = res.result.filter((item) => {
          return value.includes(item);
        })
      }
      done();
    });
  }
}

/*
 * Forces the method to be called with given params
 */
export const forceParams: ICaveatFunctionGenerator = function forceParams(serialized: IOcapLdCaveat) {
  const { value } = serialized;
  return (req, _, next) => {
      req.params = [ ...value ]
      next();
  };
}
