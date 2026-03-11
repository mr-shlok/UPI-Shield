import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../config/firebase';
import api from './api';

// Types
export interface RegisterData {
  email: string;
  password: string;
  display_name: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: any;
  session_token?: string;
  session_id?: string;
  error?: string;
}

class AuthService {
  // Register with email and password
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      // Register with backend
      const response = await api.post('/auth/register', data);
      
      // Note: We don't automatically sign in after registration because
      // the user needs to verify their email first
      // The user will be redirected to login page after registration
      
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle network errors specifically
      if (!error.response) {
        return {
          success: false,
          error: 'Network error: Unable to connect to the server. Please check your internet connection and ensure the backend server is running.',
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Registration failed',
      };
    }
  }

  // Login with email and password
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      // First, try to sign in with Firebase Client SDK
      const { signInWithEmailAndPassword, getAuth } = await import('firebase/auth');
      const auth = getAuth();
      
      try {
        // Attempt Firebase authentication
        const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
        
        // Get ID token
        const idToken = await userCredential.user.getIdToken();
        
        // Verify token with backend
        const response = await api.post('/auth/verify-token', {
          id_token: idToken
        });
        
        if (response.data.success) {
          // Store session data
          localStorage.setItem('session_token', response.data.session_token);
          localStorage.setItem('session_id', response.data.session_id);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          return {
            success: true,
            user: response.data.user,
            session_token: response.data.session_token,
            session_id: response.data.session_id
          };
        } else {
          return {
            success: false,
            error: response.data.error || 'Authentication failed'
          };
        }
      } catch (firebaseError: any) {
        // Handle Firebase authentication errors
        console.error('Firebase login error:', firebaseError);
        
        // Return appropriate error message
        let errorMessage = 'Login failed';
        
        if (firebaseError.code === 'auth/user-not-found') {
          errorMessage = 'No account found with this email';
        } else if (firebaseError.code === 'auth/wrong-password') {
          errorMessage = 'Incorrect password';
        } else if (firebaseError.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email address';
        } else if (firebaseError.code === 'auth/user-disabled') {
          errorMessage = 'Account has been disabled';
        } else {
          errorMessage = firebaseError.message || 'Login failed';
        }
        
        return {
          success: false,
          error: errorMessage
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle network errors specifically
      if (!error.response) {
        return {
          success: false,
          error: 'Network error: Unable to connect to the server. Please check your internet connection and ensure the backend server is running.',
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Login failed',
      };
    }
  }

  // Login with Google
  async loginWithGoogle(): Promise<AuthResponse> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Get ID token
      const idToken = await userCredential.user.getIdToken();
      
      // Authenticate with backend
      const response = await api.post('/auth/social-login', {
        id_token: idToken,
        provider: 'google',
        display_name: userCredential.user.displayName || '',
      });
      
      if (response.data.success) {
        // Store session data
        localStorage.setItem('session_token', response.data.session_token);
        localStorage.setItem('session_id', response.data.session_id);
        
        // Fetch user profile
        const userProfile = await this.getUserProfile();
        if (userProfile.success) {
          localStorage.setItem('user', JSON.stringify(userProfile.user));
        }
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Google login error:', error);
      
      // Handle network errors specifically
      if (!error.response) {
        return {
          success: false,
          error: 'Network error: Unable to connect to the server. Please check your internet connection and ensure the backend server is running.',
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Google login failed',
      };
    }
  }

  // Login with Facebook
  async loginWithFacebook(): Promise<AuthResponse> {
    try {
      const provider = new FacebookAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Get ID token
      const idToken = await userCredential.user.getIdToken();
      
      // Authenticate with backend
      const response = await api.post('/auth/social-login', {
        id_token: idToken,
        provider: 'facebook',
        display_name: userCredential.user.displayName || '',
      });
      
      if (response.data.success) {
        // Store session data
        localStorage.setItem('session_token', response.data.session_token);
        localStorage.setItem('session_id', response.data.session_id);
        
        // Fetch user profile
        const userProfile = await this.getUserProfile();
        if (userProfile.success) {
          localStorage.setItem('user', JSON.stringify(userProfile.user));
        }
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Facebook login error:', error);
      
      // Handle network errors specifically
      if (!error.response) {
        return {
          success: false,
          error: 'Network error: Unable to connect to the server. Please check your internet connection and ensure the backend server is running.',
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Facebook login failed',
      };
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      const sessionId = localStorage.getItem('session_id');
      
      // Logout from backend
      if (sessionId) {
        await api.post('/auth/logout', { session_id: sessionId });
      }
      
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear local storage
      localStorage.removeItem('session_token');
      localStorage.removeItem('session_id');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Send password reset email
  async resetPassword(email: string): Promise<AuthResponse> {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Password reset email sent. Please check your inbox.',
      };
    } catch (error: any) {
      console.error('Reset password error:', error);
      
      // Handle network errors specifically
      if (!error.response) {
        return {
          success: false,
          error: 'Network error: Unable to connect to Firebase. Please check your internet connection.',
        };
      }
      
      return {
        success: false,
        error: error.message || 'Failed to send password reset email',
      };
    }
  }

  // Get user profile from backend
  async getUserProfile(): Promise<any> {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error: any) {
      console.error('Get user profile error:', error);
      
      // Handle network errors specifically
      if (!error.response) {
        return {
          success: false,
          error: 'Network error: Unable to connect to the server.',
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch user profile',
      };
    }
  }

  // Update user profile
  async updateUserProfile(data: any): Promise<AuthResponse> {
    try {
      const response = await api.put('/auth/profile', data);
      
      if (response.data.success) {
        // Update local storage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...user, ...data }));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Update profile error:', error);
      
      // Handle network errors specifically
      if (!error.response) {
        return {
          success: false,
          error: 'Network error: Unable to connect to the server.',
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update profile',
      };
    }
  }

  // Get current user from Firebase
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('session_token');
  }

  // Get stored user data
  getStoredUser(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export default new AuthService();
