package com.aziz.tvmouse;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.robolectric.Shadows.shadowOf;

import android.accessibilityservice.AccessibilityService;
import android.accessibilityservice.GestureDescription;
import android.graphics.Rect;
import android.os.SystemClock;
import android.view.KeyEvent;
import android.view.View;
import android.view.accessibility.AccessibilityNodeInfo;
import android.view.accessibility.AccessibilityWindowInfo;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.Robolectric;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.annotation.Config;
import org.robolectric.shadows.ShadowAccessibilityService;
import org.robolectric.shadows.ShadowLooper;

import java.lang.reflect.Field;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RunWith(RobolectricTestRunner.class)
@Config(qualifiers = "w960dp-h540dp-land-xhdpi")
public class MouseServiceTest {

    private static final int OK = KeyEvent.KEYCODE_DPAD_CENTER;
    private static final int LEFT = KeyEvent.KEYCODE_DPAD_LEFT;
    private static final int RIGHT = KeyEvent.KEYCODE_DPAD_RIGHT;
    private static final int DOWN = KeyEvent.KEYCODE_DPAD_DOWN;
    private static final int BACK = KeyEvent.KEYCODE_BACK;
    private static final int RED = KeyEvent.KEYCODE_PROG_RED;

    private MouseService svc;
    private ShadowAccessibilityService shadow;
    private Prefs prefs;
    private final Map<Integer, Long> downTimes = new HashMap<>();

    @Before
    public void setUp() {
        svc = Robolectric.setupService(MouseService.class);
        prefs = new Prefs(svc);
        prefs.reset();
        svc.onServiceConnected();
        shadow = shadowOf(svc);
        shadow.setWindows(Collections.<AccessibilityWindowInfo>emptyList());
    }

    // ------------------------------------------------------------ helpers

    private boolean down(int code) {
        long t = SystemClock.uptimeMillis();
        downTimes.put(code, t);
        return svc.onKeyEvent(new KeyEvent(t, t, KeyEvent.ACTION_DOWN, code, 0));
    }

    private boolean repeat(int code, int n) {
        long t = SystemClock.uptimeMillis();
        return svc.onKeyEvent(new KeyEvent(downTimes.get(code), t, KeyEvent.ACTION_DOWN, code, n));
    }

    private boolean up(int code) {
        long t = SystemClock.uptimeMillis();
        return svc.onKeyEvent(new KeyEvent(downTimes.get(code), t, KeyEvent.ACTION_UP, code, 0));
    }

    private static void advance(long ms) {
        ShadowLooper.idleMainLooper(ms, java.util.concurrent.TimeUnit.MILLISECONDS);
    }

    /** Short press. Returns {down result, up result}. */
    private boolean[] press(int code) {
        boolean d = down(code);
        advance(60);
        boolean u = up(code);
        advance(20);
        return new boolean[]{d, u};
    }

    private void combo(int first, int second) {
        down(first);
        advance(150);
        down(second);
        advance(80);
        up(second);
        advance(30);
        up(first);
        advance(20);
    }

    private float field(String name) throws Exception {
        Field f = MouseService.class.getDeclaredField(name);
        f.setAccessible(true);
        return f.getFloat(svc);
    }

    private View focusTaker() throws Exception {
        Field f = MouseService.class.getDeclaredField("focusTaker");
        f.setAccessible(true);
        return (View) f.get(svc);
    }

    private View cursor() throws Exception {
        Field f = MouseService.class.getDeclaredField("cursor");
        f.setAccessible(true);
        return (View) f.get(svc);
    }

    private void turnOn() {
        svc.setMouseMode(true);
        advance(10);
        assertTrue(svc.isMouseMode());
    }

    private List<Integer> globalActions() {
        return shadow.getGlobalActionsPerformed();
    }

    private List<GestureDescription> gestures() {
        List<GestureDescription> list = new ArrayList<>();
        for (ShadowAccessibilityService.GestureDispatch g : shadow.getGesturesDispatched()) {
            list.add(g.description());
        }
        return list;
    }

    private static AccessibilityNodeInfo node(Rect bounds) {
        AccessibilityNodeInfo n = AccessibilityNodeInfo.obtain();
        n.setBoundsInScreen(bounds);
        n.setVisibleToUser(true);
        n.setEnabled(true);
        return n;
    }

