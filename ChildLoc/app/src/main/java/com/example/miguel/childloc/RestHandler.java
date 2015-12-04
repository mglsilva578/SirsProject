package com.example.miguel.childloc;


import android.os.AsyncTask;
import android.util.Log;

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;

import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;

import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.json.JSONException;
import org.json.JSONObject;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;


public class RestHandler extends AsyncTask<String,String, String>{

    String publicKey;
    public LoginCallback mycallback;
    public DadCallback myDadcallBack;
    public ChildCallback myChildBack;
    public boolean login = false;
    public boolean dadctivity = false;
    public boolean childtivity = false;
    int code;
    public RestHandler(LoginCallback callback){
        this.mycallback = callback;
    }

    public RestHandler(DadCallback dadcall){
        myDadcallBack = dadcall;
    }

    public RestHandler(ChildCallback childcall){myChildBack = childcall;}

    public interface ChildCallback{
        void onSuccess();
        void onFail();
    }

    public interface LoginCallback{
        void onSuccessDad(String token, String publicKey);
        void onSuccessChild(String token);
        void onFail();

    }

    public interface DadCallback{
        void onSuccess(String location);
        void onFail();
    }

    @Override
    protected String doInBackground(String... params) {
        String result = "";
        String message = "";
        String token = "";
        String publicKey = "";
        HttpClient httpClient = new DefaultHttpClient();
        switch (params[0]){
            case "Post":
                HttpPost httpPost = new HttpPost("http://secure-child-locator.herokuapp.com/users/login");
                try{
                    List<NameValuePair> nameValuePairs = new ArrayList<NameValuePair>(3);
                    nameValuePairs.add(new BasicNameValuePair("username", params[1]));
                    nameValuePairs.add(new BasicNameValuePair("password", params[2]));
                    nameValuePairs.add(new BasicNameValuePair("PublicKey", params[3]));
                    httpPost.setEntity(new UrlEncodedFormEntity(nameValuePairs));
                    HttpResponse response = httpClient.execute(httpPost);
                    code = response.getStatusLine().getStatusCode();
                    Log.d("miguel.childloc", "Code: " + code + " Phrase: " + response.getStatusLine().getReasonPhrase());
                    result = EntityUtils.toString(response.getEntity());
                    Log.d("miguel.childloc",result);
                    JSONObject jason = new JSONObject(result);
                    message = jason.getString("relation");
                    token = jason.getString("token");
                    publicKey = jason.getString("PublicKey");
                    message = message + ";" + token + ";" + publicKey;
                    Log.d("miguel.childloc", message);
                    login = true;
                }catch (ClientProtocolException e){
                    Log.i("miguel.childloc", "Protocol error!");
                } catch (UnsupportedEncodingException e) {
                    e.printStackTrace();
                } catch (IOException e) {
                    e.printStackTrace();
                } catch (JSONException e) {
                    e.printStackTrace();
                }
                break;
            case "Get":
                HttpGet httpGet = new HttpGet("http://secure-child-locator.herokuapp.com/users/childLocation");
                try {
                    Log.d("miguel.childloc", "Token:  " + params[1]);
                    httpGet.setHeader("token", params[1]);
                    HttpResponse response = httpClient.execute(httpGet);
                    code = response.getStatusLine().getStatusCode();
                    Log.d("miguel.childloc", "Code: " + code + " StatusMessage: " + response.getStatusLine().getReasonPhrase());
                    result = EntityUtils.toString(response.getEntity());
                    dadctivity = true;
                    return result;
                } catch (IOException e) {
                    e.printStackTrace();
                }
                break;
            case "Put":
                HttpPut httpPut = new HttpPut("http://secure-child-locator.herokuapp.com/users/updateLocation");
                try{
                    Log.d("miguel.childloc", params[3]);
                    List<NameValuePair> nameValuePairs = new ArrayList<NameValuePair>(3);
                    nameValuePairs.add(new BasicNameValuePair("latitude", params[1]));
                    nameValuePairs.add(new BasicNameValuePair("longitude", params[2]));
                    nameValuePairs.add(new BasicNameValuePair("token", params[3]));
                    httpPut.setEntity(new UrlEncodedFormEntity(nameValuePairs));
                    HttpResponse response = httpClient.execute(httpPut);
                    code = response.getStatusLine().getStatusCode();
                    Log.d("miguel.childloc", "Code: " + code + " Reason Phrase: " +  response.getStatusLine().getReasonPhrase());
                    childtivity = true;
                }catch (ClientProtocolException e){

                }
                 catch (IOException e) {
                     e.printStackTrace();
                }

                break;
        }

        return message;
    }


    @Override
    protected void onPostExecute(String s) {
        if(code == 200){
            if(childtivity) myChildBack.onSuccess();
            Log.d("miguel.childloc", "Response: " + s);
            if(dadctivity) myDadcallBack.onSuccess(s);
            if(login){
                String[] param = s.split(";");
                Log.i("miguel.childloc","Relaçao: "+ param[0] + " token: " + param[1]);
                if(param[0].equals("pai")){mycallback.onSuccessDad(param[1], param[2]);}
                if(param[0].equals("filho")){mycallback.onSuccessChild(param[1]);}
            }
        }
        else{
            if(childtivity)myChildBack.onFail();
            if(dadctivity){myDadcallBack.onFail();}
            if(login)mycallback.onFail();
        }
        childtivity = false;
        dadctivity = false;
        login = false;
    }
}
