package com.aziz.tvmouse.installer;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.pm.PackageInstaller;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Installs TV Fare with a PackageInstaller session. Android does not lock the accessibility
 * setting ("restricted settings") for apps installed this way.
 */
public class InstallerActivity extends Activity {

    private static final String TARGET = "com.aziz.tvmouse";
    private static final String ASSET = "TvFare.apk";

    private static InstallerActivity current;
    private static String lastResult;

    private TextView status;
    private Button uninstallButton;
    private Button permissionButton;
    private Button installButton;
    private Button openButton;

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
        status.setTextSize(20);
        status.setTextColor(Color.WHITE);
        status.setPadding(0, dp(16), 0, dp(16));
        root.addView(status);

        uninstallButton = addButton(root, "1. Eski TV Fare uygulamasını kaldır", new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent i = new Intent(Intent.ACTION_DELETE, Uri.parse("package:" + TARGET));
                startActivity(i);
            }
        });
        permissionButton = addButton(root, "2. Kurulum iznini ver", new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                openInstallPermission();
            }
        });
        installButton = addButton(root, "3. TV Fare uygulamasını kur", new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                install();
            }
        });
        openButton = addButton(root, "4. TV Fare uygulamasını aç", new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent launch = getPackageManager().getLeanbackLaunchIntentForPackage(TARGET);
                if (launch == null) {
                    launch = getPackageManager().getLaunchIntentForPackage(TARGET);
                }
                if (launch != null) {
                    startActivity(launch);
                }
            }
        });

        TextView help = new TextView(this);
        help.setTextSize(18);
        help.setTextColor(Color.LTGRAY);
        help.setPadding(0, dp(24), 0, 0);
        help.setText("Bu uygulama TV Fare uygulamasını kurar. Bu yöntem ile Android, "
                + "erişilebilirlik ayarını kilitlemez.\n\n"
                + "Adımları sırayla yapın. Kurulumdan sonra TV Fare uygulamasını açın. "
                + "Sonra \"TV Fare İmleci\" hizmetini AÇIK yapın.\n\n"
                + "Not: Eski TV Fare uygulamasını mutlaka önce kaldırın. "
                + "Güncelleme kurulumu kilidi kaldırmaz.");
        root.addView(help);

        ScrollView scroll = new ScrollView(this);
        scroll.addView(root);
        setContentView(scroll);
    }

    @Override
    protected void onResume() {
        super.onResume();
        current = this;
        refresh();
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (current == this) {
            current = null;
        }
    }

    static void onInstallFinished(boolean success, String text) {
        lastResult = text;
        if (current != null) {
            current.refresh();
        }
    }

    private void refresh() {
        boolean installed = isTargetInstalled();
        boolean canInstall = canInstallPackages();

        StringBuilder sb = new StringBuilder();
        sb.append("TV Fare: ").append(installed ? "KURULU" : "KURULU DEĞİL");
        sb.append("\nKurulum izni: ").append(canInstall ? "VAR ✓" : "YOK");
        if (lastResult != null) {
            sb.append("\nSon kurulum: ").append(lastResult);
        }
        status.setText(sb);

        uninstallButton.setEnabled(installed);
        permissionButton.setEnabled(!canInstall);
        installButton.setEnabled(canInstall && !installed);
        openButton.setEnabled(installed);

        Button next = installed && lastResult == null ? uninstallButton
                : !canInstall ? permissionButton
                : !installed ? installButton
                : openButton;
        next.requestFocus();
    }

    private void install() {
        PackageInstaller installer = getPackageManager().getPackageInstaller();
        PackageInstaller.SessionParams params =
                new PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL);
        params.setAppPackageName(TARGET);
        PackageInstaller.Session session = null;
        try {
            int id = installer.createSession(params);
            session = installer.openSession(id);
            try (InputStream in = getAssets().open(ASSET);
                 OutputStream out = session.openWrite(ASSET, 0, -1)) {
                byte[] buf = new byte[65536];
                int n;
                while ((n = in.read(buf)) > 0) {
                    out.write(buf, 0, n);
                }
                session.fsync(out);
            }
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= 31) {
                flags |= PendingIntent.FLAG_MUTABLE;
            }
            PendingIntent result = PendingIntent.getBroadcast(this, id,
                    new Intent(this, InstallResultReceiver.class), flags);
            session.commit(result.getIntentSender());
            Toast.makeText(this, "Kurulum başladı…", Toast.LENGTH_SHORT).show();
        } catch (IOException | RuntimeException e) {
            if (session != null) {
                session.abandon();
            }
            lastResult = "Hata: " + e.getMessage();
            refresh();
        } finally {
            if (session != null) {
                session.close();
            }
        }
    }

    private void openInstallPermission() {
        if (Build.VERSION.SDK_INT < 26) {
            return;
        }
        try {
            startActivity(new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                    Uri.parse("package:" + getPackageName())));
        } catch (RuntimeException e) {
            try {
                startActivity(new Intent(Settings.ACTION_SECURITY_SETTINGS));
            } catch (RuntimeException e2) {
                Toast.makeText(this, "Ayarlar > Uygulamalar > Güvenlik > Bilinmeyen kaynaklar: "
                        + getString(R.string.app_name) + " için izin verin.", Toast.LENGTH_LONG).show();
            }
        }
    }

    private boolean canInstallPackages() {
        return Build.VERSION.SDK_INT < 26 || getPackageManager().canRequestPackageInstalls();
    }

    private boolean isTargetInstalled() {
        try {
            getPackageManager().getPackageInfo(TARGET, 0);
            return true;
        } catch (PackageManager.NameNotFoundException e) {
            return false;
        }
    }

    private Button addButton(LinearLayout root, String text, View.OnClickListener listener) {
        Button b = new Button(this);
        b.setText(text);
        b.setOnClickListener(listener);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        lp.gravity = Gravity.START;
        lp.topMargin = dp(8);
        root.addView(b, lp);
        return b;
    }

    private int dp(int v) {
        return Math.round(v * getResources().getDisplayMetrics().density);
    }
}
