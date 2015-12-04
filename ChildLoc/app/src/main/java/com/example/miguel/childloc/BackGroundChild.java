package com.example.miguel.childloc;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.IBinder;
import android.preference.PreferenceManager;
import android.util.Log;



public class BackGroundChild extends Service {
    LocationManager locationManager;
    LocationListener listener;


    SharedPreferences childPreferences;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.i("miguel.childloc", "ChildListener");

        childPreferences = PreferenceManager.getDefaultSharedPreferences(this);
        String token = intent.getExtras().getString("token");
        saveAccessToken(token);
        Log.d("miguel.childloc", token);
        getChildLocation();

        return Service.START_STICKY;
    }
    public void saveAccessToken(String token){

        childPreferences.edit().putString("access_token", token).apply();
    }

    public String getAccessToken(){
        return childPreferences.getString("access_token", "");
    }



    public void getChildLocation(){
        locationManager = (LocationManager) getSystemService(Context.LOCATION_SERVICE);
        listener = new MyLocationListener();
        //locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 4000, 0, listener);
        locationManager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 180000, 150 , listener);
    }

    public class MyLocationListener implements LocationListener
    {
        String token = getAccessToken();

        public void onLocationChanged(Location loc)
        {
            Log.i("miguel.childloc", "latitude "+ loc.getLatitude() + " longitude " + loc.getLongitude());
            new RestHandler(new RestHandler.ChildCallback() {
                @Override
                public void onSuccess() {
                    Log.i("miguel.childloc", "Success In sending location!");
                }

                @Override
                public void onFail() {
                    Log.d("miguel.childloc", "Failed in sending location");
                }
            }).execute("Put","" + loc.getLatitude(), "" + loc.getLongitude(), token);

        }

        public void onProviderDisabled(String provider)
        {
        }


        public void onProviderEnabled(String provider)
        {
        }


        public void onStatusChanged(String provider, int status, Bundle extras)
        {

        }

    }



    @Override
    public void onDestroy() {
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }



}
