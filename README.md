# cordova-plugin-example-isprime




Determines if a number is prime, and if not, returns the factors.

> **IMPORTANT:** This plugin was developed for PhoneGap Day EU 2017's "Creating a Modern PhoneGap Plugin" workshop as an example. This is not intended for use in production applications! There are far better and faster ways to check candidate primes!

## Platforms

Supported on iOS, Android, Windows, and browser platforms.

> **Note:** iOS, Android, and Windows gain the benefit of faster computations. In order for the browser and Windows apps to remain responsive, the computations are batched in smaller portions.

> **Windows:** When running on Windows 10, you'll need to specify the platform (e.g., `cordova run windows --archs=x64`)

## Installation

To install, use one of two methods:

* `cordova plugin add [--save] cordova-plugin-example-isprime`
* Add the following to your `config.xml`:

    ```xml
    <plugin name="cordova-plugin-example-isprime"/>
    ```

    > **Note:** This will retrieve the latest version of the plugin should you later remove it (or use with PhoneGap Build). You may wish to pin to a specific version using the `spec` attribute.

## Usage

You can use one of two patterns to check if a number is prime:

* Typical callback pattern
    ```javascript
    cordova.plugins.kas.isPrime(win, fail, 7);
    function win(result) {
        if (result.complete) {
            if (result.isPrime) {
                console.log(result.candidate + " is prime!");
            } else {
                console.log(result.candidate + " has factors " + result.factors);
            }
        } else {
            // calculation ongoing; progress is 0 - 100
            console.log(result.progress);
        }
    }
    function fail(err) {
        console.log("error: " + err);
    }
    ```

* Promise pattern (if supported by the environment)
    ```javascript
    cordova.plugins.kas.isPrime(7)
    .then(function(result) {
        if (result.isPrime) {
            console.log(result.candidate + " is prime!");
        } else {
            console.log(result.candidate + " has factors " + result.factors);
        }
    }).catch(function(err) {
        console.log("error: " + err);
    });

    > **Note:** If you need progress reports, pass a function as the second parameter; i.e., `cordova.plugins.kas.isPrime(7, progressFn)`

Interim and completion results passed to the success callback look like this:

```typescript
{
    candidate: Number,                  // the requested candidate
    complete: Boolean,                  // true if the calculation is complete
    factors: Array<Number>              // factors of the candidate if NOT prime
    isPrime: Boolean,                   // indicates if the candidate is prime
    progress: Number,                   // indicates progress of the calculation (0-100)
}
```

**Note:** do **not** count on intermediate progress reports being made; different platforms report at different intervals, and there may not be a report prior to the completion report.

The following errors can be thrown (when using `Promises`, they are propagated to your `catch` handler):

* "Native promises aren't supported in this environment" &mdash; API was called using the Promise pattern, but Promises aren't available in this environment. **Note:** this is the only error that is actually _thrown_ when using the Promise pattern; all others are passed to your `catch` handler.
* "Success callback must be a function" &mdash; You must supply a function that can be called upon completion of the calculation when not using the Promise pattern.
* "Failure callback must be a function" &mdash; although rare, some platforms can generate native-side errors; you need to supply a failure function to handle these errors when not using the Promise pattern.
* "Candidate must be a positive whole number greater than 1" &mdash; Primes are not defined for any numbers less than 2.
* "Candidate must be within JavaScript's safe integer limit of 2^53-1" &mdash; Attempting to calculate primes beyond this limit could yield incorrect results. Because of this, no calculation is attempted.
* "Candidate must be an integer" &mdash; Primes are only defined for whole numbers.
* "JSON Exception; check that the JS API is passing the right result object" (Android) &mdash; This error should never occur. If it does, please contact the plugin developer.

## Important Notes

* Calculations are processed in background threads on iOS and Android. These calculations **do not** stop if the webview is navigated. This is left as an exercise to the reader.
* Calculations on the Browser platform are much slower in order to avoid blocking the webview.
* Be careful with the size of primes passed; you may end up with a computation that takes quite some time.
* Do remember &mdash; this plugin can't check primality of any number greater than 2^53-1.

## Testing

You can run the tests by executing the following commands:

```
$ npm run test:android
$ npm run test:browser
$ npm run test:ios
$ npm run test:windows
```

> **Note:** You must have appropriate SDK installed in order to run the corresponding tests. If testing Windows apps, you must **NOT** be logged in as an administrator.

## License

MIT.