    private static AccessibilityNodeInfo actionable(AccessibilityNodeInfo n) {
        shadowOf(n).setOnPerformActionListener((action, args) -> true);
        return n;
    }

    /** One app window with the given root node. */
    private void screen(AccessibilityNodeInfo root) {
        AccessibilityWindowInfo w = AccessibilityWindowInfo.obtain();
        shadowOf(w).setType(AccessibilityWindowInfo.TYPE_APPLICATION);
        shadowOf(w).setLayer(1);
        shadowOf(w).setBoundsInScreen(new Rect(0, 0, 10000, 10000));
        shadowOf(w).setRoot(root);
        List<AccessibilityWindowInfo> list = new ArrayList<>();
        list.add(w);
        shadow.setWindows(list);
    }

    /** A screen with one clickable button under the cursor. */
    private AccessibilityNodeInfo buttonUnderCursor(boolean clickable, boolean longClickable) throws Exception {
        int cx = (int) field("x");
        int cy = (int) field("y");
        AccessibilityNodeInfo root = node(new Rect(0, 0, 10000, 10000));
        AccessibilityNodeInfo other = actionable(node(new Rect(0, 0, 10, 10)));
        other.setClickable(true);
        AccessibilityNodeInfo button = actionable(node(new Rect(cx - 50, cy - 20, cx + 50, cy + 20)));
        button.setClickable(clickable);
        button.setLongClickable(longClickable);
        shadowOf(root).addChild(other);
        shadowOf(root).addChild(button);
        screen(root);
        return button;
    }

    // ------------------------------------------------------------ default trigger: OK + LEFT

    @Test
    public void comboOkThenLeftTurnsOnWithoutClick() throws Exception {
        assertFalse("OK down goes to the app", down(OK));
        advance(150);
        assertTrue("LEFT is eaten", down(LEFT));
        assertTrue(svc.isMouseMode());
        assertTrue(up(LEFT));
        assertNotNull("focus is taken, so Android cancels the OK press in the app", focusTaker());
        assertFalse("OK release goes to the app, which already had the DOWN", up(OK));
        advance(100);
        assertEquals(0, gestures().size());
        advance(400);
        assertNull("focus goes back to the app", focusTaker());
    }

    @Test
    public void noFocusTakeWhenFirstKeyWasEaten() throws Exception {
        turnOn();
        combo(OK, LEFT); // OK DOWN was a mouse key, the app never saw it
        assertNull(focusTaker());
    }

    @Test
    public void comboLeftThenOkTurnsOn() {
        assertFalse(down(LEFT));
        advance(150);
        assertTrue(down(OK));
        assertTrue(svc.isMouseMode());
        assertTrue(up(OK));
        assertFalse("LEFT DOWN went to the app, so its UP does too", up(LEFT));
    }

    @Test
    public void comboTurnsOffInMouseModeWithoutClickOrMove() throws Exception {
        turnOn();
        float x = field("x");
        combo(OK, LEFT);
        assertFalse(svc.isMouseMode());
        advance(500);
        assertEquals(0, gestures().size());
        assertEquals(x, field("x"), 0.01f);
    }

    @Test
    public void enterAndSelectCountAsOk() {
        combo(KeyEvent.KEYCODE_ENTER, LEFT);
        assertTrue(svc.isMouseMode());
        combo(KeyEvent.KEYCODE_BUTTON_SELECT, LEFT);
        assertFalse(svc.isMouseMode());
    }

    @Test
    public void enterClicksInMouseMode() {
        turnOn();
        press(KeyEvent.KEYCODE_ENTER);
        advance(50);
        assertEquals(1, gestures().size());
    }

    @Test
    public void recordedEnterIsSavedAsOk() {
        Result r = new Result();
        svc.startRecording(r);
        down(KeyEvent.KEYCODE_ENTER);
        advance(100);
        down(LEFT);
        up(LEFT);
        up(KeyEvent.KEYCODE_ENTER);
        assertEquals(OK, r.trigger.key1);
    }

    @Test
    public void comboWorksAgainAndAgain() {
        for (int i = 0; i < 4; i++) {
            combo(OK, LEFT);
            assertEquals(i % 2 == 0, svc.isMouseMode());
        }
    }

