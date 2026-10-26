package com.aziz.tvmouse;

import android.view.KeyEvent;

/** The key, or key combination, that turns mouse mode on and off. */
final class Trigger {

    static final int COMBO = 0;  // two keys together
    static final int SINGLE = 1; // one short press
    static final int LONG = 2;   // one long press
    static final int DOUBLE = 3; // two quick presses

    static final Trigger DEFAULT = new Trigger(COMBO, KeyEvent.KEYCODE_DPAD_CENTER, KeyEvent.KEYCODE_DPAD_LEFT);

    final int type;
    final int key1;
    final int key2;

    Trigger(int type, int key1, int key2) {
        this.type = type;
        this.key1 = key1;
        this.key2 = key2;
    }

    String encode() {
        return type + ":" + key1 + ":" + key2;
    }

    static Trigger decode(String s) {
        if (s == null) {
            return DEFAULT;
        }
        try {
            String[] p = s.split(":");
            Trigger t = new Trigger(Integer.parseInt(p[0]), Integer.parseInt(p[1]), Integer.parseInt(p[2]));
            return t.validate() == null ? t : DEFAULT;
        } catch (RuntimeException e) {
            return DEFAULT;
        }
    }

    String describe() {
        switch (type) {
            case COMBO:
                return KeyNames.name(key1) + " + " + KeyNames.name(key2) + " (birlikte basın)";
            case SINGLE:
                return KeyNames.name(key1) + " (bir kez basın)";
            case LONG:
                return KeyNames.name(key1) + " (1 saniye basılı tutun)";
            default:
                return KeyNames.name(key1) + " (iki kez hızlı basın)";
        }
    }

    /** Returns an error text if this trigger would break normal use of the remote, or null. */
    String validate() {
        if (key1 == KeyEvent.KEYCODE_UNKNOWN || (type == COMBO && (key2 == KeyEvent.KEYCODE_UNKNOWN || key1 == key2))) {
            return "Tuş tanınmadı. Başka bir tuş deneyin.";
        }
        if (type < COMBO || type > DOUBLE) {
            return "Geçersiz seçim.";
        }
        if (type == SINGLE && (KeyNames.isNavigation(key1) || key1 == KeyEvent.KEYCODE_BACK
                || key1 == KeyEvent.KEYCODE_HOME)) {
            return KeyNames.name(key1) + " tuşu normal kullanım için gereklidir. Tek basış ile seçilemez.\n\n"
                    + "Başka bir tuş seçin (örnek: Profil, TV, Ayarlar). Veya iki tuşa birlikte basın.";
        }
        if (type == LONG && KeyNames.isNavigation(key1)) {
            return KeyNames.name(key1) + " tuşunda uzun basma normal kullanım için gereklidir.\n\n"
                    + "Başka bir tuş seçin. Veya iki tuşa birlikte basın.";
        }
        if (type == DOUBLE && KeyNames.isArrow(key1)) {
            return "Yön tuşuna iki kez basmak normal gezinmedir. Bu seçim kazara devreye girer.\n\n"
                    + "Başka bir tuş seçin. Veya iki tuşa birlikte basın.";
        }
        return null;
    }

    /** Returns a note about side effects, or null. */
    String warning() {
        if (type == SINGLE) {
            return "Not: " + KeyNames.name(key1) + " tuşunun normal işlevi artık çalışmaz.";
        }
        if (type == LONG && !KeyNames.canReplay(key1)) {
            return "Not: " + KeyNames.name(key1) + " tuşuna kısa basınca normal işlevi çalışmaz.";
        }
        if (type == DOUBLE) {
            return "Not: İlk basış normal çalışır. İkinci hızlı basış fare modunu açar veya kapatır.";
        }
        return null;
    }
}
