/* global cordova:false */
/* globals window, Promise */

var exec = cordova.require("cordova/exec"),
    SERVICE = "IsPrime";

function tick(fn, thisArg) {
    return function() {
        setTimeout(fn.apply(thisArg, arguments), 0);
    };
}

/**
 * Checks if a candidate is prime, and if not, returns the factors.
 *
 * Return result is of the form
 *
 * {
 *     candidate: Number,               Candidate being checked
 *     complete: Boolean,               If true, calculation is finished
 *     factors: Array<Number>,          Array of factors
 *     isPrime: Boolean,                If true, the candidate is prime
 *     progress: Number                 Progress of calculation (1-100)
 * }
 *
 * @param {function|Number} successFn           success callback, or candidate if using promises
 * @param {function} [failureFn]                failure callback, or progress function if using promises
 * @param {Number} [candidate]                  candidate number to check for primality
 * @returns {void|Promise}                      returns a promise when using promises; otherwise void
 */
module.exports = function isPrime(successFn, failureFn, candidate) {
    // check callback types; if we have only one parameter
    // and it isn't a function, we assume the user wants to
    // use promises
    if (typeof successFn === "number" && typeof candidate === "undefined") {
        if (typeof Promise === "undefined") {
            throw new Error("Native promises aren't supported in this environment");
        }
        var progressFn = failureFn;     // args are shifted in promise mode
        return new Promise(function (resolve, reject) {
            try {
                isPrime(function(result) {
                    if (typeof progressFn === "function") {
                        progressFn(result);
                    }
                    if (result.complete) {
                        resolve(result);
                    }
                }, reject, successFn);    // successFn is the candidate number
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
        factors: [],
        progress: 0,
        complete: false
    };

    // pass our request over the bridge
    // tick is just in case someone tries to alert or otherwise block on iOS
    exec(tick(successFn), tick(failureFn), SERVICE, "isPrime", [result]);
};
