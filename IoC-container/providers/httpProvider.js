const accessEnv = require("../../accessEnv");

const gotQl = require('gotql')
const got = require("got");

const url = require('url');
const AWS = require('aws-sdk');
const AWS4 = require('aws4');

const { isEmpty } = require("../../helpers");

const awsConfig = new AWS.Config({
  accessKeyId: accessEnv("AWS_SDK_ACCESS_ID", 'ACC_ID'),
  secretAccessKey: accessEnv("AWS_SDK_ACCESS_SECRET", 'ACC_SECRET'),
  region: accessEnv("AWS_SDK_REGION", 'us-west-2'),
  credentials: new AWS.Credentials({
    accessKeyId: accessEnv("AWS_SDK_ACCESS_ID", 'ACC_ID'),
    secretAccessKey: accessEnv("AWS_SDK_ACCESS_SECRET", 'ACC_SECRET'),
    sessionToken: accessEnv("AWS_SDK_SESSION_TOKEN", 'session')
  })
});

const awsSdkOptions = {
  region: awsConfig.region,
  headers: {
      accept: 'application/json',
      'content-type': 'application/json'
  },
  method: 'GET',
  json: true
};

/* @NOTE: <INDIRECTION> | We are wrapping and exposing a similar contract to the logic being wrapped for consumption */

/* @NOTE: This function implements the Adapter coding pattern for data query tasks */

const awsClient = (uri, options) => {
  let requestPayload = {}
  /* @HINT: We need to parse the URL before passing it to `got` so `aws4` can sign the request */
  if (typeof uri === "string") {
    requestPayload = Object.assign(
      typeof url['parse'] === "function"
        ? url.parse(uri)
        : new url.URL(uri),
        awsSdkOptions,
        options || {}
      );
  } else {
    if (uri instanceof Object) {
      requestPayload = uri
    }
  }

  if (isEmpty(requestPayload)) {
    throw new Error("no valid http request object");
  }

  AWS4.sign(
    requestPayload,
    awsConfig.credentials
  );

  return got(requestPayload); 
};

module.exports = function (c) {
  c.service("AWSHttpClient", () => awsClient);
  c.service("RestClient", () => got);
  c.service("GraphQLClient", () => gotQl)
};
