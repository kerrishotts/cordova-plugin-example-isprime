function isPrime(successFn, failureFn, args) {
    var result = args[0], candidate = result.candidate;
    /* magic! calculate if candidate is prime */
    successFn(result);
}

module.exports = { isPrime: isPrime };

require("cordova/exec/proxy").add("IsPrime", module.exports);
