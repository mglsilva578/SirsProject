package com.example.miguel.childloc;



import android.util.Base64;

import java.math.BigInteger;

import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;

import java.security.PrivateKey;
import java.security.PublicKey;

import javax.crypto.KeyAgreement;
import javax.crypto.SecretKey;
import javax.crypto.spec.DHParameterSpec;



public class EncryptMessages{


   public static KeyPair createKeyPair(String prime, String generator) throws Exception{

       BigInteger bigprime = new BigInteger(Base64.decode(prime, Base64.DEFAULT));
       BigInteger bigenerator = new BigInteger(Base64.decode(generator, Base64.DEFAULT));

       KeyPairGenerator kpg = KeyPairGenerator.getInstance("DiffieHellman");
       DHParameterSpec pspec = new DHParameterSpec(bigprime, bigenerator);
       kpg.initialize(pspec);

       KeyPair kp = kpg.generateKeyPair();

       KeyFactory keyFactory = KeyFactory.getInstance("DiffieHellman");
       //DHPublicKeySpec kspec = (DHPublicKeySpec) keyFactory.getKeySpec(kp.getPublic(), DHPublicKeySpec.class);
       //DHPrivateKeySpec kpspec = (DHPrivateKeySpec) keyFactory.getKeySpec(kp.getPrivate(), DHPrivateKeySpec.class);

       //System.out.println(kspec.toString());
       //System.out.println(kpspec.toString());


       return null;
   }


    public static SecretKey combine(PrivateKey private1,PublicKey public1) throws Exception {
        KeyAgreement ka = KeyAgreement.getInstance("DH");
        ka.init(private1);
        ka.doPhase(public1, true);
        SecretKey secretKey = ka.generateSecret("AES");

        return secretKey;
    }


}