    @Test
    public void normalKeysPassInNormalMode() {
        for (int code : new int[]{OK, LEFT, RIGHT, DOWN, BACK, RED, KeyEvent.KEYCODE_HOME}) {
            boolean[] r = press(code);
            assertFalse(r[0]);
            assertFalse(r[1]);
        }
        assertFalse(svc.isMouseMode());
    }

    @Test
    public void staleHeldKeyDoesNotTrigger() {
        down(OK); // its UP never comes
        advance(6000);
        assertFalse(down(LEFT));
        assertFalse(svc.isMouseMode());
    }

    @Test
    public void repeatsOfPassedKeysPass() {
        assertFalse(down(RIGHT));
        assertFalse(repeat(RIGHT, 1));
        assertFalse(up(RIGHT));
    }

    /** Random presses with random triggers. A key whose DOWN went to the app must also send its UP. */
    @Test
    public void upAlwaysFollowsDownToTheApp() {
        java.util.Random rnd = new java.util.Random(42);
        int[] keys = {OK, LEFT, RIGHT, DOWN, KeyEvent.KEYCODE_DPAD_UP, BACK, RED, KeyEvent.KEYCODE_HOME,
                KeyEvent.KEYCODE_CHANNEL_UP, KeyEvent.KEYCODE_ENTER};
        Trigger[] triggers = {Trigger.DEFAULT, new Trigger(Trigger.SINGLE, RED, 0),
                new Trigger(Trigger.LONG, BACK, 0), new Trigger(Trigger.DOUBLE, RED, 0),
                new Trigger(Trigger.COMBO, BACK, RIGHT), new Trigger(Trigger.DOUBLE, OK, 0)};
        Map<Integer, Boolean> downEaten = new HashMap<>();
        for (int step = 0; step < 6000; step++) {
            if (step % 500 == 0) {
                prefs.setTrigger(triggers[(step / 500) % triggers.length]);
            }
            if (step % 700 == 350) {
                svc.startRecording(new Result());
            }
            int code = keys[rnd.nextInt(keys.length)];
            int norm = KeyNames.normalize(code);
            if (downEaten.containsKey(norm)) {
                long t = SystemClock.uptimeMillis();
                boolean eaten = svc.onKeyEvent(new KeyEvent(t, t, KeyEvent.ACTION_UP, code, 0));
                boolean wasEaten = downEaten.remove(norm);
                if (!wasEaten) {
                    assertFalse("step " + step + ": UP of " + KeyEvent.keyCodeToString(code) + " eaten", eaten);
                }
            } else if (downEaten.size() < 2) {
                long t = SystemClock.uptimeMillis();
                downEaten.put(norm, svc.onKeyEvent(new KeyEvent(t, t, KeyEvent.ACTION_DOWN, code, 0)));
            }
            advance(rnd.nextInt(5) == 0 ? 300 + rnd.nextInt(1200) : rnd.nextInt(120));
        }
    }

    // ------------------------------------------------------------ mouse mode keys

    @Test
    public void arrowsMoveCursorAndAccelerate() throws Exception {
        turnOn();
        float x0 = field("x");
        assertTrue(down(RIGHT));
        float x1 = field("x");
        assertTrue("short press moves a little", x1 > x0);
        advance(1000);
        assertTrue(repeat(RIGHT, 1));
        float x2 = field("x");
        assertTrue(up(RIGHT));
        advance(500);
        assertEquals("stops after release", x2, field("x"), 0.01f);
        assertTrue(x2 - x1 > 5 * (x1 - x0));
    }

    @Test
    public void diagonalMove() throws Exception {
        turnOn();
        float x0 = field("x");
        float y0 = field("y");
        down(RIGHT);
        down(DOWN);
        advance(400);
        up(RIGHT);
        up(DOWN);
        assertTrue(field("x") > x0);
        assertTrue(field("y") > y0);
    }

    @Test
    public void cursorStaysOnScreen() throws Exception {
        turnOn();
        down(LEFT);
        advance(5000);
        up(LEFT);
        assertEquals(0f, field("x"), 0.01f);
    }

    @Test
    public void okClicksNodeUnderCursor() throws Exception {
        turnOn();
        AccessibilityNodeInfo button = buttonUnderCursor(true, false);
        boolean[] r = press(OK);
        assertTrue(r[0]);
        assertTrue(r[1]);
        advance(50);
        assertEquals(Collections.singletonList(AccessibilityNodeInfo.ACTION_CLICK),
                shadowOf(button).getPerformedActions());
        assertEquals("no extra touch", 0, gestures().size());
    }

