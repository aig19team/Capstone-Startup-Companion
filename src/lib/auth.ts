import { supabase } from './supabase';

export interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
}

export interface AuthResponse {
  user?: User;
  error?: string;
}

export const auth = {
  // Sign up new user
  async signUp(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        return {
          user: {
            id: data.user.id,
            email: data.user.email!,
            created_at: data.user.created_at,
            last_sign_in_at: data.user.last_sign_in_at || new Date().toISOString()
          }
        };
      }

      return { error: 'Failed to create user' };
    } catch (err) {
      return { error: 'An unexpected error occurred during signup' };
    }
  },

  // Sign in existing user
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        return {
          user: {
            id: data.user.id,
            email: data.user.email!,
            created_at: data.user.created_at,
            last_sign_in_at: data.user.last_sign_in_at || new Date().toISOString()
          }
        };
      }

      return { error: 'Failed to sign in' };
    } catch (err) {
      return { error: 'An unexpected error occurred during login' };
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      return {
        id: user.id,
        email: user.email!,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at || new Date().toISOString()
      };
    } catch (err) {
      return null;
    }
  },

  // Sign out
  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },

  // Listen to auth changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        callback({
          id: session.user.id,
          email: session.user.email!,
          created_at: session.user.created_at,
          last_sign_in_at: session.user.last_sign_in_at || new Date().toISOString()
        });
      } else {
        callback(null);
      }
    });
  }
};