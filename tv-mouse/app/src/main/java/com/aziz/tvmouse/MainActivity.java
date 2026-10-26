package com.aziz.tvmouse;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.AppOpsManager;
import android.content.ActivityNotFoundException;
import android.content.ComponentName;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.Process;
import android.provider.Settings;
import android.text.TextUtils;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

/** Setup screen: service state, on/off key recording and the settings. */
public class MainActivity extends Activity implements MouseService.StateListener, MouseService.RecordListener {

    private Prefs prefs;
    private TextView status;
    private Button accessibilityButton;
    private Button testButton;
    private Button triggerButton;
    private Button speedButton;
    private Button sizeButton;
    private Button clickButton;
    private Button hideButton;
    private Button autoOffButton;
    private Button edgeButton;
    private Button messagesButton;
    private Button clearCrashButton;
    private AlertDialog dialog;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        prefs = new Prefs(this);

        int pad = dp(32);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(48), pad, dp(48), pad);

        TextView title = new TextView(this);
        title.setText(getString(R.string.app_name) + "  " + versionName());
        title.setTextSize(30);
        title.setTextColor(Color.WHITE);
        root.addView(title);

        status = new TextView(this);
        status.setTextSize(18);
        status.setPadding(0, dp(12), 0, dp(12));
        root.addView(status);

        accessibilityButton = addButton(root, new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                openAccessibilitySettings();
            }
        });
        accessibilityButton.setText("Erişilebilirlik ayarlarını aç");

        testButton = addButton(root, new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                MouseService s = MouseService.get();
                if (s == null) {
                    Toast.makeText(MainActivity.this, "Önce hizmeti açın.", Toast.LENGTH_LONG).show();
                } else {
                    s.setMouseMode(true);
                }
            }
        });
        testButton.setText("Fare modunu şimdi aç (deneme)");

        addHeader(root, "AYARLAR");

        triggerButton = addButton(root, new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                startRecording();
            }
        });
        speedButton = addButton(root, cycler(Prefs.SPEED, Prefs.SPEED_LABELS.length));
        sizeButton = addButton(root, cycler(Prefs.SIZE, Prefs.SIZE_LABELS.length));
        clickButton = addButton(root, cycler(Prefs.CLICK, Prefs.CLICK_LABELS.length));
        hideButton = addButton(root, switcher(Prefs.AUTO_HIDE));
        autoOffButton = addButton(root, cycler(Prefs.AUTO_OFF, Prefs.AUTO_OFF_LABELS.length));
        edgeButton = addButton(root, switcher(Prefs.EDGE_SCROLL));
        messagesButton = addButton(root, switcher(Prefs.MESSAGES));

        Button resetButton = addButton(root, new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                prefs.reset();
                refresh();
                Toast.makeText(MainActivity.this, "Varsayılan ayarlar yüklendi.", Toast.LENGTH_SHORT).show();
            }
        });
        resetButton.setText("Varsayılan ayarlara dön");

        clearCrashButton = addButton(root, new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                //noinspection ResultOfMethodCallIgnored
                new File(getFilesDir(), TvMouseApp.CRASH_FILE).delete();
                refresh();
            }
        });
        clearCrashButton.setText("Hata kaydını sil");

        addHeader(root, "KULLANIM");
        TextView help = new TextView(this);
        help.setTextSize(17);
        help.setTextColor(Color.LTGRAY);
        help.setText(
                "• Fare modunu açmak ve kapatmak için seçtiğiniz tuşu kullanın.\n"
                + "• Fare modunda yön tuşları imleci hareket ettirir. Tuşu basılı tutun: imleç hızlanır.\n"
                + "• OK tuşu: tıklama. OK tuşunu uzun basılı tutun: uzun basma.\n"
                + "• Geri tuşu: geri. Geri tuşunu 1 saniye basılı tutun: fare modu KAPANIR.\n"
                + "• Kanal ^ / v tuşları: sayfayı yukarı / aşağı kaydırır.\n"
                + "• İmleci ekranın kenarına itin: sayfa o yöne kayar.\n"
                + "• Ana ekran ve ses tuşları normal çalışır.\n\n"
                + "TIKLAMA ÇALIŞMAZSA\n"
                + "\"Tıklama yöntemi\" ayarını değiştirin. Sonra tekrar deneyin.\n\n"
                + "KURULUM\n"
                + "1. \"Erişilebilirlik ayarlarını aç\" düğmesine basın.\n"
                + "2. \"" + getString(R.string.service_label) + "\" hizmetini AÇIK yapın.\n"
                + "Hizmet arka planda her zaman çalışır. TV yeniden başlasa da açık kalır.\n"
                + "Ayar kendiliğinden kapanıyorsa: bu uygulamayı kaldırın. \"TV Fare Kurucu\" ile tekrar kurun.");
        root.addView(help);

        ScrollView scroll = new ScrollView(this);
        scroll.setBackgroundColor(Color.rgb(18, 18, 18));
        scroll.addView(root);
        setContentView(scroll);
    }

    @Override
    protected void onResume() {
        super.onResume();
        MouseService.setStateListener(this);
        refresh();
        (isServiceEnabled() ? triggerButton : accessibilityButton).requestFocus();
    }

    @Override
    protected void onPause() {
        super.onPause();
        MouseService.setStateListener(null);
        MouseService s = MouseService.get();
        if (s != null) {
            s.cancelRecording();
        }
        dismissDialog();
    }

    @Override
    public void onMouseModeChanged(boolean on) {
        refresh();
    }

    // ---------------------------------------------------------------- key recording

    private void startRecording() {
        MouseService s = MouseService.get();
        if (s == null) {
            Toast.makeText(this, "Önce hizmeti açın. Tuş kaydı hizmet ile çalışır.", Toast.LENGTH_LONG).show();
            return;
        }
        dismissDialog();
        dialog = new AlertDialog.Builder(this)
                .setTitle("Tuşlara şimdi basın")
                .setMessage("Kumandada istediğiniz tuşa basın:\n\n"
                        + "• İki tuş birlikte: ilk tuşu basılı tutun, ikinci tuşa basın.\n"
                        + "• Tek basış: tuşa bir kez basın.\n"
                        + "• Uzun basma: tuşu 1 saniye basılı tutun.\n"
                        + "• Çift basma: tuşa iki kez hızlı basın.\n\n"
                        + "15 saniye içinde basın. Bu sırada tuşlar başka bir iş yapmaz.")
                .setCancelable(false)
                .create();
        dialog.show();
        s.startRecording(this);
    }

    @Override
    public void onRecorded(final Trigger t) {
        dismissDialog();
        String error = t.validate();
        AlertDialog.Builder b = new AlertDialog.Builder(this);
        if (error != null) {
            b.setTitle("Bu seçim kullanılamaz")
                    .setMessage("Basılan: " + t.describe() + "\n\n" + error)
                    .setPositiveButton("Tekrar dene", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface d, int which) {
                            startRecording();
                        }
                    })
                    .setNegativeButton("İptal", null);
        } else {
            String warning = t.warning();
            b.setTitle("Kaydedilsin mi?")
                    .setMessage("Yeni açma/kapama tuşu:\n" + t.describe() + (warning != null ? "\n\n" + warning : ""))
                    .setPositiveButton("Kaydet", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface d, int which) {
                            prefs.setTrigger(t);
                            refresh();
                            Toast.makeText(MainActivity.this, "Kaydedildi: " + t.describe(), Toast.LENGTH_LONG).show();
                        }
                    })
                    .setNeutralButton("Tekrar dene", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface d, int which) {
                            startRecording();
                        }
                    })
                    .setNegativeButton("İptal", null);
        }
        dialog = b.create();
        dialog.show();
    }

    @Override
    public void onRecordTimeout() {
        dismissDialog();
        Toast.makeText(this, "Süre doldu. Tuş kaydedilmedi.", Toast.LENGTH_LONG).show();
    }

    private void dismissDialog() {
        if (dialog != null) {
            dialog.dismiss();
            dialog = null;
        }
    }

    // ---------------------------------------------------------------- screen state

    private void refresh() {
        boolean enabled = isServiceEnabled();
        MouseService service = MouseService.get();
        StringBuilder text = new StringBuilder();
        if (enabled && service != null) {
            text.append("Hizmet: AÇIK ✓   Fare modu: ").append(service.isMouseMode() ? "AÇIK" : "KAPALI");
            status.setTextColor(Color.rgb(102, 187, 106));
        } else if (enabled) {
            text.append("Hizmet: açık, ama çalışmıyor. Hizmeti kapatıp tekrar açın.");
            status.setTextColor(Color.rgb(255, 202, 40));
        } else {
            text.append("Hizmet: KAPALI. \"Erişilebilirlik ayarlarını aç\" düğmesine basın.");
            status.setTextColor(Color.rgb(239, 83, 80));
        }
        text.append("\nAndroid ").append(Build.VERSION.RELEASE).append(" (API ").append(Build.VERSION.SDK_INT).append(")");
        Boolean restricted = isSettingRestricted();
        if (Boolean.TRUE.equals(restricted)) {
            text.append("\nKısıtlanmış ayar: EVET. Uygulamayı kaldırın. \"TV Fare Kurucu\" ile tekrar kurun.");
        }
        String crash = readLastCrash();
        if (crash != null) {
            text.append("\n\nSON HATA (bu metnin fotoğrafını gönderin):\n").append(crash);
        }
        status.setText(text);

        testButton.setEnabled(service != null);
        clearCrashButton.setVisibility(crash != null ? View.VISIBLE : View.GONE);

        triggerButton.setText("Açma/kapama tuşu: " + prefs.trigger().describe() + "  ›  değiştir");
        speedButton.setText("İmleç hızı: " + Prefs.SPEED_LABELS[prefs.speed()]);
        sizeButton.setText("İmleç boyutu: " + Prefs.SIZE_LABELS[prefs.size()]);
        clickButton.setText("Tıklama yöntemi: " + Prefs.CLICK_LABELS[prefs.click()]);
        hideButton.setText("İmleci gizle (5 sn hareketsiz kalınca): " + onOff(prefs.autoHide()));
        autoOffButton.setText("Fare modunu otomatik kapat (hareketsiz): " + Prefs.AUTO_OFF_LABELS[prefs.autoOff()]);
        edgeButton.setText("Kenara itince sayfayı kaydır: " + onOff(prefs.edgeScroll()));
        messagesButton.setText("Açma/kapama mesajını göster: " + onOff(prefs.messages()));
    }

    private View.OnClickListener cycler(final String key, final int count) {
        return new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                prefs.cycle(key, count);
                refresh();
            }
        };
    }

    private View.OnClickListener switcher(final String key) {
        return new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                prefs.toggle(key);
                refresh();
            }
        };
    }

    private static String onOff(boolean on) {
        return on ? "AÇIK" : "KAPALI";
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
            if (me.equals(ComponentName.unflattenFromString(item))) {
                return true;
            }
        }
        return false;
    }

    /** Returns true if Android blocks the accessibility setting for this app, or null if unknown. */
    private Boolean isSettingRestricted() {
        if (Build.VERSION.SDK_INT < 33) {
            return null;
        }
        try {
            AppOpsManager ops = (AppOpsManager) getSystemService(APP_OPS_SERVICE);
            int mode = ops.unsafeCheckOpNoThrow("android:access_restricted_settings",
                    Process.myUid(), getPackageName());
            return mode == AppOpsManager.MODE_ERRORED || mode == AppOpsManager.MODE_IGNORED;
        } catch (RuntimeException e) {
            return null;
        }
    }

    private String readLastCrash() {
        File file = new File(getFilesDir(), TvMouseApp.CRASH_FILE);
        if (!file.exists()) {
            return null;
        }
        StringBuilder sb = new StringBuilder();
        try (BufferedReader r = new BufferedReader(new FileReader(file))) {
            String line;
            int lines = 0;
            while ((line = r.readLine()) != null && lines++ < 12) {
                sb.append(line).append('\n');
            }
        } catch (IOException e) {
            return null;
        }
        return sb.toString();
    }

    private String versionName() {
        try {
            return getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
        } catch (Exception e) {
            return "";
        }
    }

    private void addHeader(LinearLayout root, String text) {
        TextView h = new TextView(this);
        h.setText(text);
        h.setTextSize(16);
        h.setTextColor(Color.rgb(100, 181, 246));
        h.setPadding(0, dp(28), 0, dp(4));
        root.addView(h);
    }

    private Button addButton(LinearLayout root, View.OnClickListener listener) {
        Button b = new Button(this);
        b.setAllCaps(false);
        b.setGravity(Gravity.START | Gravity.CENTER_VERTICAL);
        b.setTextSize(TypedValue.COMPLEX_UNIT_SP, 18);
        b.setOnClickListener(listener);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        lp.topMargin = dp(4);
        root.addView(b, lp);
        return b;
    }

    private int dp(int v) {
        return Math.round(v * getResources().getDisplayMetrics().density);
    }
}