    @Test
    public void okUsesTouchWhenNoNode() {
        turnOn();
        press(OK);
        advance(50);
        assertEquals(1, gestures().size());
        GestureDescription.StrokeDescription s = gestures().get(0).getStroke(0);
        assertTrue(s.getDuration() < 200);
    }

    @Test
    public void okUsesTouchWhenNodeRefuses() throws Exception {
        turnOn();
        AccessibilityNodeInfo button = buttonUnderCursor(true, false);
        shadowOf(button).setOnPerformActionListener((action, args) -> false);
        press(OK);
        advance(50);
        assertEquals(1, gestures().size());
    }

    /** One clickable node around the cursor, like an ad with a close button drawn inside. */
    private AccessibilityNodeInfo clickableAroundCursor(int halfW, int halfH, String className) throws Exception {
        int cx = (int) field("x");
        int cy = (int) field("y");
        AccessibilityNodeInfo root = node(new Rect(0, 0, 10000, 10000));
        AccessibilityNodeInfo n = actionable(node(new Rect(cx - halfW, cy - halfH, cx + halfW, cy + halfH)));
        n.setClickable(true);
        n.setClassName(className);
        shadowOf(root).addChild(n);
        screen(root);
        return n;
    }

    @Test
    public void largeClickableNodeGetsRealTouch() throws Exception {
        turnOn();
        AccessibilityNodeInfo ad = clickableAroundCursor(500, 300, "android.widget.FrameLayout");
        press(OK);
        advance(50);
        assertTrue("no node click on the whole ad", shadowOf(ad).getPerformedActions().isEmpty());
        assertEquals(1, gestures().size());
    }

    @Test
    public void webViewGetsRealTouch() throws Exception {
        turnOn();
        AccessibilityNodeInfo web = clickableAroundCursor(50, 30, "android.webkit.WebView");
        press(OK);
        advance(50);
        assertTrue(shadowOf(web).getPerformedActions().isEmpty());
        assertEquals(1, gestures().size());
    }

    @Test
    public void secondClickOnSamePlaceUsesTouch() throws Exception {
        turnOn();
        AccessibilityNodeInfo button = buttonUnderCursor(true, false);
        press(OK);
        advance(500);
        press(OK);
        advance(50);
        assertEquals("first click: node", 1, shadowOf(button).getPerformedActions().size());
        assertEquals("second click: touch", 1, gestures().size());
        advance(500);
        press(OK);
        advance(50);
        assertEquals("third click: node again", 2, shadowOf(button).getPerformedActions().size());
        assertEquals(1, gestures().size());
    }

    @Test
    public void clickAfterPauseUsesNodeAgain() throws Exception {
        turnOn();
        AccessibilityNodeInfo button = buttonUnderCursor(true, false);
        press(OK);
        advance(3000);
        press(OK);
        advance(50);
        assertEquals(2, shadowOf(button).getPerformedActions().size());
        assertEquals(0, gestures().size());
    }

    @Test
    public void clickOnOtherPlaceUsesNodeAgain() throws Exception {
        turnOn();
        float x0 = field("x");
        AccessibilityNodeInfo button = clickableAroundCursor(300, 150, "android.widget.Button"); // 9 % of the screen
        press(OK);
        advance(200);
        down(RIGHT);
        advance(400);
        up(RIGHT);
        float moved = field("x") - x0;
        assertTrue("moved " + moved, moved > 40 && moved < 300);
        press(OK);
        advance(50);
        assertEquals("both clicks are node clicks", 2, shadowOf(button).getPerformedActions().size());
        assertEquals(0, gestures().size());
    }

    @Test
    public void nodeModeClicksLargeNode() throws Exception {
        prefs.sp.edit().putInt(Prefs.CLICK, Prefs.CLICK_NODE).commit();
        turnOn();
        AccessibilityNodeInfo ad = clickableAroundCursor(500, 300, "android.widget.FrameLayout");
        press(OK);
        advance(50);
        assertEquals(Collections.singletonList(AccessibilityNodeInfo.ACTION_CLICK), shadowOf(ad).getPerformedActions());
        assertEquals(0, gestures().size());
    }

