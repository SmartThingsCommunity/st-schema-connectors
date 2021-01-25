# SleepIQ Bed SmartThings App

This is lambda SmartApp controls Sleep IQ bed to achive atomation.
It uses Amazon Cognito as ouath2 server and the README file explains how to set it up
There is also a local version for debugging purposes

## To Do
1. Sleeping sensor - the bed knows when you sleep or not, how we can get it in real time
2. Alternative UI - i tried several options, for some reason it does not work
3. Timer for heater (not super needed, never changed it)

## Setup instructions

### Prerequisites

- An [AWS](https://www.serverless.com/framework/docs/providers/aws/guide/credentials/) account (free tier is fine).
- A [Samsung account](https://account.samsung.com/membership/index.do) and the SmartThings mobile application.
- A [Developer Workspace](https://smartthings.developer.samsung.com/workspace/) account.
- A SleepIQ bed and account

#### If testing locally (using provided webserver)
- [Node.js](https://nodejs.org) and [npm](https://npmjs.com) installed (verified with npm version 6.14.8 and Node 12.19.0).
- [ngrok](https://ngrok.com/) installed to create a secure tunnel and create a globally available URL for fast testing.

### Start

We've provided two options: the intended deployment platform for this automation (AWS Lambda) and a simple web server that can be used to run and test locally. 

Clone or download this repository and follow the desired option.

### Lambda

1. Install the dependencies for this app: `npm install`.

2. Follow the instructions to [setup AWS credentials](https://www.serverless.com/framework/docs/providers/aws/guide/credentials/) for serverless.

3. Edit file my-serverless.yaml in the config directory, use .env.example as an example and add correct values

4. Deploy the Lambda function: `serverless deploy`.

5. Navigate to the AWS Lambda dashboard (https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html) make sure all 6 config variables are set.

6. Follow the steps to grant SmartThings [permission to execute your Lambda function](https://smartthings.developer.samsung.com/docs/smartapps/aws-lambda.html). **This is required for successful registration.**


### Configure AWS Cognito
I'm using AWS Cognito as ouath2 provider. Free tier will be enough
1. Configure user pool (I'm using name and email)
2. Configure app client (nothing fancy)
3. In app client settings set callback url to https://c2c-us.smartthings.com/oauth/callback. Set allowed OAuth flows to authorize code grant. Set allowed ouath scope to openid
4. Select your domain name
5. In the Samsung Workspace set the client id and client secret to the client id and client secret you got in step 2. Set Authorization URI to 
https://{domain-name-from-step-4}-prod.auth.us-east-1.amazoncognito.com/oauth2/authorize. Set token URI to https://{domain-name-from-step-4}-prod.auth.us-east-1.amazoncognito.com/oauth2/token/ Most importanly setup you OAuth scope ot openid
6. I creted to users in the user pool for me and my wife. The emails and names should much the email and name you have in your sleep iq app.
7. Download a webtoken file from https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/jwks.json and save it in config/webtooken.json


### Glitch (no account required)

[![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/import/github/gilderman/sleep-iq-bed)

### Local

1. Create a `.env` and store your SleepIQ email/password as shown in `.env.example` file. In addtion set 
ACCESS_TOKEN_CLIENT_ID=client id you got in Cognito
CLIENT_ID=YOUR_CLIENT_ID_FRROM_DEV_WORKSPACE
CLIENT_SERCRET=YOUR_CLIENT_SECRET_FROM_DEV_WORKSPACE
USER_INFO_ENDPOINT=https://{cognito-domain-name}-prod.auth.{region}.amazoncognito.com/oauth2/userInfo

2. Install the dependencies for this app: `npm install`.

3. Start the server: `npm start`.

4. Start ngrok (in another terminal window/tab): `ngrok http 3005`. Copy the `https:` URL to your clipboard.

### Register

1. Follow the instructions for [registering a SmartApp](https://smartthings.developer.samsung.com/docs/smartapps/app-registration.html) with the SmartThings platform.
	
#### Local Only

A `CONFIRMATION request` log should show in the log output of the local server once registered. Navigate to this link to [verify your domain ownership](https://smartthings.developer.samsung.com/docs/smartapps/webhook-apps.html#Verify-your-domain-ownership) and enable the app to receive events. **This is required for successful installation.**

### Test

Follow the instructions for [testing a SmartApp](https://smartthings.developer.samsung.com/docs/testing/how-to-test.html).

## Troubleshooting

### Local

- When installing the SmartApp in the SmartThings mobile app, if you get an error **Something went wrong. Please try to install the SmartApp again**, then it is possible that you did not navigate to the confirmation link as specified above. If this is the case, then in the npm server terminal you will also see an error. Make sure you navigate to the URL sent with the `CONFIRMATION request` to the npm server. This can be resent by navigating to Developer Workspace `Overview` and clicking `Verify App Registration`.

## Documentation

- Documentation for developing SmartApps can be found on the [SmartThings developer portal](https://smartthings.developer.samsung.com/develop/guides/smartapps/basics.html).
- [SmartThings API reference documentation](https://smartthings.developer.samsung.com/develop/api-ref/st-api.html)
- [SmartApp API reference documentation](https://smartthings.developer.samsung.com/docs/api-ref/smartapps-v1.html)

## Credits

This app is based om the SmartThing example called  weather-color-light-smartapp-nodejs

