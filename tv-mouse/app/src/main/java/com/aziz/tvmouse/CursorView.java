package com.aziz.tvmouse;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.view.View;

/** Full-screen transparent view that draws the mouse arrow. The arrow tip is the click point. */
public class CursorView extends View {

    private final Paint fill = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint stroke = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint ring = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Path arrow = new Path();
    private float scale = 1f;
    private float px;
    private float py;
    private boolean pressed;

    private final Runnable release = new Runnable() {
        @Override
        public void run() {
            pressed = false;
            invalidate();
        }
    };

    public CursorView(Context context) {
        super(context);
        fill.setColor(Color.WHITE);
        fill.setStyle(Paint.Style.FILL);
        stroke.setColor(Color.BLACK);
        stroke.setStyle(Paint.Style.STROKE);
        stroke.setStrokeJoin(Paint.Join.ROUND);
        stroke.setStrokeWidth(2f);
        ring.setColor(0xAA2196F3);
        ring.setStyle(Paint.Style.FILL);

        arrow.moveTo(0, 0);
        arrow.lineTo(0, 32);
        arrow.lineTo(7.5f, 25);
        arrow.lineTo(12.5f, 36);
        arrow.lineTo(17.5f, 33.5f);
        arrow.lineTo(12.5f, 23);
        arrow.lineTo(22.5f, 23);
        arrow.close();
    }

    public void setScale(float scale) {
        this.scale = scale;
        invalidate();
    }

    public void setPosition(float x, float y) {
        px = x;
        py = y;
        invalidate();
    }

    /** Shows a short circle under the arrow tip to confirm a click. */
    public void flash() {
        pressed = true;
        invalidate();
        removeCallbacks(release);
        postDelayed(release, 180);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        canvas.save();
        canvas.translate(px, py);
        canvas.scale(scale, scale);
        if (pressed) {
            canvas.drawCircle(0, 0, 14, ring);
        }
        canvas.drawPath(arrow, fill);
        canvas.drawPath(arrow, stroke);
        canvas.restore();
    }
}
