import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fetch = require('node-fetch'); 

const {JWT} = require('google-auth-library');
const SCOPES =  ['https://www.googleapis.com/auth/cloud-platform'];

const getAccessToken = function(){
  return new Promise(function(resolve, reject) {
    const key = require('sample-app.json');
    
    const jwtClient = new JWT(
      key.client_email,
      null,
      key.private_key,
      SCOPES,
      null
    );

    jwtClient.authorize(function(err, tokens) {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens?.access_token);
    });
  });
};


export const handler = async (event) => {
  // TODO implement

  console.log(event.key1);
  const accessToken = await getAccessToken();
  
/*
  notification.body = event.key1;
  notification.title = event.key2;
  message.notification = notification; */
  
  const url = 'https://fcm.googleapis.com/v1/projects/sample-app-936fd/messages:send'

  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };

  const data = {
    message: {
      token: 'eGZXpoN-xKwU0xw2OSGrpk:APA91bHSBtStdITyFmY0NKyfZZI_UXCfiTAFmGDKPYqCFpzh4dt_OofXQjEkJOBOhi7lrcRj6VKTVa29bpyPDJpcFBebKGU8kHMxtL8d9fj_UXPgalXaOppCe9IRD6pvj8RV_5Mg4xZC', 
      notification: {
        body: '5 to 1',
        title: 'Portugal vs. Denmark'
      }
    }
  };

  const options = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(data)
  };


  try{  
    const response = await fetch(url,options);
    const jsonData = await response.json();
    
    const result = {
      statusCode: 200,
      result: jsonData,
    };
  
    return result;    
    
  }catch(error){
    const result = {
      statusCode: 500,
      result: error.message,
    };
  
    return result;    
  }

};
