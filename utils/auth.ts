
import { supabase } from './supabase';
import type { User, Session } from '@supabase/supabase-js';

export async function getCurrentUser(): Promise<User | null> {
  try {
    console.log('=== getCurrentUser START ===');
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
    
    console.log('✅ Current user:', user?.id);
    console.log('=== getCurrentUser END ===');
    return user;
  } catch (error) {
    console.error('=== getCurrentUser ERROR ===');
    console.error('Error:', error);
    return null;
  }
}

export async function getCurrentSession(): Promise<Session | null> {
  try {
    console.log('=== getCurrentSession START ===');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Error getting current session:', error);
      return null;
    }
    
    console.log('✅ Current session exists:', !!session);
    console.log('=== getCurrentSession END ===');
    return session;
  } catch (error) {
    console.error('=== getCurrentSession ERROR ===');
    console.error('Error:', error);
    return null;
  }
}

export async function signOut(): Promise<void> {
  try {
    console.log('=== signOut START ===');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ Error signing out:', error);
      throw error;
    }
    
    console.log('✅ Signed out successfully');
    console.log('=== signOut END ===');
  } catch (error) {
    console.error('=== signOut ERROR ===');
    console.error('Error:', error);
    throw error;
  }
}
