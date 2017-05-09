package com.kerrishotts.example.isprime;

import java.util.ArrayList;
import java.util.concurrent.BlockingQueue;
import java.util.List;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.annotation.SuppressLint;


/**
* This class exposes methods in Cordova that can be called from JavaScript.
*/
public class IsPrime extends CordovaPlugin {

    public static final int START_THREADS = 4;
    public static final int MAX_THREADS = 8;
    public static final int KEEP_ALIVE = 1000;


    private InspectableThreadPoolExecutor _pool;
    private BlockingQueue<Runnable> _q;
    private ArrayList<Runnable> _pausedTasks;

    private void _initPool() {

        _q = new ArrayBlockingQueue<Runnable>(MAX_THREADS);
        _pool = new InspectableThreadPoolExecutor(START_THREADS, MAX_THREADS, KEEP_ALIVE, TimeUnit.MILLISECONDS, _q);
    }

    private void _destroyPool() {
        if (_pool != null) {
            _pool.shutdownNow();
        }
    }

    private void _pausePool() {
        _pausedTasks = new ArrayList<Runnable>(MAX_THREADS);
        _pausedTasks.addAll(_pool.getAllTasks());
        _pool.shutdownNow();
    }

    private void _restartPool() {
        _initPool();
        Runnable[] arr = _pausedTasks.toArray(new Runnable[0]);
        for (int i = 0; i < arr.length; i++) {
            _pool.execute(((IsPrimeRunnable)arr[i]).copy());
        }

        _pausedTasks = null;
    }

    @Override
    public void initialize(org.apache.cordova.CordovaInterface cordova, org.apache.cordova.CordovaWebView webView) {
        super.initialize(cordova, webView);
        _initPool();
    }

    @Override
    public void onDestroy() {
        _destroyPool();
    }

    public void onReset() {
        _destroyPool();
        _initPool();
        if (_q != null) {
            _q = null;
        }
    }

    @Override
    public void onPause(boolean multitasking) {
        _pausePool();
    }

    @Override
    public void onResume(boolean multitasking) {
        _restartPool();
    }

     /**
     * Executes the request and returns PluginResult.
     *
     * @param action            The action to execute.
     * @param args              JSONArry of arguments for the plugin.
     * @param callbackContext   The callback context from which we were invoked.
     */
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
        _pool.execute(new IsPrimeRunnable(result, callbackContext));
    }
}
