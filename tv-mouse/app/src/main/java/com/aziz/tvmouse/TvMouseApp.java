package com.aziz.tvmouse;

import android.app.Application;

import java.io.File;
import java.io.FileWriter;
import java.io.PrintWriter;

/** Writes the last crash to a file, so the setup screen can show it. */
public class TvMouseApp extends Application {

    public static final String CRASH_FILE = "last_crash.txt";

    @Override
    public void onCreate() {
        super.onCreate();
        final Thread.UncaughtExceptionHandler previous = Thread.getDefaultUncaughtExceptionHandler();
        Thread.setDefaultUncaughtExceptionHandler(new Thread.UncaughtExceptionHandler() {
            @Override
            public void uncaughtException(Thread t, Throwable e) {
                try (PrintWriter w = new PrintWriter(new FileWriter(new File(getFilesDir(), CRASH_FILE)))) {
                    e.printStackTrace(w);
                } catch (Exception ignored) {
                    // Nothing more to do here.
                }
                if (previous != null) {
                    previous.uncaughtException(t, e);
                }
            }
        });
    }
}