    @Test
    public void touchModeSkipsNode() throws Exception {
        prefs.sp.edit().putInt(Prefs.CLICK, Prefs.CLICK_TOUCH).commit();
        turnOn();
        AccessibilityNodeInfo button = buttonUnderCursor(true, false);
        press(OK);
        advance(50);
        assertTrue(shadowOf(button).getPerformedActions().isEmpty());
        assertEquals(1, gestures().size());
    }

    @Test
    public void nodeModeNeverTouches() {
        prefs.sp.edit().putInt(Prefs.CLICK, Prefs.CLICK_NODE).commit();
        turnOn();
        press(OK);
        advance(50);
        assertEquals(0, gestures().size());
    }

    @Test
    public void longOkIsLongClick() throws Exception {
        turnOn();
        AccessibilityNodeInfo button = buttonUnderCursor(true, true);
        down(OK);
        advance(700);
        up(OK);
        advance(50);
        assertEquals(Collections.singletonList(AccessibilityNodeInfo.ACTION_LONG_CLICK),
                shadowOf(button).getPerformedActions());
    }

    @Test
    public void longOkWithoutNodeIsLongTouch() {
        turnOn();
        down(OK);
        advance(700);
        up(OK);
        advance(50);
        assertEquals(1, gestures().size());
        assertTrue(gestures().get(0).getStroke(0).getDuration() >= 800);
    }

    @Test
    public void clickSearchIgnoresHiddenAndDisabledNodes() throws Exception {
        turnOn();
        AccessibilityNodeInfo button = buttonUnderCursor(true, false);
        button.setEnabled(false);
        press(OK);
        advance(50);
        assertTrue(shadowOf(button).getPerformedActions().isEmpty());
        assertEquals(1, gestures().size());
    }

    @Test
    public void clickGoesToParentWhenChildIsNotClickable() throws Exception {
        turnOn();
        int cx = (int) field("x");
        int cy = (int) field("y");
        AccessibilityNodeInfo root = node(new Rect(0, 0, 10000, 10000));
        AccessibilityNodeInfo card = actionable(node(new Rect(cx - 100, cy - 100, cx + 100, cy + 100)));
        card.setClickable(true);
        AccessibilityNodeInfo text = node(new Rect(cx - 30, cy - 10, cx + 30, cy + 10));
        shadowOf(card).addChild(text);
        shadowOf(root).addChild(card);
        screen(root);
        press(OK);
        advance(50);
        assertEquals(Collections.singletonList(AccessibilityNodeInfo.ACTION_CLICK),
                shadowOf(card).getPerformedActions());
    }

    @Test
    public void shortBackGoesBackInMouseMode() {
        turnOn();
        boolean[] r = press(BACK);
        assertTrue(r[0]);
        assertTrue(r[1]);
        assertTrue(svc.isMouseMode());
        assertEquals(Collections.singletonList(AccessibilityService.GLOBAL_ACTION_BACK), globalActions());
    }

    @Test
    public void longBackAlwaysLeavesMouseMode() {
        turnOn();
        assertTrue(down(BACK));
        advance(1100);
        assertFalse(svc.isMouseMode());
        assertTrue(up(BACK));
        assertTrue("no back action after exit", globalActions().isEmpty());
        // Keys work normally again.
        assertFalse(press(RIGHT)[0]);
    }

    @Test
    public void longBackLeavesEvenWithOtherTrigger() {
        prefs.setTrigger(new Trigger(Trigger.SINGLE, RED, 0));
        advance(10);
        turnOn();
        down(BACK);
        advance(1100);
        up(BACK);
        assertFalse(svc.isMouseMode());
    }

    @Test
    public void otherKeysPassInMouseMode() {
        turnOn();
        for (int code : new int[]{KeyEvent.KEYCODE_HOME, KeyEvent.KEYCODE_VOLUME_UP, RED}) {
            boolean[] r = press(code);
            assertFalse(r[0]);
            assertFalse(r[1]);
        }
    }

    @Test
    public void channelKeysScrollNode() throws Exception {
        turnOn();
        AccessibilityNodeInfo root = node(new Rect(0, 0, 10000, 10000));
        AccessibilityNodeInfo list = actionable(node(new Rect(0, 0, 10000, 10000)));
        list.setScrollable(true);
        list.addAction(AccessibilityNodeInfo.AccessibilityAction.ACTION_SCROLL_DOWN);
        shadowOf(root).addChild(list);
        screen(root);
        assertTrue(press(KeyEvent.KEYCODE_CHANNEL_DOWN)[0]);
        advance(50);
        assertEquals(Collections.singletonList(android.R.id.accessibilityActionScrollDown),
                shadowOf(list).getPerformedActions());
    }

