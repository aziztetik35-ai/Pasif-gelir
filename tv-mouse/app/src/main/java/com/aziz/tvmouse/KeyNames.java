package com.aziz.tvmouse;

import android.view.KeyEvent;

/** Turkish names for remote control keys. */
final class KeyNames {

    private KeyNames() {
    }

    static String name(int code) {
        switch (code) {
            case KeyEvent.KEYCODE_DPAD_CENTER: return "OK";
            case KeyEvent.KEYCODE_ENTER: return "OK (Enter)";
            case KeyEvent.KEYCODE_NUMPAD_ENTER: return "Enter";
            case KeyEvent.KEYCODE_DPAD_LEFT: return "Sol ok";
            case KeyEvent.KEYCODE_DPAD_RIGHT: return "Sağ ok";
            case KeyEvent.KEYCODE_DPAD_UP: return "Yukarı ok";
            case KeyEvent.KEYCODE_DPAD_DOWN: return "Aşağı ok";
            case KeyEvent.KEYCODE_BACK: return "Geri";
            case KeyEvent.KEYCODE_HOME: return "Ana ekran";
            case KeyEvent.KEYCODE_MENU: return "Menü";
            case KeyEvent.KEYCODE_SETTINGS: return "Ayarlar";
            case KeyEvent.KEYCODE_VOLUME_UP: return "Ses +";
            case KeyEvent.KEYCODE_VOLUME_DOWN: return "Ses −";
            case KeyEvent.KEYCODE_VOLUME_MUTE: return "Sessiz";
            case KeyEvent.KEYCODE_CHANNEL_UP: return "Kanal ^";
            case KeyEvent.KEYCODE_CHANNEL_DOWN: return "Kanal v";
            case KeyEvent.KEYCODE_PAGE_UP: return "Sayfa yukarı";
            case KeyEvent.KEYCODE_PAGE_DOWN: return "Sayfa aşağı";
            case KeyEvent.KEYCODE_TV: return "TV";
            case KeyEvent.KEYCODE_GUIDE: return "Rehber";
            case KeyEvent.KEYCODE_TV_INPUT: return "Kaynak";
            case KeyEvent.KEYCODE_SEARCH: return "Arama";
            case KeyEvent.KEYCODE_VOICE_ASSIST: return "Mikrofon";
            case KeyEvent.KEYCODE_ASSIST: return "Asistan";
            case KeyEvent.KEYCODE_PROFILE_SWITCH: return "Profil";
            case KeyEvent.KEYCODE_ALL_APPS: return "Uygulamalar";
            case KeyEvent.KEYCODE_INFO: return "Bilgi";
            case KeyEvent.KEYCODE_BOOKMARK: return "Yer imi";
            case KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE: return "Oynat/Duraklat";
            case KeyEvent.KEYCODE_MEDIA_PLAY: return "Oynat";
            case KeyEvent.KEYCODE_MEDIA_PAUSE: return "Duraklat";
            case KeyEvent.KEYCODE_MEDIA_STOP: return "Durdur";
            case KeyEvent.KEYCODE_MEDIA_NEXT: return "Sonraki";
            case KeyEvent.KEYCODE_MEDIA_PREVIOUS: return "Önceki";
            case KeyEvent.KEYCODE_MEDIA_FAST_FORWARD: return "İleri sar";
            case KeyEvent.KEYCODE_MEDIA_REWIND: return "Geri sar";
            case KeyEvent.KEYCODE_PROG_RED: return "Kırmızı";
            case KeyEvent.KEYCODE_PROG_GREEN: return "Yeşil";
            case KeyEvent.KEYCODE_PROG_YELLOW: return "Sarı";
            case KeyEvent.KEYCODE_PROG_BLUE: return "Mavi";
            default:
                if (code >= KeyEvent.KEYCODE_0 && code <= KeyEvent.KEYCODE_9) {
                    return "Rakam " + (code - KeyEvent.KEYCODE_0);
                }
                String s = KeyEvent.keyCodeToString(code);
                return s.startsWith("KEYCODE_") ? s.substring(8) : s;
        }
    }

    static boolean isArrow(int code) {
        return code == KeyEvent.KEYCODE_DPAD_LEFT || code == KeyEvent.KEYCODE_DPAD_RIGHT
                || code == KeyEvent.KEYCODE_DPAD_UP || code == KeyEvent.KEYCODE_DPAD_DOWN;
    }

    static boolean isOk(int code) {
        return code == KeyEvent.KEYCODE_DPAD_CENTER || code == KeyEvent.KEYCODE_ENTER
                || code == KeyEvent.KEYCODE_NUMPAD_ENTER || code == KeyEvent.KEYCODE_BUTTON_SELECT;
    }

    /** Maps all OK key codes to DPAD_CENTER, so remotes that send ENTER or SELECT work the same. */
    static int normalize(int code) {
        return isOk(code) ? KeyEvent.KEYCODE_DPAD_CENTER : code;
    }

    /** Arrows and OK. */
    static boolean isNavigation(int code) {
        return isArrow(code) || isOk(code);
    }

    /** True if the service can do the normal short-press action of this key itself. */
    static boolean canReplay(int code) {
        return code == KeyEvent.KEYCODE_BACK || code == KeyEvent.KEYCODE_HOME
                || code == KeyEvent.KEYCODE_SETTINGS;
    }
}
