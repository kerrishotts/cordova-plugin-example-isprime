/* global IsPrimeRuntimeComponent, require, module */
function isPrime(successFn, failureFn, args) {
    var result = args[0],
        candidate = result.candidate,
        half = Math.floor(candidate / 2),
        batchSize = 100000,
        cur = 2;

    setTimeout(function runBatch() {
        var results = IsPrimeRuntimeComponent.IsPrimeRT.batch(candidate, cur, batchSize, half);
        cur = Math.min(half + 1, cur + batchSize);
        if (results && results.length > 0) {
            result.factors = result.factors.concat(Array.from(results));
        }
        result.progress = (cur / half) * 100;
        if (!cur || cur > half) {
            result.complete = true;
            result.progress = 100;
            result.isPrime = result.factors.length === 0;
            if (!result.isPrime) {
                result.factors.push(candidate); // we can divide by ourselves
                result.factors.unshift(1);      // and by one
            }
            successFn(result);
        } else {
            successFn(result, { keepCallback: true });  // post progress
            setTimeout(runBatch, 0);
        }
    }, 0);
}

module.exports = {
    isPrime: isPrime
};

require("cordova/exec/proxy").add("IsPrime", module.exports);
