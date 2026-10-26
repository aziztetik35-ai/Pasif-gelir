package com.aziz.tvmouse;

import android.content.Context;
import android.content.SharedPreferences;

/** User settings. The service and the setup screen share them. */
final class Prefs {

    static final String FILE = "settings";

    static final String TRIGGER = "trigger";
    static final String SPEED = "speed";
    static final String SIZE = "size";
    static final String CLICK = "click";
    static final String AUTO_HIDE = "auto_hide";
    static final String AUTO_OFF = "auto_off";
    static final String EDGE_SCROLL = "edge_scroll";
    static final String MESSAGES = "messages";

    static final String[] SPEED_LABELS = {"Yavaş", "Normal", "Hızlı", "Çok hızlı"};
    static final float[] SPEED_VALUES = {0.6f, 1f, 1.6f, 2.3f};
    static final String[] SIZE_LABELS = {"Küçük", "Normal", "Büyük", "Çok büyük"};
    static final float[] SIZE_VALUES = {1f, 1.5f, 2.1f, 2.8f};

    static final int CLICK_AUTO = 0;
    static final int CLICK_TOUCH = 1;
    static final int CLICK_NODE = 2;
    static final String[] CLICK_LABELS = {
            "Otomatik (önerilen)", "Sadece dokunma hareketi", "Sadece erişilebilirlik tıklaması"};

    static final String[] AUTO_OFF_LABELS = {"Kapalı", "1 dakika", "5 dakika", "15 dakika"};
    static final long[] AUTO_OFF_MS = {0, 60_000, 300_000, 900_000};

    final SharedPreferences sp;

    Prefs(Context c) {
        sp = c.getApplicationContext().getSharedPreferences(FILE, Context.MODE_PRIVATE);
    }

    Trigger trigger() {
        return Trigger.decode(sp.getString(TRIGGER, null));
    }

    int speed() {
        return index(SPEED, 1, SPEED_VALUES.length);
    }

    int size() {
        return index(SIZE, 1, SIZE_VALUES.length);
    }

    int click() {
        return index(CLICK, CLICK_AUTO, CLICK_LABELS.length);
    }

    int autoOff() {
        return index(AUTO_OFF, 0, AUTO_OFF_MS.length);
    }

    boolean autoHide() {
        return sp.getBoolean(AUTO_HIDE, true);
    }

    boolean edgeScroll() {
        return sp.getBoolean(EDGE_SCROLL, true);
    }

    boolean messages() {
        return sp.getBoolean(MESSAGES, true);
    }

    void setTrigger(Trigger t) {
        sp.edit().putString(TRIGGER, t.encode()).apply();
    }

    /** Moves an option to its next value and wraps at the end. */
    void cycle(String key, int count) {
        int def = key.equals(SPEED) || key.equals(SIZE) ? 1 : 0;
        sp.edit().putInt(key, (index(key, def, count) + 1) % count).apply();
    }

    void toggle(String key) {
        sp.edit().putBoolean(key, !sp.getBoolean(key, defaultOn(key))).apply();
    }

    void reset() {
        sp.edit().clear().apply();
    }

    private static boolean defaultOn(String key) {
        return key.equals(AUTO_HIDE) || key.equals(EDGE_SCROLL) || key.equals(MESSAGES);
    }

    private int index(String key, int def, int count) {
        int v = sp.getInt(key, def);
        return v >= 0 && v < count ? v : def;
    }
}