    @Test
    public void verticalScrollDoesNotScrollHorizontalRow() throws Exception {
        turnOn();
        AccessibilityNodeInfo root = node(new Rect(0, 0, 10000, 10000));
        AccessibilityNodeInfo column = actionable(node(new Rect(0, 0, 10000, 10000)));
        column.setScrollable(true);
        column.setCollectionInfo(AccessibilityNodeInfo.CollectionInfo.obtain(10, 1, false));
        AccessibilityNodeInfo row = actionable(node(new Rect(0, 0, 10000, 10000)));
        row.setScrollable(true);
        row.setCollectionInfo(AccessibilityNodeInfo.CollectionInfo.obtain(1, 10, false));
        shadowOf(column).addChild(row);
        shadowOf(root).addChild(column);
        screen(root);
        press(KeyEvent.KEYCODE_CHANNEL_DOWN);
        advance(50);
        assertTrue(shadowOf(row).getPerformedActions().isEmpty());
        assertEquals(Collections.singletonList(AccessibilityNodeInfo.ACTION_SCROLL_FORWARD),
                shadowOf(column).getPerformedActions());
    }

    @Test
    public void scrollUsesSwipeWhenNoList() {
        turnOn();
        press(KeyEvent.KEYCODE_CHANNEL_UP);
        advance(50);
        assertEquals(1, gestures().size());
    }

    @Test
    public void edgeScroll() {
        turnOn();
        down(LEFT);
        advance(3000);
        up(LEFT);
        advance(50);
        assertTrue("swipes at the edge", gestures().size() >= 2);
    }

    @Test
    public void edgeScrollCanBeOff() {
        prefs.sp.edit().putBoolean(Prefs.EDGE_SCROLL, false).commit();
        turnOn();
        down(LEFT);
        advance(3000);
        up(LEFT);
        assertEquals(0, gestures().size());
    }

    // ------------------------------------------------------------ cursor timers

    @Test
    public void cursorHidesAndComesBack() throws Exception {
        turnOn();
        assertNotNull(cursor());
        assertEquals(View.VISIBLE, cursor().getVisibility());
        advance(5100);
        assertEquals(View.INVISIBLE, cursor().getVisibility());
        press(RIGHT);
        assertEquals(View.VISIBLE, cursor().getVisibility());
        assertTrue(svc.isMouseMode());
    }

    @Test
    public void cursorDoesNotHideWhenOff() throws Exception {
        prefs.sp.edit().putBoolean(Prefs.AUTO_HIDE, false).commit();
        turnOn();
        advance(20000);
        assertEquals(View.VISIBLE, cursor().getVisibility());
    }

    @Test
    public void autoOff() {
        prefs.sp.edit().putInt(Prefs.AUTO_OFF, 1).commit();
        turnOn();
        advance(50_000);
        press(RIGHT); // activity restarts the timer
        advance(50_000);
        assertTrue(svc.isMouseMode());
        advance(11_000);
        assertFalse(svc.isMouseMode());
    }

    @Test
    public void cursorWindowGoesAwayWhenOff() throws Exception {
        turnOn();
        assertNotNull(cursor());
        svc.setMouseMode(false);
        assertNull(cursor());
    }

    // ------------------------------------------------------------ other triggers

    @Test
    public void singleTrigger() {
        prefs.setTrigger(new Trigger(Trigger.SINGLE, RED, 0));
        advance(10);
        boolean[] r = press(RED);
        assertTrue(r[0]);
        assertTrue(r[1]);
        assertTrue(svc.isMouseMode());
        press(RED);
        assertFalse(svc.isMouseMode());
        // The old combo does nothing now.
        combo(OK, LEFT);
        assertFalse(svc.isMouseMode());
    }

