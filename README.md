## SendOtp - Node.js SDK

This SDK enables sendOTP and allows you to send OTP

### Set-up:

1. Download the NPM module
```node
npm install sendotp --save
```
2. Require the package in your code.
```javascript
const SendOtp = require('sendotp');
```
3. Initialize with your [MSG91](https://msg91.com) auth key
```javascript
const sendOtp = new SendOtp('AuthKey');
```
That's all, your SDK is set up!

### Requests

You now have the send, retry and verify otp via following methods.
```javascript
sendOtp.send(contactNumber, senderId, otp, callback); //otp is optional if not sent it'll be generated automatically
sendOtp.retry(contactNumber, retryVoice, callback);
sendOtp.verify(contactNumber, otpToVerify, callback);
```

### Note:
In `callback` function you'll get two parameters but you have to always listen for second param instead of direct error object.
Error object sample code
```javascript
{"type":"error","message":"ERROR_MESSAGE"}
```

### Usage:

##### To send OTP

```javascript
sendOtp.send("919999999999", "PRIIND", function (error, data) {
  console.log(data);
});
```

##### To send Custom OTP

Make sure OTP code length is set using `setOtpLength(otp_length)` where `otp_length` is same as length of custom OTP code.
```javascript
sendOtp.send("919999999999", "PRIIND", "4635", function (error, data) {
  console.log(data);
});
```

##### Optional settings.

Set OTP Expiry
```javascript
sendOtp.setOtpExpiry(otp_expiry); // otp_expiry is number of minutes (default: 1440, max: 1440, min: 1)`
```
Set OTP Length
```javascript
sendOtp.setOtpLength(otp_length); // otp_length is number (default: 4, max: 9, min: 4)
```
Set OTP Template
```javascript
sendOtp.setOtpTemplate(template); // template is string. 
```
**Important:** placeholder is ##OTP## (ex. `Your otp is ##OTP##.`)
Placeholder is required in template string which will be replaced with actual OTP by library.


To retry OTP
```javascript
sendOtp.retry("919999999999", false, function (error, data) {
  console.log(data);
});
```
**Note:** In sendOtp.retry() set retryVoice false if you want to retry otp via text, default value is true

To verify OTP
```javascript
sendOtp.verify("919999999999", "4365", function (error, data) {
  console.log(data); // data object with keys 'message' and 'type'
  if(data.type == 'success') console.log('OTP verified successfully')
  if(data.type == 'error') console.log('OTP verification failed')
});
```

### Options:

By default sendotp uses default message template, but custom message template can also set in constructor like
```javascript
const SendOtp = require('sendotp');
const sendOtp = new SendOtp('AuthKey', 'Otp for your order is {{otp}}, please do not share it with anybody');
```

`{{otp}}` expression is used to inject generated otp in message.

### Licence:

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
