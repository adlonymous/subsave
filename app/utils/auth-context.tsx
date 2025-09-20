import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { AUTH0_CONFIG, AUTH0_URLS } from './auth0-config';
import { tokenStorage } from './token-storage';

interface UserInfo {
  sub: string;
  name: string;
  email: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  nickname?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: UserInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  updateDisplayName: (name: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already authenticated on app start
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // Check if we have stored credentials
      const storedToken = await getStoredToken();
      if (storedToken) {
        const userInfo = await fetchUserInfo(storedToken);
        setUser(userInfo);
        setAccessToken(storedToken);
      }
    } catch (error) {
      console.log('No existing credentials found');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserInfo = async (token: string): Promise<UserInfo> => {
    const response = await fetch(AUTH0_URLS.userInfo, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }
    
    const userInfo = await response.json();
    
    // Debug: Log what Auth0 returns
    console.log('Auth0 User Info:', userInfo);
    
    // Handle different Auth0 response formats
    if (userInfo.name === userInfo.email || !userInfo.name || userInfo.name.trim() === '') {
      // Try to get name from other fields first
      if (userInfo.given_name && userInfo.family_name) {
        userInfo.name = `${userInfo.given_name} ${userInfo.family_name}`;
        console.log('Using given_name + family_name:', userInfo.name);
      } else if (userInfo.given_name) {
        userInfo.name = userInfo.given_name;
        console.log('Using given_name:', userInfo.name);
      } else if (userInfo.nickname) {
        userInfo.name = userInfo.nickname;
        console.log('Using nickname:', userInfo.name);
      } else {
        // Extract name from email as fallback
        const emailName = userInfo.email.split('@')[0];
        userInfo.name = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        console.log('Extracted name from email:', userInfo.name);
      }
    }
    
    return userInfo;
  };

  const getStoredToken = async (): Promise<string | null> => {
    return await tokenStorage.getToken();
  };

  const storeToken = async (token: string): Promise<void> => {
    await tokenStorage.setToken(token);
  };

  const clearStoredToken = async (): Promise<void> => {
    await tokenStorage.removeToken();
  };

  const login = async () => {
    try {
      setIsLoading(true);
      
      // Create the authorization request
      const request = new AuthSession.AuthRequest({
        clientId: AUTH0_CONFIG.clientId,
        scopes: AUTH0_CONFIG.scope.split(' '),
        redirectUri: AUTH0_CONFIG.redirectUri,
        responseType: AuthSession.ResponseType.Code,
        extraParams: {
          audience: AUTH0_CONFIG.audience,
        },
        authorizationEndpoint: AUTH0_URLS.authorize,
      });

      // Start the authentication flow
      const result = await request.promptAsync({
        authorizationEndpoint: AUTH0_URLS.authorize,
      });

      if (result.type === 'success') {
        // Exchange the authorization code for tokens
        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId: AUTH0_CONFIG.clientId,
            code: result.params.code,
            redirectUri: AUTH0_CONFIG.redirectUri,
            extraParams: {
              code_verifier: request.codeVerifier,
            },
          },
          {
            tokenEndpoint: AUTH0_URLS.token,
          }
        );

        const token = tokenResponse.accessToken;
        setAccessToken(token);
        await storeToken(token);

        // Get user info
        const userInfo = await fetchUserInfo(token);
        setUser(userInfo);
      } else {
        throw new Error('Authentication was cancelled or failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Clear stored token
      await clearStoredToken();
      setAccessToken(null);
      setUser(null);

      // Open logout URL in browser
      const logoutUrl = `${AUTH0_URLS.logout}?client_id=${AUTH0_CONFIG.clientId}&returnTo=${encodeURIComponent(AUTH0_CONFIG.redirectUri)}`;
      await WebBrowser.openAuthSessionAsync(logoutUrl, AUTH0_CONFIG.redirectUri);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    return accessToken;
  };

  const updateDisplayName = (name: string) => {
    if (user) {
      setUser({ ...user, name });
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    getAccessToken,
    updateDisplayName,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