    @Test
    public void longTriggerReplaysShortBack() {
        prefs.setTrigger(new Trigger(Trigger.LONG, BACK, 0));
        advance(10);
        boolean[] r = press(BACK);
        assertTrue(r[0]);
        assertTrue(r[1]);
        assertFalse(svc.isMouseMode());
        assertEquals(Collections.singletonList(AccessibilityService.GLOBAL_ACTION_BACK), globalActions());

        down(BACK);
        advance(900);
        assertTrue(svc.isMouseMode());
        assertTrue(up(BACK));
        assertEquals("no back after a long press", 1, globalActions().size());

        down(BACK);
        advance(900);
        up(BACK);
        assertFalse(svc.isMouseMode());
    }

    @Test
    public void doubleTrigger() {
        prefs.setTrigger(new Trigger(Trigger.DOUBLE, RED, 0));
        advance(10);
        boolean[] first = press(RED);
        assertFalse("first press goes to the app", first[0]);
        assertFalse(svc.isMouseMode());
        advance(100);
        boolean[] second = press(RED);
        assertTrue(second[0]);
        assertTrue(second[1]);
        assertTrue(svc.isMouseMode());
    }

    @Test
    public void slowDoubleDoesNotTrigger() {
        prefs.setTrigger(new Trigger(Trigger.DOUBLE, RED, 0));
        advance(10);
        press(RED);
        advance(700);
        press(RED);
        assertFalse(svc.isMouseMode());
    }

    @Test
    public void customCombo() {
        prefs.setTrigger(new Trigger(Trigger.COMBO, BACK, KeyEvent.KEYCODE_VOLUME_DOWN));
        advance(10);
        combo(KeyEvent.KEYCODE_VOLUME_DOWN, BACK);
        assertTrue(svc.isMouseMode());
        combo(BACK, KeyEvent.KEYCODE_VOLUME_DOWN);
        assertFalse(svc.isMouseMode());
        assertTrue("combo back press does not go back", globalActions().isEmpty());
    }

    // ------------------------------------------------------------ recording

    private static final class Result implements MouseService.RecordListener {
        Trigger trigger;
        boolean timeout;

        @Override
        public void onRecorded(Trigger t) {
            trigger = t;
        }

        @Override
        public void onRecordTimeout() {
            timeout = true;
        }
    }

    @Test
    public void recordCombo() {
        Result r = new Result();
        svc.startRecording(r);
        assertTrue(down(OK));
        advance(100);
        assertTrue(down(LEFT));
        advance(100);
        assertTrue(up(LEFT));
        assertTrue(up(OK));
        assertNotNull(r.trigger);
        assertEquals(Trigger.COMBO, r.trigger.type);
        assertEquals(OK, r.trigger.key1);
        assertEquals(LEFT, r.trigger.key2);
        assertFalse(svc.isMouseMode());
        // Recording is over: keys pass again.
        assertFalse(press(RIGHT)[0]);
    }

    @Test
    public void recordSingle() {
        Result r = new Result();
        svc.startRecording(r);
        boolean[] p = press(RED);
        assertTrue(p[0]);
        assertTrue(p[1]);
        assertNull("waits for a possible second press", r.trigger);
        advance(600);
        assertEquals(Trigger.SINGLE, r.trigger.type);
        assertEquals(RED, r.trigger.key1);
    }

    @Test
    public void recordLong() {
        Result r = new Result();
        svc.startRecording(r);
        down(KeyEvent.KEYCODE_HOME);
        advance(1000);
        repeat(KeyEvent.KEYCODE_HOME, 1);
        up(KeyEvent.KEYCODE_HOME);
        assertEquals(Trigger.LONG, r.trigger.type);
        assertEquals(KeyEvent.KEYCODE_HOME, r.trigger.key1);
    }

    @Test
    public void recordDouble() {
        Result r = new Result();
        svc.startRecording(r);
        press(RED);
        advance(100);
        press(RED);
        assertEquals(Trigger.DOUBLE, r.trigger.type);
    }

    @Test
    public void recordOtherKeyAfterSingle() {
        Result r = new Result();
        svc.startRecording(r);
        press(RED);
        advance(100);
        assertTrue(down(RIGHT));
        assertEquals(Trigger.SINGLE, r.trigger.type);
        assertEquals(RED, r.trigger.key1);
        assertTrue("the end of that key is eaten too", up(RIGHT));
        assertFalse(press(RIGHT)[0]);
    }

    @Test
    public void recordTimeout() {
        Result r = new Result();
        svc.startRecording(r);
        advance(16000);
        assertTrue(r.timeout);
        assertNull(r.trigger);
        assertFalse(press(RIGHT)[0]);
    }

