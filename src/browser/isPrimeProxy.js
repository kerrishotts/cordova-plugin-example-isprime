function isPrime(successFn, failureFn, args) {
    var result = args[0],
        candidate = result.candidate,
        half = Math.floor(candidate / 2);
    for (var i = 2; i <= half; i++) {
        result.progress = ((i + 1) / half) * 100;
        if (candidate % i === 0) {
            result.factors.push(i);
        }
        if (i % 1000) {
            successFn(result, {keepCallback: true});  // post progress
        }
    }
    result.complete = true;
    result.progress = 100;
    result.isPrime = result.factors.length === 0;
    if (!result.isPrime) {
        result.factors.push(candidate); // we can divide by ourselves
        result.factors.unshift(1);      // and by one
    }
    successFn(result);
}

module.exports = {
    isPrime: isPrime
};

require("cordova/exec/proxy").add("IsPrime", module.exports);