package com.kerrishotts.example.isprime;

import java.util.Calendar;
import java.util.GregorianCalendar;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.annotation.SuppressLint;
import android.util.Base64;

public class IsPrime extends CordovaPlugin {

    @SuppressLint("NewApi")
    @Override
    public boolean execute(String action, final JSONArray args, final CallbackContext callbackContext) throws JSONException {
        if ("isPrime".equals(action)) {
            this.isPrime(args.getJSONObject(0), callbackContext);
        } else {
            return false;
        }
        return true;
    }
    private void isPrime(final JSONObject result, final CallbackContext callbackContext) throws JSONException {
        cordova.getThreadPool().execute(new Runnable() {
            public void run() {
                try {
                    JSONArray factors = result.getJSONArray("factors");
                    long candidate = result.getLong("candidate");
                    long half = candidate / 2;
                    long now = (new GregorianCalendar()).getTimeInMillis();
                    long cur = now;

                    if (candidate == 2) { // [1]
                        result.put("progress", 100);
                        result.put("complete", true);
                        result.put("isPrime", true);
                    } else {
                        factors.put(1); // [2a]
                        for (long i = 2; i<=half; i++) {
                            if (i % 1000 == 0) {
                                result.put("progress", ((double)i / (double)half) * 100);
                                cur = (new GregorianCalendar()).getTimeInMillis();
                                if (cur - now > 1000) { // [3]
                                    now = cur;
                                    // [4]
                                    PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, result);
                                    // [5]
                                    pluginResult.setKeepCallback(true);
                                    // [6]
                                    callbackContext.sendPluginResult(pluginResult);
                                }
                            }
                            if ((candidate % i) == 0) {
                                factors.put(i);
                            }
                        }
                        if (factors.length() == 1) {
                            result.put("isPrime", true);
                            factors.remove(0); // [2b]
                        } else {
                            factors.put(candidate);
                        }
                    }
                    result.put("progress", 100);
                    result.put("complete", true);
                    // [4]
                    PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, result);
                    // [6]
                    callbackContext.sendPluginResult(pluginResult);

                } catch (JSONException e) {
                    callbackContext.error("JSON Exception; check that the JS API is passing the right result object");
                }
            }
        });
    }
}