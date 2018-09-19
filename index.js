"use strict";

let request = require('request');

class SendOtp {

  /**
   * Creates a new SendOtp instance
   * @param {string} authKey Authentication key
   * @param {string, optional} messageTemplate
   */
  constructor(authKey, messageTemplate) {
    this.authKey = authKey;
    if (messageTemplate) {
      this.messageTemplate = messageTemplate;
    } else {
      this.messageTemplate = "Your otp is ##OTP##.";
    }
    this.otp_expiry = 1440; //1 Day =1440 minutes
    this.otp_length = 4;
  }

  /**
   * Returns the base URL for MSG91 api call
   * @returns {string} Base URL for MSG91 api call
   */
  static getBaseURL() {
    return "https://control.msg91.com/api/";
  }

  /**
   * Set the OTP expiry minutes default: 1440, min: 1, max: 1440
   */
  setOtpExpiry(otp_expiry) {
    this.otp_expiry = otp_expiry;
    return;
  }

  /**
   * Set the OTP template.
   * The placeholder for OTP in the template content should be ##OTP## 
   * ##OTP## will be replaced with actual OTP.
   */
  setOtpTemplate(template) {
    this.messageTemplate = template;
    return;
  }

  /**
   * Set the OTP length between default: 4, min: 4, max: 9
   */
  setOtpLength(otp_length) {
    if (otp_length > 3 && otp_length < 10) {
      this.otp_length = otp_length;
      return;
    }
    throw new Error("OTP length is not in between 4 to 9.");
  }

  /**
   * Returns the 4 digit otp
   * @returns {integer} 4 digit otp
   */
  static generateOtp() {
    return Math.floor(1000 + Math.random() * 9000);
  }

  /**
   * Send Otp to given mobile number
   * @param {string} contactNumber receiver's mobile number along with country code
   * @param {string} senderId
   * @param {string, optional} otp
   * Return promise if no callback is passed and promises available
   */
  send(contactNumber, senderId, otp, callback) {
    let message = this.messageTemplate;
    let customOTP = undefined;
    if (typeof otp === 'function') {
      callback = otp;
    } else {
      let otpLength = otp.toString().length;
      if (otpLength === this.otp_length) {
        customOTP = otp;
        message = this.messageTemplate.replace('##OTP##', otp);
      } else {
        throw new Error("Invalid OTP length. Expected OTP length is " + this.otp_length);
      }
    }
    let args = {
      authkey: this.authKey,
      mobile: contactNumber,
      sender: senderId,
      message: message,
      otp_expiry: this.otp_expiry,
      otp_length: this.otp_length
    };

    if (customOTP) {
      args['otp'] = customOTP
    }
    return SendOtp.doRequest('get', "sendotp.php", args, callback);
  }

  /**
   * Retry Otp to given mobile number
   * @param {string} contactNumber receiver's mobile number along with country code
   * @param {boolean} retryVoice, false to retry otp via text call, default true
   * Return promise if no callback is passed and promises available
   */
  retry(contactNumber, retryVoice, callback) {
    let retryType = 'voice';
    if (!retryVoice) {
      retryType = 'text'
    }
    let args = {
      authkey: this.authKey,
      mobile: contactNumber,
      retrytype: retryType
    };

    return SendOtp.doRequest('get', "retryotp.php", args, callback);
  }

  /**
   * Verify Otp to given mobile number
   * @param {string} contactNumber receiver's mobile number along with country code
   * @param {string} otp otp to verify
   * Return promise if no callback is passed and promises available
   */
  verify(contactNumber, otp, callback) {
    let args = {
      authkey: this.authKey,
      mobile: contactNumber,
      otp: otp
    };
    return SendOtp.doRequest('get', "verifyRequestOTP.php", args, callback);
  }

  static doRequest(method, path, params, callback) {

    if (typeof params === 'function') {
      callback = params;
      params = {};
    }
    // Return promise if no callback is passed and promises available
    else if (callback === undefined && this.allow_promise) {
      promise = true;
    }

    let options = {
      method: method,
      url: SendOtp.getBaseURL() + "" + path
    };

    if (method === 'get') {
      options.qs = params;
    }

    // Pass form data if post
    if (method === 'post') {
      let formKey = 'form';

      if (typeof params.media !== 'undefined') {
        formKey = 'formData';
      }
      options[formKey] = params;
    }

    request(options, function (error, response, data) {
      // request error
      if (error) {
        return callback(error, data);
      }

      // JSON parse error or empty strings
      try {
        // An empty string is a valid response
        if (data === '') {
          data = {};
        }
        else {
          data = JSON.parse(data);
        }
      }
      catch (parseError) {
        return callback(
          new Error('JSON parseError with HTTP Status: ' + response.statusCode + ' ' + response.statusMessage),
          data
        );
      }


      // response object errors
      // This should return an error object not an array of errors
      if (data.errors !== undefined) {
        return callback(data.errors, data);
      }

      // status code errors
      if (response.statusCode < 200 || response.statusCode > 299) {
        return callback(
          new Error('HTTP Error: ' + response.statusCode + ' ' + response.statusMessage),
          data
        );
      }
      // no errors
      callback(null, data);
    });

  };

}

module.exports = SendOtp;
