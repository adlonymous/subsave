import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

// Auth0 Configuration
const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'subsave',
  path: 'login',
});

export const AUTH0_CONFIG = {
  domain: 'dev-tnwsw10rjsmp013c.us.auth0.com',
  clientId: 'UPKYbOIfpqwgFjAs7XlLONHMflfZnWfV',
  audience: 'https://dev-tnwsw10rjsmp013c.us.auth0.com/api/v2/',
  scope: 'openid profile email',
  redirectUri: redirectUri,
};

// Debug: Log the redirect URI to see what's being generated
console.log('Auth0 Redirect URI:', redirectUri);
console.log('Auth0 Config:', AUTH0_CONFIG);

// Configure WebBrowser for better UX
WebBrowser.maybeCompleteAuthSession();

// Auth0 URLs
export const AUTH0_URLS = {
  authorize: `https://${AUTH0_CONFIG.domain}/authorize`,
  token: `https://${AUTH0_CONFIG.domain}/oauth/token`,
  userInfo: `https://${AUTH0_CONFIG.domain}/userinfo`,
  logout: `https://${AUTH0_CONFIG.domain}/v2/logout`,
};
