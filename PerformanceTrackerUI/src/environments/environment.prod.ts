export const environment = {
  production: true,
  apiUrl: '/api/v1',  // In production, use relative URL (proxied by Nginx)
  cognito: {
    region: 'eu-west-2',
    userPoolId: 'eu-west-2_6wkiI18uy',
    userPoolWebClientId: '45f8pimgb0aldtkq765qfiht59'
  }
};
