package com.example.miguel.childloc;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.app.NotificationCompat;
import android.support.v7.widget.Toolbar;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;



public class RegisterUser extends AppCompatActivity {

    public EditText usernameR;
    public EditText passwordR;
    NotificationCompat.Builder notification;
    private static final int uniqueID = 43923;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register_user);
        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        usernameR = (EditText)findViewById(R.id.usernameRDad);
        passwordR = (EditText)findViewById(R.id.passwordRDad);
        notification = new NotificationCompat.Builder(this);
        notification.setAutoCancel(true);


    }
    public void startRegistryChild(String number){
        Context context = getApplicationContext();
        int duration = Toast.LENGTH_SHORT;
        Toast.makeText(context, "Registry successful!", duration).show();
        notification.setSmallIcon(R.mipmap.ic_launcher);
        notification.setWhen(System.currentTimeMillis());
        notification.setContentTitle("Your child's number is:");
        notification.setContentText(number);
        Intent i = new Intent(this, LoginActivity.class);
        PendingIntent pI = PendingIntent.getActivity(this, 0, i, PendingIntent.FLAG_UPDATE_CURRENT);
        notification.setContentIntent(pI);
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        nm.notify(uniqueID, notification.build());
        Intent intent = new Intent(this, RegistryChild.class);
        intent.putExtra("number", number);
        startActivity(intent);
    }

    public void failedReg(){
        Context context = getApplicationContext();
        int duration = Toast.LENGTH_SHORT;
        Toast.makeText(context, "Failed to register", duration).show();
    }

    public void onContinue(View view){
        String username = usernameR.getText().toString();
        String password = passwordR.getText().toString();
        new RestRegistryHandler(new RestRegistryHandler.RegistryDad() {
            @Override
            public void onSuccess(String s) {
                startRegistryChild(s);
            }

            @Override
            public void onFail() {
                failedReg();
            }
        }).execute("pai", username, password);
    }

}
