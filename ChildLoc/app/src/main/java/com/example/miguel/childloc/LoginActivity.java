package com.example.miguel.childloc;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;


import android.os.Bundle;

import android.support.v7.app.AppCompatActivity;
import android.support.v7.app.NotificationCompat;
import android.util.Base64;
import android.util.Log;
import android.view.View;
import android.widget.TextView;
import android.widget.Button;
import android.widget.Toast;

import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;

import javax.crypto.SecretKey;


import static com.example.miguel.childloc.EncryptMessages.combine;
import static com.example.miguel.childloc.EncryptMessages.createKeyPair;


public class LoginActivity extends AppCompatActivity {


    NotificationCompat.Builder notification;
    private static final int uniqueID = 43923;
    TextView usernameText;
    TextView passwordText;
    Button signIn;
    Button register;
    KeyPair kp;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        usernameText = (TextView) findViewById(R.id.LocUser);
        passwordText = (TextView) findViewById(R.id.LocPass);
        signIn = (Button) findViewById(R.id.SignInButton);
        register = (Button) findViewById(R.id.RegisterButton);
        notification = new NotificationCompat.Builder(this);
        notification.setAutoCancel(true);
       /* try {
            keys();
        } catch (Exception e) {
            e.printStackTrace();
        }
        */

    }



    public void callDadIntent(String token, String publicKey){
        try {
            byte[] encodedKey = Base64.decode(publicKey, Base64.DEFAULT);
            //X509EncodedKeySpec keySpec = new X509EncodedKeySpec(encodedKey);
            //PublicKey pk = keyFactory.generatePublic(encodedKey);
            PublicKey pk = KeyFactory.getInstance("DH").generatePublic(new X509EncodedKeySpec(encodedKey));
            SecretKey sk = combine(kp.getPrivate(), pk);
            System.out.println(Base64.encodeToString(sk.getEncoded(), Base64.DEFAULT));
        } catch (Exception e) {
            e.printStackTrace();
        }
        Intent intentParent = new Intent(this, DadActivity.class);
        intentParent.putExtra("token", token);
        startActivity(intentParent);
    }

    public void keys(){

        new HandlerKeys(new HandlerKeys.ExchangeKeys() {
            @Override
            public void onSuccess(String prime, String generator) {
                try {
                    createKeyPair(prime, generator);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            @Override
            public void onFail() {

            }
        }).execute();
    }

    public void OnClick(View view) {

        //keys();

        //Intent intentChild = new Intent(this, BackgroundChild.class);
        new RestHandler(new RestHandler.LoginCallback() {
            @Override
            public void onSuccessDad(String token, String publicKey) {
                Context context = getApplicationContext();
                int duration = Toast.LENGTH_SHORT;
                Toast.makeText(context, "Hello Dad!", duration).show();
                callDadIntent(token, publicKey);
            }
            @Override
            public void onSuccessChild(String token){
                Context context = getApplicationContext();
                int duration = Toast.LENGTH_SHORT;
                Toast.makeText(context, "Hello boy!", duration).show();
                Toast.makeText(context, "Login accepted, launching service!", duration).show();
                ChildListener(token);
            }

            @Override
            public void onFail() {
                Context context = getApplicationContext();
                int duration = Toast.LENGTH_SHORT;
                Toast.makeText(context, "Fail to Login", duration).show();
            }
        }).execute("Post", usernameText.getText().toString(), passwordText.getText().toString(), Base64.encodeToString(kp.getPublic().getEncoded(), Base64.DEFAULT));


    }

    public void ChildListener(String token){
        Log.i("miguel.childloc", "ChildListener");
        notification.setSmallIcon(R.mipmap.ic_launcher);
        notification.setWhen(System.currentTimeMillis());
        notification.setContentTitle("App running on background");
        notification.setContentText("listening for parent requests");
        Intent i = new Intent(this, LoginActivity.class);
        PendingIntent pI = PendingIntent.getActivity(this, 0, i, PendingIntent.FLAG_UPDATE_CURRENT);
        notification.setContentIntent(pI);
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        nm.notify(uniqueID, notification.build());

        Intent intentChild = new Intent(this, BackGroundChild.class);
        intentChild.putExtra("token", token);
        startService(intentChild);
    }


    public void onRegister(View view){
        Intent intent = new Intent(this, RegisterUser.class);
        startActivity(intent);
    }

}