    @Test
    public void recordIgnoresEndOfEarlierPress() {
        down(OK);
        Result r = new Result();
        svc.startRecording(r);
        assertFalse("the app had the DOWN", up(OK));
        advance(1000);
        assertNull(r.trigger);
        press(RED);
        advance(600);
        assertEquals(RED, r.trigger.key1);
    }

    @Test
    public void cancelRecording() {
        Result r = new Result();
        svc.startRecording(r);
        svc.cancelRecording();
        assertFalse(press(RIGHT)[0]);
        advance(16000);
        assertFalse(r.timeout);
    }

    @Test
    public void recordingTurnsMouseModeOff() {
        turnOn();
        svc.startRecording(new Result());
        assertFalse(svc.isMouseMode());
    }

    // ------------------------------------------------------------ settings

    @Test
    public void speedSettingChangesMove() throws Exception {
        turnOn();
        float x0 = field("x");
        down(RIGHT);
        advance(500);
        up(RIGHT);
        float normal = field("x") - x0;

        prefs.sp.edit().putInt(Prefs.SPEED, 2).commit();
        advance(10);
        float x1 = field("x");
        down(LEFT);
        advance(500);
        up(LEFT);
        float fast = x1 - field("x");
        assertTrue(fast > normal * 1.4f);
    }

    @Test
    public void triggerValidation() {
        assertNull(Trigger.DEFAULT.validate());
        assertNotNull(new Trigger(Trigger.SINGLE, OK, 0).validate());
        assertNotNull(new Trigger(Trigger.SINGLE, LEFT, 0).validate());
        assertNotNull(new Trigger(Trigger.SINGLE, BACK, 0).validate());
        assertNotNull(new Trigger(Trigger.SINGLE, KeyEvent.KEYCODE_HOME, 0).validate());
        assertNull(new Trigger(Trigger.SINGLE, RED, 0).validate());
        assertNotNull(new Trigger(Trigger.LONG, OK, 0).validate());
        assertNotNull(new Trigger(Trigger.LONG, DOWN, 0).validate());
        assertNull(new Trigger(Trigger.LONG, BACK, 0).validate());
        assertNotNull(new Trigger(Trigger.DOUBLE, RIGHT, 0).validate());
        assertNull(new Trigger(Trigger.DOUBLE, OK, 0).validate());
        assertNotNull(new Trigger(Trigger.COMBO, OK, OK).validate());
        assertNotNull(new Trigger(Trigger.SINGLE, KeyEvent.KEYCODE_UNKNOWN, 0).validate());
    }

    @Test
    public void triggerStorage() {
        Trigger t = new Trigger(Trigger.LONG, KeyEvent.KEYCODE_TV, 0);
        prefs.setTrigger(t);
        Trigger back = prefs.trigger();
        assertEquals(t.type, back.type);
        assertEquals(t.key1, back.key1);
        prefs.sp.edit().putString(Prefs.TRIGGER, "garbage").commit();
        assertEquals(Trigger.DEFAULT.encode(), prefs.trigger().encode());
        prefs.sp.edit().putString(Prefs.TRIGGER, "1:23:0").commit(); // single OK is not allowed
        assertEquals(Trigger.DEFAULT.encode(), prefs.trigger().encode());
    }

    @Test
    public void prefsCycleWraps() {
        for (int i = 0; i < Prefs.SPEED_LABELS.length; i++) {
            prefs.cycle(Prefs.SPEED, Prefs.SPEED_LABELS.length);
        }
        assertEquals(1, prefs.speed());
        assertTrue(prefs.autoHide());
        prefs.toggle(Prefs.AUTO_HIDE);
        assertFalse(prefs.autoHide());
    }

    @Test
    public void keyNames() {
        assertEquals("OK", KeyNames.name(OK));
        assertEquals("Sol ok", KeyNames.name(LEFT));
        assertEquals("Rakam 5", KeyNames.name(KeyEvent.KEYCODE_5));
        assertEquals("OK + Sol ok (birlikte basın)", Trigger.DEFAULT.describe());
    }

    @Test
    public void unbindCleansUp() throws Exception {
        turnOn();
        svc.onUnbind(null);
        assertFalse(svc.isMouseMode());
        assertNull(cursor());
        assertNull(MouseService.get());
    }
}
