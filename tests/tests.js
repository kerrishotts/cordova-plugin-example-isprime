function runChecks(tests) {
    Object.keys(tests).forEach(function (key) {
        var expectedResult = tests[key];
        it("Checking " + key + (typeof expectedResult === "string" ? " has factors " + expectedResult : " is a prime"), function (done) {
            try {
                cordova.plugins.kas.isPrime(function win(result) {
                    if (typeof expectedResult === "string") {
                        expect(result.isPrime).toBe(false);
                        expect(result.factors.join(", ")).toBe(expectedResult);
                    } else {
                        expect(result.isPrime).toBe(expectedResult);
                    }
                    done();
                }, function fail(err) {
                    expect("this should never happen").toBe("but it did:" + JSON.stringify(err));
                    done();
                }, Number(key));
            } catch (err) {
                expect("this is embarrasing").toBe(err.message);
                done();
            }
        }, 120000);
    });
}
exports.defineAutoTests = function () {
    describe("IsPrime (cordova.plugins.kas.isPrime)", function () {
        it("should exist", function () {
            expect(cordova.plugins.kas.isPrime).toBeDefined();
        });
        it("should be a function", function () {
            expect(typeof cordova.plugins.kas.isPrime === "function").toBe(true);
        });
        it("should throw with no arguments", function() {
            expect(function() {
                cordova.plugins.kas.isPrime();
            }).toThrowError("Success callback must be a function");
        });
        it("should throw if callbacks aren't functions", function() {
            expect(function() {
                cordova.plugins.kas.isPrime(undefined, function() {}, 23);
            }).toThrowError("Success callback must be a function");
            expect(function() {
                cordova.plugins.kas.isPrime(function() {}, undefined, 23);
            }).toThrowError("Failure callback must be a function");
        });
        it("should throw if candidate isn't a number", function() {
            expect(function() {
                cordova.plugins.kas.isPrime(function() {}, function() {}, "23");
            }).toThrowError("Candidate must be a number");
        });
        it("should return a Promise if given one argument that is a number", function() {
            expect(cordova.plugins.kas.isPrime(23) instanceof Promise).toBe(true);
        });

        var moreFailures = {
            "-10": "Candidate must be a positive whole number greater than 1",
            "1": "Candidate must be a positive whole number greater than 1",
            "2.54": "Candidate must be an integer",
            "1152921504606847000": "Candidate must be within JavaScript's safe integer limit of 2^53-1",
        };
        Object.keys(moreFailures).forEach(function(key) {
            var candidate = Number(key),
                expectedError = moreFailures[key];
            it("(cb) " + key + " should throw " + expectedError, function() {
                expect(function() {
                    cordova.plugins.kas.isPrime(function() {}, function() {}, candidate);
                }).toThrowError(expectedError);
            });
            it("(promise) " + key + " should throw " + expectedError, function(done) {
                cordova.plugins.kas.isPrime(candidate)
                    .catch(function(err) {
                        expect(err.message).toBe(expectedError);
                        done();
                    });
            });
        });
    });

    describe("Quick Tests", function () {
        var tests = {
            2: true,
            3: true,
            4: "1, 2, 4",
            5: true,
            6: "1, 2, 3, 6",
            7: true,
            8: "1, 2, 4, 8",
            9: "1, 3, 9",
            10: "1, 2, 5, 10",
            11: true,
            12: "1, 2, 3, 4, 6, 12",
            13: true,
            14: "1, 2, 7, 14",
            15: "1, 3, 5, 15",
            49: "1, 7, 49",
        };
        runChecks(tests);
    });

    describe("Longer tests", function () {
        var tests = {
            1301081: true,
            12354962: "1, 2, 6177481, 12354962",
            179402471: true,
            6801534321: "1, 3, 41, 123, 55297027, 165891081, 2267178107, 6801534321"
        };
        runChecks(tests);
    });
}

exports.defineManualTests = function (contentEl, createActionButton) {
    var actionsDiv = [
        "<h2>Actions</h2>",
        "<p>Click a button to run a test</p>",
        "<div id='simple'></div>"
    ].join("");
    function renderActions() {
        contentEl.innerHTML = actionsDiv;
    }
    // We need to wrap this code due to Windows security restrictions
    // see http://msdn.microsoft.com/en-us/library/windows/apps/hh465380.aspx#differences for details
    if (window.MSApp && window.MSApp.execUnsafeLocalFunction) {
        MSApp.execUnsafeLocalFunction(renderActions);
    } else {
        renderActions();
    }
    createActionButton("Is 49 Prime?", function () {
        cordova.plugins.kas.isPrime(49)
            .then(function (result) {
                alert(result.isPrime);
            }).catch(function (err) {
                alert("Error: " + err.message);
            });
    }, "simple");
}