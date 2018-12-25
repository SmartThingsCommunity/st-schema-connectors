This code is meant for AWS Lambda
1. Run `npm install --production` to install all the dependencies
2. Zip up the contents of the folder (not the root folder, but the contents). If you zip up the root folder, it won't unzip properly for AWS Lambda
3. Create a new Lambda and upload the code using the `"Upload from Zip"` option
