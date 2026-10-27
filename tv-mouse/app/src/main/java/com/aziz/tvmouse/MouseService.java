package com.aziz.tvmouse;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.GestureDescription;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.graphics.PixelFormat;
import android.graphics.Path;
import android.graphics.Rect;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.provider.Settings;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.WindowManager;
import android.view.accessibility.AccessibilityEvent;
import android.view.accessibility.AccessibilityNodeInfo;
import android.view.accessibility.AccessibilityWindowInfo;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Accessibility service that shows a mouse cursor on Android TV.
 *
 * The user selects the on/off key in the setup screen (default: OK + LEFT together).
 * Mouse mode: arrows move the cursor, OK clicks, long OK is a long press,
 * CH+/CH- scroll, the screen edges scroll, and a 1 second BACK press always leaves mouse mode.
 */
public class MouseService extends AccessibilityService
        implements SharedPreferences.OnSharedPreferenceChangeListener {

    /** Gets the result of a key recording. */
    public interface RecordListener {
        void onRecorded(Trigger trigger);

        void onRecordTimeout();
    }

    /** Gets mouse mode changes. */
    public interface StateListener {
        void onMouseModeChanged(boolean on);
    }

    private static final String TAG = "TvMouse";

    private static final int LEFT = 0;
    private static final int RIGHT = 1;
    private static final int UP = 2;
    private static final int DOWN = 3;

    private static final long CLICK_LONG_MS = 600;
    private static final long TRIGGER_LONG_MS = 800;
    private static final long DOUBLE_MS = 400;
    private static final long BACK_EXIT_MS = 1000;
    private static final long HELD_STALE_MS = 5000;
    private static final long TICK_MS = 16;
    private static final long EDGE_SCROLL_MS = 450;
    private static final long HIDE_MS = 5000;
    private static final long RECORD_TIMEOUT_MS = 15000;
    private static final long FOCUS_TAKE_MS = 400;
    private static final long RETRY_CLICK_MS = 2500;
    private static final float RETRY_CLICK_PX = 30f;
    private static final float LARGE_NODE_PART = 0.12f;

    private static MouseService instance;
    private static StateListener stateListener;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private WindowManager windowManager;
    private CursorView cursor;
    private Prefs prefs;
    private boolean mouseMode;

    // Cached settings.
    private Trigger trigger = Trigger.DEFAULT;
    private float speed = 1f;
    private float size = 1.5f;
    private int clickMode = Prefs.CLICK_AUTO;
    private boolean autoHide = true;
    private long autoOffMs;
    private boolean edgeScroll = true;
    private boolean messages = true;

    private int screenW = 1920;
    private int screenH = 1080;
    private float unit = 1f;
    private float x;
    private float y;

    // Key state.
    /** Keys that are physically down now, with the time of their DOWN event. */
    private final Map<Integer, Long> held = new HashMap<>();
    /** Keys whose remaining events (repeats and UP) this service eats without action. */
    private final Set<Integer> swallow = new HashSet<>();
    /** Keys whose DOWN the mouse mode used. Their UP also goes to the mouse mode. */
    private final Set<Integer> mouseKeys = new HashSet<>();
    /** Keys whose DOWN went to the app. Their UP must go to the app too. */
    private final Set<Integer> passed = new HashSet<>();
    /** A small focusable window. While it has the focus, Android cancels the keys held in the app. */
    private View focusTaker;

    // Trigger state.
    private boolean longFired;
    private long doubleDownTime;
    private long doubleLastUp = -1;

    // Mouse mode state.
    private final boolean[] dirDown = new boolean[4];
    private long okDownTime;
    private boolean backExited;
    private long moveStart;
    private long lastEdgeScroll;
    private long lastClickTime;
    private float lastClickX;
    private float lastClickY;
    private boolean lastClickWasNode;

    private Recorder recorder;

    private final Runnable mover = new Runnable() {
        @Override
        public void run() {
            if (!mouseMode || !anyDirDown()) {
                return;
            }
            float held = Math.min((SystemClock.uptimeMillis() - moveStart) / 1000f, 1.5f);
            float step = (5f + held * 18f) * unit * speed;
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
            userActive();

            long now = SystemClock.uptimeMillis();
            if (edge >= 0 && edgeScroll && now - lastEdgeScroll >= EDGE_SCROLL_MS) {
                lastEdgeScroll = now;
                scroll(edge);
            }
            handler.postDelayed(this, TICK_MS);
        }
    };

    private final Runnable longTrigger = new Runnable() {
        @Override
        public void run() {
            longFired = true;
            toggle();
        }
    };

    private final Runnable backExit = new Runnable() {
        @Override
        public void run() {
            backExited = true;
            setMouseMode(false);
        }
    };

    private final Runnable hideCursor = new Runnable() {
        @Override
        public void run() {
            if (cursor != null) {
                cursor.setVisibility(View.INVISIBLE);
            }
        }
    };

    private final Runnable releaseFocus = new Runnable() {
        @Override
        public void run() {
            removeWindow(focusTaker);
            focusTaker = null;
        }
    };

    private final Runnable autoOff = new Runnable() {
        @Override
        public void run() {
            setMouseMode(false);
        }
    };

    public static MouseService get() {
        return instance;
    }

    public static void setStateListener(StateListener listener) {
        stateListener = listener;
    }

    public boolean isMouseMode() {
        return mouseMode;
    }

    // ---------------------------------------------------------------- lifecycle

    @Override
    protected void onServiceConnected() {
        super.onServiceConnected();
        instance = this;
        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        prefs = new Prefs(this);
        prefs.sp.registerOnSharedPreferenceChangeListener(this);
        loadPrefs();
        readScreen();
        x = screenW / 2f;
        y = screenH / 2f;
    }

    @Override
    public void onAccessibilityEvent(AccessibilityEvent event) {
        // Not used. The service reads the screen only when the user clicks or scrolls.
    }

    @Override
    public void onInterrupt() {
    }

    @Override
    public boolean onUnbind(Intent intent) {
        shutdown();
        return super.onUnbind(intent);
    }

    @Override
    public void onDestroy() {
        shutdown();
        super.onDestroy();
    }

    private void shutdown() {
        mouseMode = false;
        removeCursor();
        removeWindow(focusTaker);
        focusTaker = null;
        handler.removeCallbacksAndMessages(null);
        if (prefs != null) {
            prefs.sp.unregisterOnSharedPreferenceChangeListener(this);
        }
        if (recorder != null) {
            recorder = null;
        }
        if (instance == this) {
            instance = null;
        }
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        readScreen();
        moveTo(x, y);
        if (cursor != null) {
            cursor.setScale(size * unit);
        }
    }

    @Override
    public void onSharedPreferenceChanged(SharedPreferences sp, String key) {
        loadPrefs();
    }

    private void loadPrefs() {
        trigger = prefs.trigger();
        speed = Prefs.SPEED_VALUES[prefs.speed()];
        size = Prefs.SIZE_VALUES[prefs.size()];
        clickMode = prefs.click();
        autoHide = prefs.autoHide();
        autoOffMs = Prefs.AUTO_OFF_MS[prefs.autoOff()];
        edgeScroll = prefs.edgeScroll();
        messages = prefs.messages();
        if (cursor != null) {
            cursor.setScale(size * unit);
        }
        if (mouseMode) {
            userActive();
        }
    }

    // ---------------------------------------------------------------- keys

    @Override
    protected boolean onKeyEvent(KeyEvent e) {
        int action = e.getAction();
        if (action != KeyEvent.ACTION_DOWN && action != KeyEvent.ACTION_UP) {
            return false;
        }
        int code = KeyNames.normalize(e.getKeyCode());
        if (code == KeyEvent.KEYCODE_UNKNOWN) {
            return false;
        }
        boolean down = action == KeyEvent.ACTION_DOWN;
        boolean first = down && e.getRepeatCount() == 0;

        boolean result = false;
        try {
            result = recorder != null ? recorder.onKey(code, down, first, e.getEventTime())
                    : processKey(e, code, down, first);
            // Never eat the UP of a key whose DOWN went to the app. The app would keep the key
            // as held, and Android would repeat it without end.
            if (!down && result && passed.contains(code)) {
                result = false;
            }
        } finally {
            if (first) {
                held.put(code, e.getEventTime());
                if (result) {
                    passed.remove(code);
                } else {
                    passed.add(code);
                }
            } else if (!down) {
                held.remove(code);
                passed.remove(code);
            }
            if (Log.isLoggable(TAG, Log.DEBUG)) {
                Log.d(TAG, KeyEvent.keyCodeToString(e.getKeyCode()) + (down ? " DOWN r=" + e.getRepeatCount() : " UP")
                        + " eaten=" + result + " mouse=" + mouseMode);
            }
        }
        return result;
    }

    private boolean processKey(KeyEvent e, int code, boolean down, boolean first) {
        if (first) {
            swallow.remove(code);
        } else if (swallow.contains(code)) {
            if (!down) {
                swallow.remove(code);
                mouseKeys.remove(code);
            }
            return true;
        }

        if (handleTrigger(e, code, down, first)) {
            return true;
        }

        if (first) {
            if (!mouseMode || !mouseKeyDown(code, e)) {
                return false;
            }
            mouseKeys.add(code);
            return true;
        }
        if (!mouseKeys.contains(code)) {
            return false;
        }
        if (!down) {
            mouseKeys.remove(code);
            mouseKeyUp(code, e);
        }
        return true;
    }

    /** Returns true if the event belongs to the on/off trigger and must be eaten. */
    private boolean handleTrigger(KeyEvent e, int code, boolean down, boolean first) {
        Trigger t = trigger;
        switch (t.type) {
            case Trigger.COMBO: {
                if (!first || (code != t.key1 && code != t.key2)) {
                    return false;
                }
                int partner = code == t.key1 ? t.key2 : t.key1;
                if (!isHeld(partner, e.getEventTime())) {
                    return false;
                }
                // Eat the rest of both keys, so the first key does not also click or move.
                swallow.add(code);
                swallow.add(partner);
                if (passed.contains(partner)) {
                    // The app already has the DOWN of the first key. Cancel it in the app,
                    // so its release does not click and the key does not repeat.
                    cancelKeysInApp();
                }
                mouseKeys.remove(code);
                mouseKeys.remove(partner);
                toggle();
                return true;
            }
            case Trigger.SINGLE: {
                if (!first || code != t.key1) {
                    return false;
                }
                swallow.add(code);
                toggle();
                return true;
            }
            case Trigger.LONG: {
                if (code != t.key1) {
                    return false;
                }
                if (first) {
                    longFired = false;
                    handler.removeCallbacks(longTrigger);
                    handler.postDelayed(longTrigger, TRIGGER_LONG_MS);
                } else if (!down) {
                    handler.removeCallbacks(longTrigger);
                    if (!longFired && !e.isCanceled()) {
                        replayShortPress(code);
                    }
                    longFired = false;
                }
                return true;
            }
            case Trigger.DOUBLE: {
                if (code != t.key1) {
                    return false;
                }
                long time = e.getEventTime();
                if (first) {
                    if (doubleLastUp >= 0 && time - doubleLastUp <= DOUBLE_MS) {
                        doubleLastUp = -1;
                        swallow.add(code);
                        mouseKeys.remove(code);
                        toggle();
                        return true;
                    }
                    doubleDownTime = time;
                } else if (!down) {
                    doubleLastUp = time - doubleDownTime <= DOUBLE_MS ? time : -1;
                }
                return false;
            }
            default:
                return false;
        }
    }

    private boolean isHeld(int code, long now) {
        Long since = held.get(code);
        return since != null && now - since <= HELD_STALE_MS;
    }

    /** Does the normal action of a key that the long-press trigger ate. */
    private void replayShortPress(int code) {
        if (code == KeyEvent.KEYCODE_BACK) {
            performGlobalAction(GLOBAL_ACTION_BACK);
        } else if (code == KeyEvent.KEYCODE_HOME) {
            performGlobalAction(GLOBAL_ACTION_HOME);
        } else if (code == KeyEvent.KEYCODE_SETTINGS) {
            try {
                startActivity(new Intent(Settings.ACTION_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
            } catch (RuntimeException ignored) {
                // No settings screen on this device.
            }
        }
    }

    /** Returns true if mouse mode uses this key. */
    private boolean mouseKeyDown(int code, KeyEvent e) {
        int dir = toDir(code);
        if (dir >= 0) {
            dirDown[dir] = true;
            userActive();
            startMove(dir);
            return true;
        }
        if (KeyNames.isOk(code)) {
            okDownTime = e.getEventTime();
            userActive();
            return true;
        }
        if (code == KeyEvent.KEYCODE_BACK) {
            backExited = false;
            handler.removeCallbacks(backExit);
            handler.postDelayed(backExit, BACK_EXIT_MS);
            return true;
        }
        if (code == KeyEvent.KEYCODE_CHANNEL_UP || code == KeyEvent.KEYCODE_PAGE_UP) {
            userActive();
            postScroll(UP);
            return true;
        }
        if (code == KeyEvent.KEYCODE_CHANNEL_DOWN || code == KeyEvent.KEYCODE_PAGE_DOWN) {
            userActive();
            postScroll(DOWN);
            return true;
        }
        return false;
    }

    private void mouseKeyUp(int code, KeyEvent e) {
        int dir = toDir(code);
        if (dir >= 0) {
            dirDown[dir] = false;
            return;
        }
        if (KeyNames.isOk(code)) {
            if (mouseMode && !e.isCanceled()) {
                final boolean longPress = e.getEventTime() - okDownTime >= CLICK_LONG_MS;
                // Leave onKeyEvent fast. The system waits for its result.
                handler.post(new Runnable() {
                    @Override
                    public void run() {
                        click(longPress);
                    }
                });
            }
            return;
        }
        if (code == KeyEvent.KEYCODE_BACK) {
            handler.removeCallbacks(backExit);
            if (!backExited && !e.isCanceled()) {
                performGlobalAction(GLOBAL_ACTION_BACK);
            }
            backExited = false;
        }
    }

    // ---------------------------------------------------------------- mode

    public void toggle() {
        setMouseMode(!mouseMode);
    }

    public void setMouseMode(boolean on) {
        if (on == mouseMode) {
            return;
        }
        mouseMode = on;
        handler.removeCallbacks(mover);
        handler.removeCallbacks(backExit);
        handler.removeCallbacks(hideCursor);
        handler.removeCallbacks(autoOff);
        for (int i = 0; i < dirDown.length; i++) {
            dirDown[i] = false;
        }
        if (on) {
            readScreen();
            moveTo(x, y);
            addCursor();
            userActive();
        } else {
            removeCursor();
        }
        if (messages) {
            Toast.makeText(this, on
                    ? "Fare modu: AÇIK\nKapatmak için: " + trigger.describe() + "\nveya Geri tuşunu 1 sn basılı tutun"
                    : "Fare modu: KAPALI", on ? Toast.LENGTH_LONG : Toast.LENGTH_SHORT).show();
        }
        StateListener l = stateListener;
        if (l != null) {
            l.onMouseModeChanged(on);
        }
    }

    /** Shows the cursor and restarts the hide and auto-off timers. */
    private void userActive() {
        if (!mouseMode) {
            return;
        }
        if (cursor != null && cursor.getVisibility() != View.VISIBLE) {
            cursor.setVisibility(View.VISIBLE);
        }
        handler.removeCallbacks(hideCursor);
        if (autoHide) {
            handler.postDelayed(hideCursor, HIDE_MS);
        }
        handler.removeCallbacks(autoOff);
        if (autoOffMs > 0) {
            handler.postDelayed(autoOff, autoOffMs);
        }
    }

    // ---------------------------------------------------------------- movement

    private void startMove(int dir) {
        moveStart = SystemClock.uptimeMillis();
        // A short press moves the cursor a little.
        float step = 8f * unit * speed;
        float dx = dir == LEFT ? -step : dir == RIGHT ? step : 0;
        float dy = dir == UP ? -step : dir == DOWN ? step : 0;
        moveTo(x + dx, y + dy);
        handler.removeCallbacks(mover);
        handler.postDelayed(mover, 150);
    }

    private void moveTo(float nx, float ny) {
        x = clamp(nx, 0, screenW - 1);
        y = clamp(ny, 0, screenH - 1);
        if (cursor != null) {
            cursor.setPosition(x, y);
        }
    }

    // ---------------------------------------------------------------- click and scroll

    private void click(boolean longPress) {
        if (cursor != null) {
            cursor.flash();
        }
        long now = SystemClock.uptimeMillis();
        // A second click on the same place soon after a node click: the first click did nothing
        // visible for the user, so this time send a real touch.
        boolean retry = lastClickWasNode && now - lastClickTime <= RETRY_CLICK_MS
                && Math.abs(x - lastClickX) <= RETRY_CLICK_PX * unit && Math.abs(y - lastClickY) <= RETRY_CLICK_PX * unit;
        lastClickTime = now;
        lastClickX = x;
        lastClickY = y;
        lastClickWasNode = false;

        if (clickMode == Prefs.CLICK_NODE || (clickMode == Prefs.CLICK_AUTO && !retry)) {
            AccessibilityNodeInfo node = findNodeAt(x, y, longPress ? NodeTest.LONG_CLICK : NodeTest.CLICK);
            boolean fits = node != null && (clickMode == Prefs.CLICK_NODE || nodeClickFits(node));
            int action = longPress ? AccessibilityNodeInfo.ACTION_LONG_CLICK : AccessibilityNodeInfo.ACTION_CLICK;
            boolean done = fits && node.performAction(action);
            if (Log.isLoggable(TAG, Log.DEBUG)) {
                Log.d(TAG, "click at " + (int) x + "," + (int) y + " node=" + (node != null ? node.getClassName() + " "
                        + node.getText() : "none") + " fits=" + fits + " done=" + done);
            }
            if (done) {
                lastClickWasNode = true;
                return;
            }
            if (clickMode == Prefs.CLICK_NODE) {
                return;
            }
        }
        tapGesture(longPress);
    }

    /**
     * True if a node click does the same as a touch at the cursor. A large clickable node
     * (for example an ad with a drawn close button) or a web or video surface needs a real
     * touch at the point, because the node click does not know the point.
     */
    private boolean nodeClickFits(AccessibilityNodeInfo node) {
        CharSequence cls = node.getClassName();
        if (cls != null) {
            String c = cls.toString();
            if (c.contains("WebView") || c.contains("SurfaceView") || c.contains("TextureView")
                    || c.contains("VideoView")) {
                return false;
            }
        }
        Rect r = new Rect();
        node.getBoundsInScreen(r);
        long area = (long) r.width() * r.height();
        return area <= (long) (LARGE_NODE_PART * screenW * screenH);
    }

    private void tapGesture(boolean longPress) {
        Path path = new Path();
        path.moveTo(x, y);
        dispatch(path, longPress ? 1000 : 50);
    }

    private void postScroll(final int dir) {
        handler.post(new Runnable() {
            @Override
            public void run() {
                scroll(dir);
            }
        });
    }

    private void scroll(int dir) {
        if (clickMode != Prefs.CLICK_TOUCH) {
            AccessibilityNodeInfo node = findNodeAt(x, y, NodeTest.SCROLL);
            if (node == null) {
                node = findNodeAt(screenW / 2f, screenH / 2f, NodeTest.SCROLL);
            }
            if (node != null && scrollNode(node, dir)) {
                return;
            }
            if (clickMode == Prefs.CLICK_NODE) {
                return;
            }
        }
        swipeGesture(dir);
    }

    /** Scrolls the node or its nearest ancestor that can scroll in this direction. */
    private boolean scrollNode(AccessibilityNodeInfo node, int dir) {
        boolean vertical = dir == UP || dir == DOWN;
        for (AccessibilityNodeInfo n = node; n != null; n = n.getParent()) {
            if (!n.isScrollable()) {
                continue;
            }
            if (Build.VERSION.SDK_INT >= 23) {
                AccessibilityNodeInfo.AccessibilityAction a = dir == UP
                        ? AccessibilityNodeInfo.AccessibilityAction.ACTION_SCROLL_UP
                        : dir == DOWN ? AccessibilityNodeInfo.AccessibilityAction.ACTION_SCROLL_DOWN
                        : dir == LEFT ? AccessibilityNodeInfo.AccessibilityAction.ACTION_SCROLL_LEFT
                        : AccessibilityNodeInfo.AccessibilityAction.ACTION_SCROLL_RIGHT;
                if (n.getActionList().contains(a) && n.performAction(a.getId())) {
                    return true;
                }
            }
            // FORWARD/BACKWARD have no axis. Use them only when the list axis matches.
            // A list with an unknown axis is usually vertical.
            int orientation = orientation(n);
            boolean axisMatches = orientation == 0 ? vertical : (orientation == 1) == vertical;
            int a = dir == DOWN || dir == RIGHT
                    ? AccessibilityNodeInfo.ACTION_SCROLL_FORWARD : AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD;
            if (axisMatches && n.performAction(a)) {
                return true;
            }
        }
        return false;
    }

    /** 1 = vertical, 2 = horizontal, 0 = unknown. */
    private static int orientation(AccessibilityNodeInfo n) {
        AccessibilityNodeInfo.CollectionInfo ci = n.getCollectionInfo();
        if (ci == null) {
            return 0;
        }
        if (ci.getRowCount() > 1 && ci.getColumnCount() <= 1) {
            return 1;
        }
        if (ci.getColumnCount() > 1 && ci.getRowCount() <= 1) {
            return 2;
        }
        return 0;
    }

    private void swipeGesture(int dir) {
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
        dispatch(path, 250);
    }

    private void dispatch(Path path, long durationMs) {
        try {
            GestureDescription.StrokeDescription stroke = new GestureDescription.StrokeDescription(path, 0, durationMs);
            dispatchGesture(new GestureDescription.Builder().addStroke(stroke).build(), null, null);
        } catch (RuntimeException ignored) {
            // The system refused the gesture. Nothing more to do.
        }
    }

    private enum NodeTest { CLICK, LONG_CLICK, SCROLL }

    /** Finds the top-most node at this screen point that passes the test, as a touch would. */
    private AccessibilityNodeInfo findNodeAt(float px, float py, NodeTest test) {
        int ix = (int) px;
        int iy = (int) py;
        try {
            List<AccessibilityWindowInfo> windows = new ArrayList<>(getWindows());
            Collections.sort(windows, new Comparator<AccessibilityWindowInfo>() {
                @Override
                public int compare(AccessibilityWindowInfo a, AccessibilityWindowInfo b) {
                    return Integer.compare(b.getLayer(), a.getLayer());
                }
            });
            Rect bounds = new Rect();
            for (AccessibilityWindowInfo w : windows) {
                if (Log.isLoggable(TAG, Log.DEBUG)) {
                    Rect b = new Rect();
                    w.getBoundsInScreen(b);
                    Log.d(TAG, "window type=" + w.getType() + " layer=" + w.getLayer() + " bounds=" + b
                            + " title=" + w.getTitle());
                }
                if (w.getType() == AccessibilityWindowInfo.TYPE_ACCESSIBILITY_OVERLAY) {
                    continue;
                }
                w.getBoundsInScreen(bounds);
                if (!bounds.contains(ix, iy)) {
                    continue;
                }
                AccessibilityNodeInfo root = w.getRoot();
                if (root == null) {
                    continue;
                }
                // The top-most window at the point gets the touch. Search only this window.
                return search(root, ix, iy, test, 0);
            }
            AccessibilityNodeInfo root = getRootInActiveWindow();
            return root != null ? search(root, ix, iy, test, 0) : null;
        } catch (RuntimeException e) {
            return null;
        }
    }

    private static AccessibilityNodeInfo search(AccessibilityNodeInfo node, int px, int py, NodeTest test, int depth) {
        if (depth > 60) {
            return null;
        }
        Rect r = new Rect();
        for (int i = node.getChildCount() - 1; i >= 0; i--) {
            AccessibilityNodeInfo child = node.getChild(i);
            if (child == null || !child.isVisibleToUser()) {
                continue;
            }
            child.getBoundsInScreen(r);
            if (!r.contains(px, py)) {
                continue;
            }
            AccessibilityNodeInfo found = search(child, px, py, test, depth + 1);
            if (found != null) {
                return found;
            }
        }
        return passes(node, test) ? node : null;
    }

    private static boolean passes(AccessibilityNodeInfo n, NodeTest test) {
        if (!n.isEnabled()) {
            return false;
        }
        switch (test) {
            case CLICK:
                return n.isClickable() || hasAction(n, AccessibilityNodeInfo.ACTION_CLICK);
            case LONG_CLICK:
                return n.isLongClickable() || hasAction(n, AccessibilityNodeInfo.ACTION_LONG_CLICK);
            default:
                return n.isScrollable();
        }
    }

    private static boolean hasAction(AccessibilityNodeInfo n, int id) {
        for (AccessibilityNodeInfo.AccessibilityAction a : n.getActionList()) {
            if (a.getId() == id) {
                return true;
            }
        }
        return false;
    }

    // ---------------------------------------------------------------- cursor window

    private void addCursor() {
        if (cursor != null || windowManager == null) {
            return;
        }
        cursor = new CursorView(this);
        cursor.setScale(size * unit);
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

    private void removeCursor() {
        removeWindow(cursor);
        cursor = null;
    }

    private void removeWindow(View v) {
        if (v != null && windowManager != null) {
            try {
                windowManager.removeView(v);
            } catch (RuntimeException ignored) {
                // The window is already gone.
            }
        }
    }

    /**
     * Takes the input focus for a short time. Android then sends a canceled UP to the app for
     * each key that the app holds, so the app does not click and stops the key repeat.
     */
    private void cancelKeysInApp() {
        handler.removeCallbacks(releaseFocus);
        if (focusTaker == null && windowManager != null) {
            View v = new View(this);
            v.setFocusable(true);
            WindowManager.LayoutParams lp = new WindowManager.LayoutParams(1, 1,
                    WindowManager.LayoutParams.TYPE_ACCESSIBILITY_OVERLAY,
                    WindowManager.LayoutParams.FLAG_NOT_TOUCHABLE | WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
                    PixelFormat.TRANSLUCENT);
            lp.gravity = Gravity.TOP | Gravity.START;
            try {
                windowManager.addView(v, lp);
                focusTaker = v;
            } catch (RuntimeException ex) {
                return;
            }
        }
        handler.postDelayed(releaseFocus, FOCUS_TAKE_MS);
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

    // ---------------------------------------------------------------- key recording

    /** Starts to record the next key press. All keys go to the recorder until it ends. */
    public void startRecording(RecordListener listener) {
        setMouseMode(false);
        handler.removeCallbacks(longTrigger);
        recorder = new Recorder(listener);
        handler.postDelayed(recorder.timeout, RECORD_TIMEOUT_MS);
    }

    public void cancelRecording() {
        if (recorder != null) {
            recorder.end();
        }
    }

    private final class Recorder {
        private final RecordListener listener;
        private final Set<Integer> down = new HashSet<>();
        private int key1 = KeyEvent.KEYCODE_UNKNOWN;
        private int key2 = KeyEvent.KEYCODE_UNKNOWN;
        private long firstDown;
        private boolean longHeld;
        private boolean waitSecond;
        private boolean second;

        final Runnable timeout = new Runnable() {
            @Override
            public void run() {
                end();
                listener.onRecordTimeout();
            }
        };

        private final Runnable single = new Runnable() {
            @Override
            public void run() {
                finish(new Trigger(Trigger.SINGLE, key1, KeyEvent.KEYCODE_UNKNOWN));
            }
        };

        Recorder(RecordListener listener) {
            this.listener = listener;
        }

        boolean onKey(int code, boolean isDown, boolean first, long time) {
            if (first) {
                if (waitSecond) {
                    handler.removeCallbacks(single);
                    waitSecond = false;
                    if (code == key1) {
                        second = true;
                    } else {
                        // A different key after one short press: keep the first key as a single press.
                        swallow.add(code);
                        finish(new Trigger(Trigger.SINGLE, key1, KeyEvent.KEYCODE_UNKNOWN));
                        return true;
                    }
                } else if (down.isEmpty() && key1 == KeyEvent.KEYCODE_UNKNOWN) {
                    key1 = code;
                    firstDown = time;
                } else if (code != key1 && key2 == KeyEvent.KEYCODE_UNKNOWN && down.contains(key1)) {
                    key2 = code;
                }
                down.add(code);
                return true;
            }
            if (isDown) {
                return down.contains(code);
            }
            if (!down.remove(code)) {
                return false; // The DOWN came before the recording and went to the app.
            }
            if (code == key1 && key2 == KeyEvent.KEYCODE_UNKNOWN && !second && time - firstDown >= TRIGGER_LONG_MS) {
                longHeld = true;
            }
            if (!down.isEmpty()) {
                return true;
            }
            if (key2 != KeyEvent.KEYCODE_UNKNOWN) {
                finish(new Trigger(Trigger.COMBO, key1, key2));
            } else if (longHeld) {
                finish(new Trigger(Trigger.LONG, key1, KeyEvent.KEYCODE_UNKNOWN));
            } else if (second) {
                finish(new Trigger(Trigger.DOUBLE, key1, KeyEvent.KEYCODE_UNKNOWN));
            } else {
                waitSecond = true;
                handler.postDelayed(single, DOUBLE_MS + 100);
            }
            return true;
        }

        void finish(Trigger t) {
            end();
            listener.onRecorded(t);
        }

        void end() {
            handler.removeCallbacks(timeout);
            handler.removeCallbacks(single);
            if (recorder == this) {
                recorder = null;
            }
            // Keys still down were eaten at DOWN. Eat their UP too.
            swallow.addAll(down);
        }
    }

    // ---------------------------------------------------------------- helpers

    private boolean anyDirDown() {
        return dirDown[LEFT] || dirDown[RIGHT] || dirDown[UP] || dirDown[DOWN];
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
