
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { ShoppingItem, PantryItem, IngredientCategory } from '@/types/family';
import { CATEGORY_ORDER, CATEGORY_LABELS } from './ingredientCategories';

interface GroupedItems {
  [category: string]: (ShoppingItem | PantryItem)[];
}

export async function generateShoppingListPDF(items: ShoppingItem[]): Promise<void> {
  try {
    // Group items by category
    const grouped: GroupedItems = {};
    
    items.forEach(item => {
      const category = item.category || 'overig';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    
    // Generate HTML
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body {
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
              padding: 40px;
              color: #333;
            }
            h1 {
              color: #D5A093;
              font-size: 32px;
              margin-bottom: 10px;
              text-align: center;
            }
            .date {
              text-align: center;
              color: #666;
              font-size: 14px;
              margin-bottom: 30px;
            }
            .category {
              margin-bottom: 25px;
            }
            .category-title {
              color: #D5A093;
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 10px;
              border-bottom: 2px solid #F5D9CF;
              padding-bottom: 5px;
            }
            .item {
              padding: 8px 0;
              font-size: 16px;
              display: flex;
              align-items: center;
            }
            .checkbox {
              width: 16px;
              height: 16px;
              border: 2px solid #D5A093;
              border-radius: 4px;
              margin-right: 10px;
              display: inline-block;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #999;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <h1>🛒 Flow Fam Boodschappenlijst</h1>
          <div class="date">${new Date().toLocaleDateString('nl-NL', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</div>
          
          ${CATEGORY_ORDER.map(category => {
            const categoryItems = grouped[category];
            if (!categoryItems || categoryItems.length === 0) return '';
            
            return `
              <div class="category">
                <div class="category-title">${CATEGORY_LABELS[category]}</div>
                ${categoryItems.map(item => `
                  <div class="item">
                    <span class="checkbox"></span>
                    ${item.quantity && item.unit ? `${item.quantity} ${item.unit}` : ''} ${item.name}
                  </div>
                `).join('')}
              </div>
            `;
          }).join('')}
          
          <div class="footer">
            Gegenereerd met Flow Fam
          </div>
        </body>
      </html>
    `;
    
    // Generate PDF
    const { uri } = await Print.printToFileAsync({ html });
    console.log('PDF generated:', uri);
    
    // Share PDF
    await shareAsync(uri, { 
      UTI: '.pdf', 
      mimeType: 'application/pdf',
      dialogTitle: 'Deel boodschappenlijst'
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

export function generateShoppingListText(items: ShoppingItem[]): string {
  // Group items by category
  const grouped: GroupedItems = {};
  
  items.forEach(item => {
    const category = item.category || 'overig';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(item);
  });
  
  // Generate text
  let text = 'Boodschappenlijst – Flow Fam\n\n';
  
  CATEGORY_ORDER.forEach(category => {
    const categoryItems = grouped[category];
    if (categoryItems && categoryItems.length > 0) {
      text += `${CATEGORY_LABELS[category]}:\n`;
      categoryItems.forEach(item => {
        const quantityText = item.quantity && item.unit ? `${item.quantity} ${item.unit} ` : '';
        text += `- ${quantityText}${item.name}\n`;
      });
      text += '\n';
    }
  });
  
  return text;
}
