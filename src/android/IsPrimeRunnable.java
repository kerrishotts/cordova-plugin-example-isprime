package com.kerrishotts.example.isprime;

import java.util.GregorianCalendar;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class IsPrimeRunnable implements Runnable {

    private final JSONObject _result;
    private final CallbackContext _context;
    private volatile long _lastCandidateFactor = 0;

    public IsPrimeRunnable(final JSONObject result, final CallbackContext callbackContext) {
        _result = result;
        _context = callbackContext;
        _lastCandidateFactor = 2; // this is where we start checking -- not one or zero.
    }
    private IsPrimeRunnable(final JSONObject result, final CallbackContext callbackContext, long lastCandidateFactor) {
        _result = result;
        _context = callbackContext;
        _lastCandidateFactor = lastCandidateFactor; // start from last checked candidate
    }

    public IsPrimeRunnable copy() {
        return new IsPrimeRunnable(_result, _context, _lastCandidateFactor);
    }

    public void run() {
        try {
            JSONArray factors = _result.getJSONArray("factors");
            long candidate = _result.getLong("candidate");
            long half = candidate / 2;
            long now = (new GregorianCalendar()).getTimeInMillis();
            long cur = now;
            long start = _lastCandidateFactor;

            if (candidate == 2) {
                _result.put("progress", 100);
                _result.put("complete", true);
                _result.put("isPrime", true);
            } else {
                // we are divisible by ourselves
                if (start <= 2) {
                    factors.put(1);
                }
                // if we were only interested in testing primality, we could get by
                // with sqrt(candidate), but since we want the factors, we have to
                // go up to candidate/2.
                for (long i = start; i<=half; i++) {
                    if (i % 1000 == 0) {
                        _result.put("progress", ((double)i / (double)half) * 100);
                        cur = (new GregorianCalendar()).getTimeInMillis();
                        if (cur - now > 1000) {
                            now = cur;
                            PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, _result);
                            pluginResult.setKeepCallback(true);
                            _context.sendPluginResult(pluginResult);
                        }

                        // check if we've been interrupted
                        if (Thread.currentThread().isInterrupted()) {
                            throw new InterruptedException();
                        }
                    }
                    if ((candidate % i) == 0) {
                        factors.put(i);
                    }
                    _lastCandidateFactor = i;
                }
                if (factors.length() == 1) {
                    // no factors, so we're prime
                    _result.put("isPrime", true);
                    // since we're prime, clear out factors
                    factors.remove(0);
                } else {
                    // we are divisible by ourselves as well
                    factors.put(candidate);
                }
            }
            _result.put("progress", 100);
            _result.put("complete", true);
            PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, _result);
            _context.sendPluginResult(pluginResult);
        } catch (JSONException e) {
            _context.error("JSON Exception; check that the JS API is passing the right result object");
        } catch (InterruptedException e) {
            // do nothing; we'll get taken care of later
        }
    }
}