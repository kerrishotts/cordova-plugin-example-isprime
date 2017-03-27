/* global cordova:false */
/* globals window */

var exec = cordova.require('cordova/exec'),
    utils = cordova.require('cordova/utils'),
    SERVICE = "IsPrime";

module.exports = function isPrime(successFn, failureFn, candidate) {
    // check callback types; if we have only one parameter
    // and it isn't a function, we assume the user wants to
    // use promises
    if (typeof successFn === "number" && typeof failureFn === "undefined" &&
        typeof candidate === "undefined") {
        if (typeof Promise === "undefined") {
            throw new Error("Native promises aren't supported in this environment");
        }
        return new Promise(function (resolve, reject) {
            try {
                isPrime(resolve, reject, successFn);    // successFn is the candidate number
            } catch (err) {
                reject(err);
            }
        });
    }

    // ensure the parameters are of the correct types
    if (typeof successFn !== "function") {
        throw new Error("Success callback must be a function");
    }
    if (typeof failureFn !== "function") {
        throw new Error("Failure callback must be a function");
    }
    if (typeof candidate !== "number") {
        throw new Error("Candidate must be a number");
    }

    // now ensure that candidate is valid for checking as a prime number
    if (candidate < 2) {
        throw new Error("Candidate must be a positive whole number greater than 1");
    }
    if (candidate > Math.pow(2, 53) - 1) {
        throw new Error("Candidate must be within JavaScript's safe integer limit of 2^53-1");
    }
    if (candidate !== Math.floor(candidate)) {
        throw new Error("Candidate must be an integer");
    }

    // build our result object; the native side will return results into this
    // same structure
    var result = {
        isPrime: false,
        candidate: candidate,
        factors: []
    };

    // pass our request over the bridge
    exec(successFn, failureFn, SERVICE, "isPrime", [result]);
};
