
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PantryItem, FamilyMember } from '@/types/family';

const PANTRY_KEY = '@flow_fam_pantry';
const WEEK_PLANNING_SERVINGS_KEY = '@flow_fam_week_planning_servings';
const CURRENT_USER_ID_KEY = '@flow_fam_current_user_id';
const FAMILY_MEMBERS_KEY = '@flow_fam_family_members';
const FAMILY_CODE_KEY = '@flow_fam_family_code';

export async function savePantryItems(items: PantryItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(PANTRY_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving pantry items:', error);
  }
}

export async function loadPantryItems(): Promise<PantryItem[]> {
  try {
    const data = await AsyncStorage.getItem(PANTRY_KEY);
    if (data) {
      const items = JSON.parse(data);
      // Convert date strings back to Date objects
      return items.map((item: any) => ({
        ...item,
        addedAt: new Date(item.addedAt),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading pantry items:', error);
    return [];
  }
}

export async function saveWeekPlanningServings(servings: number): Promise<void> {
  try {
    await AsyncStorage.setItem(WEEK_PLANNING_SERVINGS_KEY, servings.toString());
  } catch (error) {
    console.error('Error saving week planning servings:', error);
  }
}

export async function loadWeekPlanningServings(): Promise<number> {
  try {
    const data = await AsyncStorage.getItem(WEEK_PLANNING_SERVINGS_KEY);
    return data ? parseInt(data, 10) : 2;
  } catch (error) {
    console.error('Error loading week planning servings:', error);
    return 2;
  }
}

export async function saveCurrentUserId(userId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(CURRENT_USER_ID_KEY, userId);
  } catch (error) {
    console.error('Error saving current user ID:', error);
  }
}

export async function loadCurrentUserId(): Promise<string | null> {
  try {
    const data = await AsyncStorage.getItem(CURRENT_USER_ID_KEY);
    return data;
  } catch (error) {
    console.error('Error loading current user ID:', error);
    return null;
  }
}

export async function saveFamilyMembers(members: FamilyMember[]): Promise<void> {
  try {
    await AsyncStorage.setItem(FAMILY_MEMBERS_KEY, JSON.stringify(members));
  } catch (error) {
    console.error('Error saving family members:', error);
  }
}

export async function loadFamilyMembers(): Promise<FamilyMember[]> {
  try {
    const data = await AsyncStorage.getItem(FAMILY_MEMBERS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading family members:', error);
    return [];
  }
}

export async function saveFamilyCode(code: string): Promise<void> {
  try {
    await AsyncStorage.setItem(FAMILY_CODE_KEY, code);
  } catch (error) {
    console.error('Error saving family code:', error);
  }
}

export async function loadFamilyCode(): Promise<string | null> {
  try {
    const data = await AsyncStorage.getItem(FAMILY_CODE_KEY);
    return data;
  } catch (error) {
    console.error('Error loading family code:', error);
    return null;
  }
}
