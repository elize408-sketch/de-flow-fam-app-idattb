
import { IngredientCategory } from '@/types/family';

export const CATEGORY_ORDER: IngredientCategory[] = [
  'groente',
  'fruit',
  'zuivel',
  'vlees_vis',
  'droge_voorraad',
  'koelkast',
  'diepvries',
  'overig',
];

export const CATEGORY_LABELS: Record<IngredientCategory, string> = {
  groente: 'Groente',
  fruit: 'Fruit',
  zuivel: 'Zuivel',
  vlees_vis: 'Vlees & Vis',
  droge_voorraad: 'Droge voorraad',
  koelkast: 'Koelkast',
  diepvries: 'Diepvries',
  overig: 'Overig',
};

// Simple categorization based on common ingredient names
export function categorizeIngredient(ingredientName: string): IngredientCategory {
  const name = ingredientName.toLowerCase();
  
  // Groente
  if (name.includes('tomaat') || name.includes('ui') || name.includes('knoflook') ||
      name.includes('paprika') || name.includes('wortel') || name.includes('sla') ||
      name.includes('komkommer') || name.includes('courgette') || name.includes('aubergine') ||
      name.includes('broccoli') || name.includes('bloemkool') || name.includes('spinazie') ||
      name.includes('prei') || name.includes('champignon') || name.includes('paddenstoel')) {
    return 'groente';
  }
  
  // Fruit
  if (name.includes('appel') || name.includes('peer') || name.includes('banaan') ||
      name.includes('sinaasappel') || name.includes('citroen') || name.includes('limoen') ||
      name.includes('aardbei') || name.includes('druif') || name.includes('meloen') ||
      name.includes('ananas') || name.includes('mango') || name.includes('kiwi')) {
    return 'fruit';
  }
  
  // Zuivel
  if (name.includes('melk') || name.includes('kaas') || name.includes('yoghurt') ||
      name.includes('boter') || name.includes('room') || name.includes('kwark') ||
      name.includes('ei') || name.includes('eieren')) {
    return 'zuivel';
  }
  
  // Vlees & Vis
  if (name.includes('kip') || name.includes('vlees') || name.includes('gehakt') ||
      name.includes('vis') || name.includes('zalm') || name.includes('tonijn') ||
      name.includes('kabeljauw') || name.includes('varken') || name.includes('rund') ||
      name.includes('spek') || name.includes('worst') || name.includes('ham')) {
    return 'vlees_vis';
  }
  
  // Droge voorraad
  if (name.includes('pasta') || name.includes('rijst') || name.includes('meel') ||
      name.includes('suiker') || name.includes('zout') || name.includes('peper') ||
      name.includes('kruiden') || name.includes('olie') || name.includes('azijn') ||
      name.includes('blik') || name.includes('pot') || name.includes('pak')) {
    return 'droge_voorraad';
  }
  
  // Koelkast
  if (name.includes('saus') || name.includes('mayonaise') || name.includes('ketchup') ||
      name.includes('mosterd') || name.includes('jam') || name.includes('pindakaas')) {
    return 'koelkast';
  }
  
  // Diepvries
  if (name.includes('diepvries') || name.includes('bevroren') || name.includes('ijs')) {
    return 'diepvries';
  }
  
  return 'overig';
}

// Check if ingredient should not be scaled (textual amounts)
export function shouldNotScale(ingredientText: string): boolean {
  const text = ingredientText.toLowerCase();
  return text.includes('snufje') || 
         text.includes('beetje') || 
         text.includes('scheutje') ||
         text.includes('mespunt') ||
         text.includes('naar smaak') ||
         text.includes('optioneel');
}

// Parse ingredient string to extract quantity, unit, and name
export function parseIngredient(ingredientText: string): { quantity: number; unit: string; name: string } {
  // Try to extract number at the beginning
  const match = ingredientText.match(/^(\d+(?:[.,]\d+)?)\s*([a-zA-Z]+)?\s*(.+)$/);
  
  if (match) {
    const quantity = parseFloat(match[1].replace(',', '.'));
    const unit = match[2] || 'st';
    const name = match[3].trim();
    return { quantity, unit, name };
  }
  
  // If no number found, assume 1 piece
  return { quantity: 1, unit: 'st', name: ingredientText.trim() };
}
