# Auth0 Setup Guide for SubSave

This guide will help you configure Auth0 authentication for your SubSave app.

## 1. Create an Auth0 Account

1. Go to [Auth0 Dashboard](https://manage.auth0.com/)
2. Sign up for a free account if you don't have one
3. Create a new tenant (or use the default one)

## 2. Create an Application

1. In the Auth0 Dashboard, go to **Applications** > **Applications**
2. Click **Create Application**
3. Choose **Single Page Application** as the application type (for Expo compatibility)
4. Give it a name like "SubSave Mobile App"
5. Click **Create**

## 3. Configure Application Settings

1. Go to your application's **Settings** tab
2. Note down your **Domain** and **Client ID**
3. Scroll down to **Allowed Callback URLs** and add:
   ```
   exp://127.0.0.1:8081/--/login
   exp://127.0.0.1:8082/--/login
   exp://10.251.148.204:8081/--/login
   exp://10.251.148.204:8082/--/login
   subsave://login
   ```
4. Scroll down to **Allowed Logout URLs** and add:
   ```
   exp://127.0.0.1:8081/--/login
   exp://127.0.0.1:8082/--/login
   exp://10.251.148.204:8081/--/login
   exp://10.251.148.204:8082/--/login
   subsave://login
   ```
5. Scroll down to **Allowed Web Origins** and add:
   ```
   exp://127.0.0.1:8081
   exp://127.0.0.1:8082
   exp://10.251.148.204:8081
   exp://10.251.148.204:8082
   subsave://login
   ```
6. Click **Save Changes**

## 4. Update App Configuration

1. Open `src/utils/auth0-config.ts`
2. Replace the placeholder values:
   ```typescript
   export const AUTH0_CONFIG = {
     domain: 'your-tenant.auth0.com', // Replace with your Auth0 domain
     clientId: 'your-client-id', // Replace with your Client ID
     audience: 'your-api-identifier', // Optional: Your API identifier
     scope: 'openid profile email',
     redirectUri: 'subsave://login',
   };
   ```

3. The configuration is now handled automatically through Expo's AuthSession

## 5. Configure User Profile

1. In Auth0 Dashboard, go to **User Management** > **Users**
2. You can create test users or use social logins
3. For social logins, go to **Authentication** > **Social** and enable providers like Google, Facebook, etc.

## 6. Test the Integration

1. Start your Expo development server:
   ```bash
   npm start
   ```

2. Run on your preferred platform:
   ```bash
   npm run ios     # iOS simulator
   npm run android # Android emulator
   npm run web     # Web browser
   ```

3. Tap "Sign In with Auth0" on the login screen
4. Complete the authentication flow
5. You should be redirected to the dashboard

## 7. Optional: Configure API Access

If you want to call your own APIs with the access token:

1. In Auth0 Dashboard, go to **Applications** > **APIs**
2. Click **Create API**
3. Give it a name and identifier
4. Update the `audience` field in `auth0-config.ts` with your API identifier

## 8. Production Considerations

For production deployment:

1. Update the callback URLs to match your production app's scheme
2. Configure proper CORS settings
3. Set up proper error handling and logging
4. Consider using Auth0's Rules and Hooks for additional security

## Troubleshooting

### Common Issues:

1. **"Invalid redirect URI"**: Make sure the callback URL in Auth0 matches exactly with your app's scheme
2. **"Invalid client"**: Verify your Client ID is correct
3. **"Invalid domain"**: Check that your Auth0 domain is correct and includes the protocol

### Debug Mode:

Enable debug logging by adding this to your app:
```typescript
// In your app's entry point
console.log('Auth0 Config:', AUTH0_CONFIG);
```

## Security Notes

- Never commit your Auth0 credentials to version control
- Use environment variables for production
- Regularly rotate your Client Secret (if using confidential clients)
- Monitor your Auth0 logs for suspicious activity

## Support

- [Auth0 Documentation](https://auth0.com/docs)
- [React Native Auth0 SDK](https://github.com/auth0/react-native-auth0)
- [Expo Auth0 Integration](https://docs.expo.dev/guides/authentication/#auth0)
