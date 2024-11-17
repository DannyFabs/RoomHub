const amplifyconfig = '''  {
  "UserAgent": "aws-amplify-cli/2.0",
  "Version": "1.0",
  "auth": {
    "plugins": {
      "awsCognitoAuthPlugin": {
        "IdentityManager": {
          "Default": {}
        },
        "CredentialsProvider": {
          "CognitoIdentity": { 
            "Default": {
              "PoolId": "ca-central-1:3783d3fa-7a70-4cb2-a0aa-d420bbe971be",
              "Region": "ca-central-1"
            }
          }
        },
        "CognitoUserPool": {
          "Default": {
            "PoolId": "ca-central-1_Zf1Le0mD8",
            "AppClientId": "465tpfq3gg5qs2d75u9c9fcm2r",
            "Region": "ca-central-1"
          }
        },
        "Auth": {
          "Default": {
            "authenticationFlowType": "USER_SRP_AUTH"
          }
        }
      }
    }
  }
}''';
