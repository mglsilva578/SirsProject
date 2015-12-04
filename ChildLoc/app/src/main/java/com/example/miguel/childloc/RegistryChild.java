package com.example.miguel.childloc;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;

public class RegistryChild extends AppCompatActivity {

    private String number;
    private EditText usernameChild;
    private EditText passwordChild;
    private EditText numberChild;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_registry_child);
        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        Intent i = getIntent();
        number = i.getExtras().getString("number");
        usernameChild = (EditText)findViewById(R.id.usernameRChild);
        passwordChild = (EditText)findViewById(R.id.passwordRChild);
        numberChild = (EditText) findViewById(R.id.numberRChild);
        numberChild.setText(number);
    }

    public void onLoginSuccess(){
        Context context = getApplicationContext();
        int duration = Toast.LENGTH_SHORT;
        Toast.makeText(context, "Finished Child Registry!", duration);
        Intent intent = new Intent(this, LoginActivity.class);
        startActivity(intent);
    }

    public void onLoginFail(){
        Context context = getApplicationContext();
        int duration = Toast.LENGTH_SHORT;
        Toast.makeText(context, "Finished Child Registry!", duration);
    }

    public void onFinish(View view){
        String username = usernameChild.getText().toString();
        String password = passwordChild.getText().toString();
        String numberText = numberChild.getText().toString();
        Log.d("miguel.childloc", numberText);

        if(!number.equals( numberText)){
            Context context = getApplicationContext();
            int duration = Toast.LENGTH_SHORT;
            Toast.makeText(context, "Wrong Number!", duration);
            return;
        }


        new RestRegistryHandler(new RestRegistryHandler.RegistryChild() {
            @Override
            public void onSuccess() {
                onLoginSuccess();
            }

            @Override
            public void onFail() {
                onLoginFail();
            }
        }).execute("filho", username,password, number);
    }

}
