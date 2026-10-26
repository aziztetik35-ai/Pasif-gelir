package com.aziz.tvmouse;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.GestureDescription;
import android.content.res.Configuration;
import android.graphics.PixelFormat;
import android.graphics.Path;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.util.DisplayMetrics;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.WindowManager;
import android.view.accessibility.AccessibilityEvent;
import android.widget.Toast;

/**
 * Accessibility service that shows a mouse cursor on Android TV.
 *
 * Toggle: hold OK and press LEFT (or hold LEFT and press OK).
 * Mouse mode: arrows move the cursor, OK clicks, long OK is a long press,
 * CH+/CH- scroll, and pushing the cursor against a screen edge scrolls.
 */
public class MouseService extends AccessibilityService {

    private static final int LEFT = 0;
    private static final int RIGHT = 1;
    private static final int UP = 2;
    private static final int DOWN = 3;

    private static final long LONG_PRESS_MS = 600;
    private static final long TICK_MS = 16;
    private static final long EDGE_SCROLL_INTERVAL_MS = 400;

    private static MouseService instance;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private WindowManager windowManager;
    private CursorView cursor;
    private boolean mouseMode;

    private int screenW = 1920;
    private int screenH = 1080;
    private float unit = 1f;
    private float x;
    private float y;

    // Key state. "consumed" tells if this service ate the DOWN event, so the UP event gets the same result.
    private boolean okDown;
    private boolean okConsumed;
    private long okDownTime;
    private boolean comboFired;
    private final boolean[] dirDown = new boolean[4];
    private final boolean[] dirConsumed = new boolean[4];

    private long moveStart;
    private long lastEdgeScroll;

    private final Runnable mover = new Runnable() {
        @Override
        public void run() {
            if (!mouseMode || !anyDirHeld()) {
                return;
            }
            float held = Math.min((SystemClock.uptimeMillis() - moveStart) / 1000f, 1.5f);
            float step = (5f + held * 18f) * unit;
            float dx = 0;
            float dy = 0;
            if (dirDown[LEFT]) dx -= step;
            if (dirDown[RIGHT]) dx += step;
            if (dirDown[UP]) dy -= step;
            if (dirDown[DOWN]) dy += step;

            int edge = -1;
            if (dx < 0 && x <= 0) edge = LEFT;
            else if (dx > 0 && x >= screenW - 1) edge = RIGHT;
            else if (dy < 0 && y <= 0) edge = UP;
            else if (dy > 0 && y >= screenH - 1) edge = DOWN;

            moveTo(x + dx, y + dy);

            long now = SystemClock.uptimeMillis();
            if (edge >= 0 && now - lastEdgeScroll >= EDGE_SCROLL_INTERVAL_MS) {
                lastEdgeScroll = now;
                scroll(edge);
            }
            handler.postDelayed(this, TICK_MS);
        }
    };

    public static MouseService get() {
        return instance;
    }

