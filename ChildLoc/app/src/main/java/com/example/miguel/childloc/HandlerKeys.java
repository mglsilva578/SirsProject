package com.example.miguel.childloc;

import android.os.AsyncTask;
import android.util.Log;

import org.apache.http.HttpResponse;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.util.EntityUtils;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.UnsupportedEncodingException;


public class HandlerKeys extends AsyncTask<String, String, String> {

    int code;
    public ExchangeKeys myExchange;

    public interface ExchangeKeys{
        void onSuccess(String prime, String generator);
        void onFail();
    }

    public HandlerKeys(ExchangeKeys ek){
        myExchange = ek;

    }

    @Override
    protected String doInBackground(String... params) {
        String message = "";
        HttpClient httpClient = new DefaultHttpClient();
        HttpGet httpGet = new HttpGet("http://secure-child-locator.herokuapp.com/users/shareModels");
        try {
            HttpResponse response = httpClient.execute(httpGet);
            code = response.getStatusLine().getStatusCode();
            Log.d("miguel.childloc", "Code: " + code + " Phrase " + response.getStatusLine().getReasonPhrase());
            String result = EntityUtils.toString(response.getEntity());
            JSONObject jason = new JSONObject(result);
            message = jason.getString("prime");
            result = jason.getString("generator");
            message = message + ";" + result;
        } catch (ClientProtocolException e) {
            e.printStackTrace();
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return message;
    }

    @Override
    protected void onPostExecute(String s){
        if(code == 200){
            String[] params = s.split(";");
            myExchange.onSuccess(params[0], params[1]);
        }else{
            myExchange.onFail();
        }
    }
}
