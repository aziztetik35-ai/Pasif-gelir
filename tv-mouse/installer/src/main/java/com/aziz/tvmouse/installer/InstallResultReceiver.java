package com.aziz.tvmouse.installer;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInstaller;
import android.widget.Toast;

/** Receives the result of the PackageInstaller session. */
public class InstallResultReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        int status = intent.getIntExtra(PackageInstaller.EXTRA_STATUS, PackageInstaller.STATUS_FAILURE);
        if (status == PackageInstaller.STATUS_PENDING_USER_ACTION) {
            Intent confirm = intent.getParcelableExtra(Intent.EXTRA_INTENT);
            if (confirm != null) {
                confirm.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(confirm);
            }
            return;
        }
        String text;
        if (status == PackageInstaller.STATUS_SUCCESS) {
            text = "TV Fare kuruldu ✓";
        } else {
            String msg = intent.getStringExtra(PackageInstaller.EXTRA_STATUS_MESSAGE);
            text = "Kurulum olmadı (kod " + status + ")" + (msg != null ? ": " + msg : "");
        }
        Toast.makeText(context, text, Toast.LENGTH_LONG).show();
        InstallerActivity.onInstallFinished(status == PackageInstaller.STATUS_SUCCESS, text);
    }
}