    public boolean isMouseMode() {
        return mouseMode;
    }

    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        instance = this;
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        readScreen();
        x = screenW / 2f;
        y = screenH / 2f;
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        // Not used. The service only needs key filtering, gestures and the overlay.
    }

    @Override
    public void onInterrupt() {
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        readScreen();
        moveTo(x, y);
        if (cursor != null) {
            cursor.setScale(1.4f * unit);
        }
    }

    @Override
    public void onDestroy() {
        hideCursor();
        handler.removeCallbacksAndMessages(null);
        if (instance == this) {
            instance = null;
        }
        super.onDestroy();
    }

    @Override
    protected boolean onKeyEvent(KeyEvent e) {
        int code = e.getKeyCode();
        boolean down = e.getAction() == KeyEvent.ACTION_DOWN;
        boolean first = down && e.getRepeatCount() == 0;

        if (isOk(code)) {
            return handleOk(e, down, first);
        }

        int dir = toDir(code);
        if (dir >= 0) {
            return handleArrow(dir, down, first);
        }

        if (mouseMode && (code == KeyEvent.KEYCODE_CHANNEL_UP || code == KeyEvent.KEYCODE_PAGE_UP)) {
            if (first) scroll(UP);
            return true;
        }
        if (mouseMode && (code == KeyEvent.KEYCODE_CHANNEL_DOWN || code == KeyEvent.KEYCODE_PAGE_DOWN)) {
            if (first) scroll(DOWN);
            return true;
        }
        return false;
    }

    private boolean handleOk(KeyEvent e, boolean down, boolean first) {
        if (first) {
            okDown = true;
            okDownTime = e.getEventTime();
            if (dirDown[LEFT]) {
                // LEFT is held and OK comes now: toggle. Eat this OK so nothing gets clicked.
                comboFired = true;
                okConsumed = true;
                toggle();
                return true;
            }
            okConsumed = mouseMode;
            return okConsumed;
        }
        if (down) {
            return okConsumed;
        }

        okDown = false;
        boolean consumed = okConsumed;
        okConsumed = false;
        if (comboFired) {
            if (!dirDown[LEFT]) comboFired = false;
            return true;
        }
        if (consumed && mouseMode) {
            tap(e.getEventTime() - okDownTime >= LONG_PRESS_MS);
        }
        return consumed;
    }

    private boolean handleArrow(int dir, boolean down, boolean first) {
        if (first) {
            dirDown[dir] = true;
            if (dir == LEFT && okDown) {
                // OK is held and LEFT comes now: toggle. Also eat the OK release so nothing gets clicked.
                comboFired = true;
                okConsumed = true;
                dirConsumed[dir] = true;
                toggle();
                return true;
            }
            dirConsumed[dir] = mouseMode;
            if (mouseMode) {
                startMove(dir);
            }
            return dirConsumed[dir];
        }
        if (down) {
            return dirConsumed[dir];
        }

        dirDown[dir] = false;
        boolean consumed = dirConsumed[dir];
        dirConsumed[dir] = false;
        if (dir == LEFT && comboFired && !okDown) {
            comboFired = false;
        }
        return consumed;
    }

    public void toggle() {
        setMouseMode(!mouseMode);
    }

    public void setMouseMode(boolean on) {
        if (on == mouseMode) {
            return;
        }
        mouseMode = on;
        handler.removeCallbacks(mover);
        if (on) {
            readScreen();
            moveTo(x, y);
            showCursor();
        } else {
            hideCursor();
        }
        Toast.makeText(this, on ? "Fare modu: AÇIK" : "Fare modu: KAPALI", Toast.LENGTH_SHORT).show();
    }

    private void startMove(int dir) {
        moveStart = SystemClock.uptimeMillis();
        // First small step now, so a short press moves the cursor a little.
        float step = 8f * unit;
        float dx = dir == LEFT ? -step : dir == RIGHT ? step : 0;
        float dy = dir == UP ? -step : dir == DOWN ? step : 0;
        moveTo(x + dx, y + dy);
        handler.removeCallbacks(mover);
        handler.postDelayed(mover, 150);
    }

    private void moveTo(float nx, float ny) {
        x = Math.max(0, Math.min(screenW - 1, nx));
        y = Math.max(0, Math.min(screenH - 1, ny));
        if (cursor != null) {
            cursor.setPosition(x, y);
        }
    }

    private void tap(boolean longPress) {
        Path path = new Path();
        path.moveTo(x, y);
        GestureDescription.StrokeDescription stroke =
                new GestureDescription.StrokeDescription(path, 0, longPress ? 1000 : 60);
        dispatchGesture(new GestureDescription.Builder().addStroke(stroke).build(), null, null);
        if (cursor != null) {
            cursor.flash();
        }
    }

    /** Scrolls the content in the given direction with a swipe gesture. */
    private void scroll(int dir) {
        float sx;
        float sy;
        float ex;
        float ey;
        if (dir == UP || dir == DOWN) {
            sx = ex = clamp(x, screenW * 0.1f, screenW * 0.9f);
            float a = screenH * 0.35f;
            float b = screenH * 0.65f;
            sy = dir == DOWN ? b : a;
            ey = dir == DOWN ? a : b;
        } else {
            sy = ey = clamp(y, screenH * 0.1f, screenH * 0.9f);
            float a = screenW * 0.35f;
            float b = screenW * 0.65f;
            sx = dir == RIGHT ? b : a;
            ex = dir == RIGHT ? a : b;
        }
        Path path = new Path();
        path.moveTo(sx, sy);
        path.lineTo(ex, ey);
        GestureDescription.StrokeDescription stroke = new GestureDescription.StrokeDescription(path, 0, 250);
        dispatchGesture(new GestureDescription.Builder().addStroke(stroke).build(), null, null);
    }

    private void showCursor() {
        if (cursor != null || windowManager == null) {
            return;
        }
        cursor = new CursorView(this);
        cursor.setScale(1.4f * unit);
        cursor.setPosition(x, y);
        WindowManager.LayoutParams lp = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
                        | WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE
                        | WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN
                        | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
                        | WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
                PixelFormat.TRANSLUCENT);
        lp.gravity = Gravity.TOP | Gravity.START;
        try {
            windowManager.addView(cursor, lp);
        } catch (RuntimeException ex) {
            cursor = null;
        }
    }

    private void hideCursor() {
        if (cursor != null && windowManager != null) {
            try {
                windowManager.removeView(cursor);
            } catch (RuntimeException ignored) {
                // The window is already gone.
            }
        }
        cursor = null;
    }

    @SuppressWarnings("deprecation")
    private void readScreen() {
        if (windowManager == null) {
            return;
        }
        DisplayMetrics dm = new DisplayMetrics();
        windowManager.getDefaultDisplay().getRealMetrics(dm);
        if (dm.widthPixels > 0 && dm.heightPixels > 0) {
            screenW = dm.widthPixels;
            screenH = dm.heightPixels;
        }
        unit = Math.max(screenW, screenH) / 1920f;
    }

    private boolean anyDirHeld() {
        return dirDown[LEFT] || dirDown[RIGHT] || dirDown[UP] || dirDown[DOWN];
    }

    private static boolean isOk(int code) {
        return code == KeyEvent.KEYCODE_DPAD_CENTER
                || code == KeyEvent.KEYCODE_ENTER
                || code == KeyEvent.KEYCODE_NUMPAD_ENTER;
    }

    private static int toDir(int code) {
        switch (code) {
            case KeyEvent.KEYCODE_DPAD_LEFT:
                return LEFT;
            case KeyEvent.KEYCODE_DPAD_RIGHT:
                return RIGHT;
            case KeyEvent.KEYCODE_DPAD_UP:
                return UP;
            case KeyEvent.KEYCODE_DPAD_DOWN:
                return DOWN;
            default:
                return -1;
        }
    }

    private static float clamp(float v, float min, float max) {
        return Math.max(min, Math.min(max, v));
    }
}
