
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PantryItem } from '@/types/family';

const PANTRY_KEY = '@flow_fam_pantry';
const WEEK_PLANNING_SERVINGS_KEY = '@flow_fam_week_planning_servings';

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
