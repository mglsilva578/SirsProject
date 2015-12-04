package com.example.miguel.childloc;

import android.os.AsyncTask;
import android.util.Log;

import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;

import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.apache.http.util.EntityUtils;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.List;


public class RestRegistryHandler extends AsyncTask<String, String, String> {


    public RegistryDad myRegistryDad;
    public RegistryChild myRegistryChild;
    int code;
    public boolean child = false;
    public boolean dad = false;

    public RestRegistryHandler(RegistryChild registry){
        myRegistryChild = registry;
    }
    public RestRegistryHandler(RegistryDad registry){
        myRegistryDad = registry;
    }

    public interface RegistryDad{
        void onSuccess(String s);
        void onFail();
    }
    public interface RegistryChild{
        void onSuccess();
        void onFail();
    }

    @Override
    protected String doInBackground(String... params) {
        String result = "";
        String message = "";
        HttpClient httpClient = new DefaultHttpClient();
        switch (params[0]){
            case "pai":
                HttpPost httpPost = new HttpPost("http://secure-child-locator.herokuapp.com/users/addUser");
                try {
                    List<NameValuePair> nameValuePairs = new ArrayList<NameValuePair>(3);
                    nameValuePairs.add(new BasicNameValuePair("username", params[1]));
                    nameValuePairs.add(new BasicNameValuePair("password", params[2]));
                    nameValuePairs.add(new BasicNameValuePair("relation", params[0]));
                    httpPost.setEntity(new UrlEncodedFormEntity(nameValuePairs));
                    HttpResponse response = httpClient.execute(httpPost);
                    code = response.getStatusLine().getStatusCode();
                    result = EntityUtils.toString(response.getEntity());
                    Log.d("miguel.childloc", result);
                    JSONObject jason = new JSONObject(result);
                    message = jason.getString("linkNumber");
                    dad = true;

                } catch (JSONException e) {
                    e.printStackTrace();
                } catch (ClientProtocolException e) {
                    e.printStackTrace();
                } catch (UnsupportedEncodingException e) {
                    e.printStackTrace();
                } catch (IOException e) {
                    e.printStackTrace();
                }
                break;
            case "filho":
                HttpPost httpPost2 = new HttpPost("http://secure-child-locator.herokuapp.com/users/addUser");
                try{
                    Log.d("miguel.childloc", params[3]);
                    List<NameValuePair> nameValuePairs = new ArrayList<NameValuePair>(4);
                    nameValuePairs.add(new BasicNameValuePair("username", params[1]));
                    nameValuePairs.add(new BasicNameValuePair("password", params[2]));
                    nameValuePairs.add(new BasicNameValuePair("linkNumber", params[3]));
                    nameValuePairs.add(new BasicNameValuePair("relation", params[0]));
                    httpPost2.setEntity(new UrlEncodedFormEntity(nameValuePairs));
                    HttpResponse response = httpClient.execute(httpPost2);
                    code = response.getStatusLine().getStatusCode();
                    message = response.getStatusLine().getReasonPhrase();
                    Log.d("miguel.childloc", message);
                    Log.d("miguel.childloc", code + "");
                    child = true;
                } catch (ClientProtocolException e) {
                    e.printStackTrace();
                } catch (IOException e) {
                    e.printStackTrace();
                }
                break;
        }

        return message;
    }

    @Override
    protected void onPostExecute(String s) {
        if(code == 200){
            if(dad) myRegistryDad.onSuccess(s);
            if(child) myRegistryChild.onSuccess();
        }
        else{
            if(dad)myRegistryDad.onFail();
            if(child) myRegistryChild.onFail();
        }
        dad = false;
        child = false;
    }
}
