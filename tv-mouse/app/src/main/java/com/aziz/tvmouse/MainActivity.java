package com.aziz.tvmouse;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ComponentName;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.provider.Settings;
import android.text.TextUtils;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

/** Setup screen: shows the service state and opens the accessibility settings. */
public class MainActivity extends Activity {

    private TextView status;
    private Button toggleButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        int pad = dp(32);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(pad, pad, pad, pad);
        root.setBackgroundColor(Color.rgb(18, 18, 18));

        TextView title = new TextView(this);
        title.setText(R.string.app_name);
        title.setTextSize(32);
        title.setTextColor(Color.WHITE);
        root.addView(title);

        status = new TextView(this);
        status.setTextSize(22);
        status.setPadding(0, dp(16), 0, dp(16));
        root.addView(status);

        Button settingsButton = new Button(this);
        settingsButton.setText("Erişilebilirlik ayarlarını aç");
        settingsButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                openAccessibilitySettings();
            }
        });
        root.addView(settingsButton, wrap());

        toggleButton = new Button(this);
        toggleButton.setText("Fare modunu aç / kapat (test)");
        toggleButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                MouseService service = MouseService.get();
                if (service == null) {
                    Toast.makeText(MainActivity.this, "Önce hizmeti açın.", Toast.LENGTH_LONG).show();
                } else {
                    service.toggle();
                }
            }
        });
        root.addView(toggleButton, wrap());

        TextView help = new TextView(this);
        help.setTextSize(18);
        help.setTextColor(Color.LTGRAY);
        help.setPadding(0, dp(24), 0, 0);
        help.setText(
                "KURULUM\n"
                + "1. \"Erişilebilirlik ayarlarını aç\" düğmesine basın.\n"
                + "2. Listede \"" + getString(R.string.service_label) + "\" öğesini bulun.\n"
                + "3. Hizmeti AÇIK yapın. Onay penceresinde \"Tamam\" seçin.\n"
                + "Hizmet arka planda her zaman çalışır. TV yeniden başlasa da açık kalır.\n\n"
                + "KULLANIM\n"
                + "• OK tuşunu basılı tutun ve sol ok tuşuna basın: fare modu AÇIK.\n"
                + "• Aynı işlemi tekrar yapın: fare modu KAPALI (normal mod).\n"
                + "• Fare modunda yön tuşları imleci hareket ettirir. Tuşu basılı tutun: imleç hızlanır.\n"
                + "• OK tuşu: tıklama. OK tuşunu uzun basılı tutun: uzun basma.\n"
                + "• Kanal ^ / v tuşları: sayfayı yukarı / aşağı kaydırır.\n"
                + "• İmleci ekranın kenarına itin: sayfa o yöne kayar.\n"
                + "• Geri, Ana ekran ve ses tuşları normal çalışır.\n\n"
                + "AYAR KİLİTLİ İSE\n"
                + "Android 13 ve sonrası, dışarıdan yüklenen uygulamada bu ayarı kilitleyebilir.\n"
                + "Ayarlar > Uygulamalar > " + getString(R.string.app_name)
                + " > (sağ üst menü) > \"Kısıtlanmış ayarlara izin ver\" seçin.\n"
                + "Bu menü yoksa bilgisayardan ADB komutlarını kullanın (README dosyasına bakın).");
        root.addView(help);

        ScrollView scroll = new ScrollView(this);
        scroll.addView(root);
        setContentView(scroll);
        settingsButton.requestFocus();
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (isServiceEnabled()) {
            status.setText("Hizmet durumu: AÇIK ✓");
            status.setTextColor(Color.rgb(102, 187, 106));
        } else {
            status.setText("Hizmet durumu: KAPALI. Aşağıdaki adımları yapın.");
            status.setTextColor(Color.rgb(239, 83, 80));
        }
        toggleButton.setEnabled(MouseService.get() != null);
    }

    private void openAccessibilitySettings() {
        try {
            startActivity(new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS));
        } catch (ActivityNotFoundException e) {
            try {
                startActivity(new Intent(Settings.ACTION_SETTINGS));
            } catch (ActivityNotFoundException e2) {
                Toast.makeText(this, "Ayarlar açılamadı.", Toast.LENGTH_LONG).show();
            }
        }
    }

    private boolean isServiceEnabled() {
        String enabled = Settings.Secure.getString(getContentResolver(),
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
        if (TextUtils.isEmpty(enabled)) {
            return false;
        }
        ComponentName me = new ComponentName(this, MouseService.class);
        for (String item : enabled.split(":")) {
            ComponentName cn = ComponentName.unflattenFromString(item);
            if (me.equals(cn)) {
                return true;
            }
        }
        return false;
    }

    private LinearLayout.LayoutParams wrap() {
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        lp.gravity = Gravity.START;
        lp.topMargin = dp(8);
        return lp;
    }

    private int dp(int v) {
        return Math.round(v * getResources().getDisplayMetrics().density);
    }
}
