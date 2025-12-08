
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
    console.log('=== createFamily START ===');
    console.log('Generating family code...');
    
    // Generate family code using the database function
    const { data: codeData, error: codeError } = await supabase.rpc('generate_family_code');
    
    if (codeError) {
      console.error('❌ Error generating family code:', codeError);
      return { success: false, error: 'Kon geen gezinscode genereren' };
    }

    const familyCode = codeData as string;
    console.log('✅ Generated family code:', familyCode);

    // Create the family
    console.log('Creating family in database...');
    const { data, error } = await supabase
      .from('families')
      .insert([{ family_code: familyCode }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating family:', error);
      return { success: false, error: 'Kon geen gezin aanmaken' };
    }

    console.log('✅ Family created successfully:', data.id);
    console.log('=== createFamily END ===');
    return { success: true, family: data };
  } catch (error: any) {
    console.error('=== createFamily ERROR ===');
    console.error('Error:', error);
    return { success: false, error: error.message || 'Er ging iets mis bij het aanmaken van het gezin' };
  }
}

// Join an existing family using a family code
export async function joinFamily(familyCode: string): Promise<{ success: boolean; family?: Family; error?: string }> {
  try {
    console.log('=== joinFamily START ===');
    console.log('Family code:', familyCode);
    
    const { data, error } = await supabase
      .from('families')
      .select('*')
      .eq('family_code', familyCode.toUpperCase())
      .single();

    if (error || !data) {
      console.error('❌ Error finding family:', error);
      return { success: false, error: 'Oeps, deze code klopt niet.' };
    }

    console.log('✅ Family found:', data.id);
    console.log('=== joinFamily END ===');
    return { success: true, family: data };
  } catch (error: any) {
    console.error('=== joinFamily ERROR ===');
    console.error('Error:', error);
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
    console.log('=== addFamilyMember START ===');
    console.log('Family ID:', familyId);
    console.log('User ID:', userId);
    console.log('Name:', name);
    console.log('Role:', role);
    
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
      console.error('❌ Error adding family member:', error);
      return { success: false, error: 'Kon gezinslid niet toevoegen' };
    }

    console.log('✅ Family member added successfully:', data.id);
    console.log('=== addFamilyMember END ===');
    return { success: true, member: data };
  } catch (error: any) {
    console.error('=== addFamilyMember ERROR ===');
    console.error('Error:', error);
    return { success: false, error: error.message || 'Er ging iets mis bij het toevoegen van het gezinslid' };
  }
}

// Get family members for a user
export async function getFamilyMembers(userId: string): Promise<{ success: boolean; members?: FamilyMemberDB[]; error?: string }> {
  try {
    console.log('=== getFamilyMembers START ===');
    console.log('User ID:', userId);
    
    // First get the user's family_id
    const { data: userMember, error: userError } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', userId)
      .single();

    if (userError || !userMember) {
      console.error('❌ Error getting user family:', userError);
      return { success: false, error: 'Kon gezin niet vinden' };
    }

    console.log('User family ID:', userMember.family_id);

    // Then get all members of that family
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('family_id', userMember.family_id);

    if (error) {
      console.error('❌ Error getting family members:', error);
      return { success: false, error: 'Kon gezinsleden niet ophalen' };
    }

    console.log('✅ Found family members:', data?.length || 0);
    console.log('=== getFamilyMembers END ===');
    return { success: true, members: data || [] };
  } catch (error: any) {
    console.error('=== getFamilyMembers ERROR ===');
    console.error('Error:', error);
    return { success: false, error: error.message || 'Er ging iets mis bij het ophalen van gezinsleden' };
  }
}

// Get family by user ID
export async function getFamilyByUserId(userId: string): Promise<{ success: boolean; family?: Family; error?: string }> {
  try {
    console.log('=== getFamilyByUserId START ===');
    console.log('User ID:', userId);
    
    // First get the user's family_id
    const { data: userMember, error: userError } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', userId)
      .single();

    if (userError || !userMember) {
      console.log('❌ User is not part of any family');
      return { success: false, error: 'Geen gezin gevonden' };
    }

    console.log('User family ID:', userMember.family_id);

    // Then get the family
    const { data, error } = await supabase
      .from('families')
      .select('*')
      .eq('id', userMember.family_id)
      .single();

    if (error || !data) {
      console.error('❌ Error getting family:', error);
      return { success: false, error: 'Kon gezin niet ophalen' };
    }

    console.log('✅ Family found:', data.id);
    console.log('=== getFamilyByUserId END ===');
    return { success: true, family: data };
  } catch (error: any) {
    console.error('=== getFamilyByUserId ERROR ===');
    console.error('Error:', error);
    return { success: false, error: error.message || 'Er ging iets mis bij het ophalen van het gezin' };
  }
}

// Check if user has a family
export async function userHasFamily(userId: string): Promise<boolean> {
  try {
    console.log('=== userHasFamily START ===');
    console.log('User ID:', userId);
    console.log('Timestamp:', new Date().toISOString());
    
    console.log('[1/3] Querying family_members table...');
    const { data, error } = await supabase
      .from('family_members')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    console.log('[2/3] Query completed');
    console.log('Data:', data);
    console.log('Error:', error);

    if (error) {
      console.error('❌ Error checking user family:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.log('=== userHasFamily END (error) ===');
      return false;
    }

    const hasFamily = data !== null;
    console.log('[3/3] Result:', hasFamily ? '✅ HAS FAMILY' : '❌ NO FAMILY');
    console.log('=== userHasFamily END ===');
    return hasFamily;
  } catch (error) {
    console.error('=== userHasFamily EXCEPTION ===');
    console.error('Error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.log('=== userHasFamily END (exception) ===');
    return false;
  }
}
