
import { supabase } from './supabase';

export interface Family {
  id: string;
  family_code: string;
  created_at: string;
  updated_at: string;
}

export interface FamilyMemberDB {
  id: string;
  family_id: string;
  user_id: string;
  name: string;
  role: 'parent' | 'child';
  color?: string;
  photo_uri?: string;
  coins: number;
  created_at: string;
  updated_at: string;
}

// Create a new family with a unique code
export async function createFamily(): Promise<{ success: boolean; family?: Family; error?: string }> {
  try {
    // Generate family code using the database function
    const { data: codeData, error: codeError } = await supabase.rpc('generate_family_code');
    
    if (codeError) {
      console.error('Error generating family code:', codeError);
      return { success: false, error: 'Kon geen gezinscode genereren' };
    }

    const familyCode = codeData as string;

    // Create the family
    const { data, error } = await supabase
      .from('families')
      .insert([{ family_code: familyCode }])
      .select()
      .single();

    if (error) {
      console.error('Error creating family:', error);
      return { success: false, error: 'Kon geen gezin aanmaken' };
    }

    return { success: true, family: data };
  } catch (error: any) {
    console.error('Create family error:', error);
    return { success: false, error: error.message || 'Er ging iets mis bij het aanmaken van het gezin' };
  }
}

// Join an existing family using a family code
export async function joinFamily(familyCode: string): Promise<{ success: boolean; family?: Family; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('families')
      .select('*')
      .eq('family_code', familyCode.toUpperCase())
      .single();

    if (error || !data) {
      console.error('Error finding family:', error);
      return { success: false, error: 'Oeps, deze code klopt niet.' };
    }

    return { success: true, family: data };
  } catch (error: any) {
    console.error('Join family error:', error);
    return { success: false, error: 'Oeps, deze code klopt niet.' };
  }
}

// Add a family member
export async function addFamilyMember(
  familyId: string,
  userId: string,
  name: string,
  role: 'parent' | 'child',
  color?: string,
  photoUri?: string
): Promise<{ success: boolean; member?: FamilyMemberDB; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('family_members')
      .insert([{
        family_id: familyId,
        user_id: userId,
        name,
        role,
        color,
        photo_uri: photoUri,
        coins: 0,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding family member:', error);
      return { success: false, error: 'Kon gezinslid niet toevoegen' };
    }

    return { success: true, member: data };
  } catch (error: any) {
    console.error('Add family member error:', error);
    return { success: false, error: error.message || 'Er ging iets mis bij het toevoegen van het gezinslid' };
  }
}

// Get family members for a user
export async function getFamilyMembers(userId: string): Promise<{ success: boolean; members?: FamilyMemberDB[]; error?: string }> {
  try {
    // First get the user's family_id
    const { data: userMember, error: userError } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', userId)
      .single();

    if (userError || !userMember) {
      console.error('Error getting user family:', userError);
      return { success: false, error: 'Kon gezin niet vinden' };
    }

    // Then get all members of that family
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('family_id', userMember.family_id);

    if (error) {
      console.error('Error getting family members:', error);
      return { success: false, error: 'Kon gezinsleden niet ophalen' };
    }

    return { success: true, members: data || [] };
  } catch (error: any) {
    console.error('Get family members error:', error);
    return { success: false, error: error.message || 'Er ging iets mis bij het ophalen van gezinsleden' };
  }
}

// Get family by user ID
export async function getFamilyByUserId(userId: string): Promise<{ success: boolean; family?: Family; error?: string }> {
  try {
    // First get the user's family_id
    const { data: userMember, error: userError } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', userId)
      .single();

    if (userError || !userMember) {
      return { success: false, error: 'Geen gezin gevonden' };
    }

    // Then get the family
    const { data, error } = await supabase
      .from('families')
      .select('*')
      .eq('id', userMember.family_id)
      .single();

    if (error || !data) {
      console.error('Error getting family:', error);
      return { success: false, error: 'Kon gezin niet ophalen' };
    }

    return { success: true, family: data };
  } catch (error: any) {
    console.error('Get family error:', error);
    return { success: false, error: error.message || 'Er ging iets mis bij het ophalen van het gezin' };
  }
}

// Check if user has a family
export async function userHasFamily(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('family_members')
      .select('id')
      .eq('user_id', userId)
      .single();

    return !error && data !== null;
  } catch (error) {
    console.error('Check user family error:', error);
    return false;
  }
}
