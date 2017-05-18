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

import android.annotation.SuppressLint;

/**
* This class exposes methods in Cordova that can be called from JavaScript.
*/
public class IsPrime extends CordovaPlugin {

    /**
    * Executes the request and returns PluginResult.
    *
    * @param action            The action to execute.
    * @param args              JSONArry of arguments for the plugin.
    * @param callbackContext   The callback context from which we were invoked.
    */
    @SuppressLint("NewApi")
    @Override
    public boolean execute(String action, final JSONArray args, final CallbackContext callbackContext)
            throws JSONException {
        if ("isPrime".equals(action)) {
            this.isPrime(args.getJSONObject(0), callbackContext);
        } else {
            return false;
        }
        return true;
    }

    private void isPrime(JSONObject result, CallbackContext callbackContext) throws JSONException {
        /* magic incantation: determine if candidate is prime */
        PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, result);
        callbackContext.sendPluginResult(pluginResult);
    }
}
