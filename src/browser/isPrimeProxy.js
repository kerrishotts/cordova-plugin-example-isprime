function isPrimeBatch(result, startAt, batchSize, endAt) {
    var stopAt = Math.min(startAt + batchSize - 1, endAt),
        candidate = result.candidate;
    if (candidate === 2) {
        return;
    }
    for (var i = startAt; i <= stopAt; i++) {
        if ((candidate % i) === 0) {
            result.factors.push(i);
        }
    }
    result.progress = ((i + 1) / endAt) * 100;
    return i + 1;
}

function isPrime(successFn, failureFn, args) {
    var result = args[0],
        candidate = result.candidate,
        half = Math.floor(candidate / 2),
        batchSize = 10000,
        cur = 2;

    setTimeout(function runBatch() {
        cur = isPrimeBatch(result, cur, batchSize, half);
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
            successFn(result, {keepCallback: true});  // post progress
            setTimeout(runBatch, 0);
        }
    }, 0);
}

module.exports = {
    isPrime: isPrime
};

require("cordova/exec/proxy").add("IsPrime", module.exports);