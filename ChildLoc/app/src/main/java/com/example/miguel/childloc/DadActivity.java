package com.example.miguel.childloc;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;

import android.os.Message;
import android.preference.PreferenceManager;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.View;

import android.widget.TextView;

import android.widget.Toast;
import android.os.Handler;

import org.json.JSONException;
import org.json.JSONObject;




public class DadActivity extends AppCompatActivity {

    TextView childText;
    String latitude = "";
    String longitude = "";
    SharedPreferences dadPreferences;
    String tokendeEnvio;


    @Override
    protected void onCreate(Bundle savedInstanceState){
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_dad);
        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        childText = (TextView) findViewById(R.id.ShowChildLocation);
        String token = getIntent().getExtras().getString("token");
        tokendeEnvio = token;
        Log.i("miguel.childloc" , "onCreate: " + token );
        dadPreferences = PreferenceManager.getDefaultSharedPreferences(getApplicationContext());
        saveAccessToken(token);
    }

    public void saveAccessToken(String token){
        dadPreferences.edit().putString("access_dad_token", token);
    }
    public String getAccessToken(){
        return dadPreferences.getString("access_dad_token", "");
    }

    Handler handler = new Handler() {
        @Override
        public void handleMessage(Message msg) {
            childText.setText("Not Showing!");
            latitude = "";
            longitude = "";
        }
    };


    public void launchMap(View view){
        String html = "http://maps.google.com/maps?q=latitude,longitude&ll=latitude,longitude&z=17";
        if((!latitude.equals("")) && (!longitude.equals(""))) {
            html = html.replaceAll("latitude", latitude + "");
            html = html.replaceAll("longitude", longitude + "");
            Log.i("miguel.childloc", html);
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(html));
            startActivity(intent);
        }

    }

    public void giveLocation(View view){
        Context context = getApplicationContext();
        int duration = Toast.LENGTH_SHORT;
        String token = getAccessToken();
        Log.d("miguel.childloc","Before get :" +  token);
        new RestHandler(new RestHandler.DadCallback(){
            @Override
            public void onSuccess(String location) {
                try {
                    Log.i("miguel.childloc", "Localizacão de criança recebido");
                    JSONObject jason = new JSONObject(location);
                    latitude = jason.getString("latitude");
                    longitude = jason.getString("longitude");
                    childText.setText("latitude: " + latitude + " longitude " + longitude);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }

            @Override
            public void onFail() {
                Log.d("miguel.childloc", "Failed to get coordinates");
            }
        }).execute("Get", tokendeEnvio);
        Toast.makeText(context, "Getting your child location!",duration).show();




        Runnable r = new Runnable() {
            @Override
            public void run() {
                synchronized (this){
                    try {
                        wait(10000);
                    } catch (InterruptedException e) {
                        Log.i("miguel.childloc", "can't wait");
                    }
                }
                handler.sendEmptyMessage(0);
            }
        };
        Thread thread = new Thread(r);
        thread.start();

    }








}
