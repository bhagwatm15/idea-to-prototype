import React, { useState } from 'react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('inventory');
  const [inventory, setInventory] = useState([
    { id: 1, name: 'Chicken Breast', daysLeft: 3 },
    { id: 2, name: 'Broccoli', daysLeft: 5 },
    { id: 3, name: 'Rice', daysLeft: 30 },
  ]);
  const [mealPlan, setMealPlan] = useState([
    { day: 'Monday', meal: 'Grilled Chicken & Broccoli', status: 'pending' },
    { day: 'Tuesday', meal: 'Pasta Carbonara', status: 'pending' },
    { day: 'Wednesday', meal: 'Stir-Fried Rice', status: 'pending' },
    { day: 'Thursday', meal: 'Grilled Salmon', status: 'pending' },
    { day: 'Friday', meal: 'Tacos', status: 'pending' },
  ]);
  const [shoppingList, setShoppingList] = useState([
    { item: 'Eggs', quantity: '12', reason: 'Pasta Carbonara' },
    { item: 'Salmon Fillet', quantity: '1.5 lbs', reason: 'Grilled Salmon' },
    { item: 'Ground Beef', quantity: '2 lbs', reason: 'Tacos' },
  ]);
  const [preferences, setPreferences] = useState({
    dietaryRestrictions: 'None',
    householdSize: 2,
    cookingTime: 'Medium (30-45 min)',
  });
  const [newItem, setNewItem] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const colors = {
    primary: '#2ecc71',
    secondary: '#27ae60',
    background: '#f8fef6',
    text: '#2c3e50',
    lightText: '#7f8c8d',
    border: '#e0e8e3',
    white: '#ffffff',
  };

  const sharedStyles = {
    container: {
      minHeight: '100vh',
      backgroundColor: colors.background,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: colors.text,
    },
    header: {
      backgroundColor: colors.primary,
      padding: '20px',
      color: colors.white,
      textAlign: 'center',
      fontSize: '28px',
      fontWeight: 'bold',
    },
    navBar: {
      display: 'flex',
      backgroundColor: colors.white,
      borderTop: `2px solid ${colors.border}`,
      borderBottom: `2px solid ${colors.border}`,
    },
    navButton: (isActive) => ({
      flex: 1,
      padding: '12px',
      border: 'none',
      backgroundColor: isActive ? colors.primary : colors.white,
      color: isActive ? colors.white : colors.text,
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '600',
      borderBottom: isActive ? `3px solid ${colors.secondary}` : 'none',
    }),
    mainContent: {
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      marginBottom: '15px',
      color: colors.text,
    },
    card: {
      backgroundColor: colors.white,
      border: `1px solid ${colors.border}`,
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '10px',
    },
    button: {
      backgroundColor: colors.primary,
      color: colors.white,
      border: 'none',
      padding: '10px 15px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '600',
    },
    input: {
      padding: '10px',
      borderRadius: '6px',
      border: `1px solid ${colors.border}`,
      fontSize: '13px',
      width: '100%',
      boxSizing: 'border-box',
      marginBottom: '10px',
    },
  };

  const recipes = {
    'Grilled Chicken & Broccoli': {
      ingredients: ['Chicken Breast', 'Broccoli', 'Olive Oil', 'Salt', 'Pepper'],
      steps: ['Preheat grill to 400°F', 'Season chicken with salt and pepper', 'Grill 6-7 minutes per side', 'Steam broccoli 5 minutes', 'Serve together'],
      substitutions: ['Chicken → Turkey breast', 'Broccoli → Asparagus'],
    },
    'Pasta Carbonara': {
      ingredients: ['Pasta', 'Eggs', 'Bacon', 'Parmesan', 'Black Pepper'],
      steps: ['Cook pasta al dente', 'Fry bacon until crispy', 'Mix eggs with grated Parmesan', 'Combine pasta with bacon and egg mixture', 'Season with black pepper'],
      substitutions: ['Bacon → Pancetta', 'Parmesan → Pecorino Romano'],
    },
  };

  return (
    <div style={sharedStyles.container}>
      <div style={sharedStyles.header}>🥗 FridgeWeek</div>

      {currentScreen === 'inventory' && (
        <div style={sharedStyles.mainContent}>
          <h2 style={sharedStyles.sectionTitle}>Your Fridge & Pantry</h2>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              style={sharedStyles.input}
              placeholder="Add item (e.g., Milk, Eggs, Spinach)"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
            />
            <button
              style={sharedStyles.button}
              onClick={() => {
                if (newItem.trim()) {
                  setInventory([...inventory, { id: Math.random(), name: newItem, daysLeft: 7 }]);
                  setNewItem('');
                }
              }}
            >
              + Add Item
            </button>
          </div>
          {inventory.map((item) => (
            <div key={item.id} style={sharedStyles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: colors.lightText }}>Good for {item.daysLeft} days</div>
                </div>
                <button
                  style={{ ...sharedStyles.button, backgroundColor: '#e74c3c', padding: '6px 10px', fontSize: '12px' }}
                  onClick={() => setInventory(inventory.filter((i) => i.id !== item.id))}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {currentScreen === 'plan' && (
        <div style={sharedStyles.mainContent}>
          <h2 style={sharedStyles.sectionTitle}>7-Day Meal Plan</h2>
          {mealPlan.map((day, idx) => (
            <div key={idx} style={sharedStyles.card}>
              <div style={{ fontWeight: '600', marginBottom: '5px' }}>{day.day}</div>
              <div style={{ marginBottom: '10px' }}>{day.meal}</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  style={{
                    ...sharedStyles.button,
                    flex: 1,
                    backgroundColor: day.status === 'cooked' ? colors.secondary : colors.primary,
                  }}
                  onClick={() => {
                    const newPlan = [...mealPlan];
                    newPlan[idx].status = newPlan[idx].status === 'cooked' ? 'pending' : 'cooked';
                    setMealPlan(newPlan);
                  }}
                >
                  {day.status === 'cooked' ? '✓ Cooked' : 'Mark Cooked'}
                </button>
                <button
                  style={{ ...sharedStyles.button, flex: 1 }}
                  onClick={() => setSelectedRecipe(day.meal)}
                >
                  View Recipe
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {currentScreen === 'recipe' && selectedRecipe && (
        <div style={sharedStyles.mainContent}>
          <button style={{ ...sharedStyles.button, marginBottom: '15px' }} onClick={() => setSelectedRecipe(null)}>
            ← Back to Plan
          </button>
          <h2 style={sharedStyles.sectionTitle}>{selectedRecipe}</h2>
          {recipes[selectedRecipe] && (
            <div>
              <div style={sharedStyles.card}>
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>Ingredients:</div>
                {recipes[selectedRecipe].ingredients.map((ing, i) => (
                  <div key={i} style={{ fontSize: '13px', marginBottom: '4px' }}>
                    • {ing}
                  </div>
                ))}
              </div>
              <div style={sharedStyles.card}>
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>Steps:</div>
                {recipes[selectedRecipe].steps.map((step, i) => (
                  <div key={i} style={{ fontSize: '13px', marginBottom: '4px' }}>
                    {i + 1}. {step}
                  </div>
                ))}
              </div>
              <div style={sharedStyles.card}>
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>Substitutions:</div>
                {recipes[selectedRecipe].substitutions.map((sub, i) => (
                  <div key={i} style={{ fontSize: '13px', marginBottom: '4px' }}>
                    • {sub}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {currentScreen === 'shopping' && (
        <div style={sharedStyles.mainContent}>
          <h2 style={sharedStyles.sectionTitle}>Shopping List</h2>
          <button style={{ ...sharedStyles.button, marginBottom: '15px', width: '100%' }}>📋 Copy to Clipboard</button>
          {shoppingList.map((item, i) => (
            <div key={i} style={sharedStyles.card}>
              <div style={{ fontWeight: '600' }}>{item.item}</div>
              <div style={{ fontSize: '12px', color: colors.lightText }}>
                Quantity: {item.quantity} • For: {item.reason}
              </div>
              <input type="checkbox" style={{ marginTop: '8px' }} />
              <label style={{ fontSize: '12px', marginLeft: '5px' }}>Purchased</label>
            </div>
          ))}
        </div>
      )}

      {currentScreen === 'settings' && (
        <div style={sharedStyles.mainContent}>
          <h2 style={sharedStyles.sectionTitle}>Settings & Preferences</h2>
          <div style={sharedStyles.card}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Dietary Restrictions:</label>
            <select
              style={sharedStyles.input}
              value={preferences.dietaryRestrictions}
              onChange={(e) => setPreferences({ ...preferences, dietaryRestrictions: e.target.value })}
            >
              <option>None</option>
              <option>Vegetarian</option>
              <option>Vegan</option>
              <option>Gluten-Free</option>
              <option>Dairy-Free</option>
            </select>
          </div>
          <div style={sharedStyles.card}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Household Size:</label>
            <input
              type="number"
              style={sharedStyles.input}
              value={preferences.householdSize}
              onChange={(e) => setPreferences({ ...preferences, householdSize: parseInt(e.target.value) })}
              min="1"
              max="10"
            />
          </div>
          <div style={sharedStyles.card}>
            <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>Cooking Time:</label>
            <select
              style={sharedStyles.input}
              value={preferences.cookingTime}
              onChange={(e) => setPreferences({ ...preferences, cookingTime: e.target.value })}
            >
              <option>Quick (under 20 min)</option>
              <option>Medium (30-45 min)</option>
              <option>Detailed (1+ hours)</option>
            </select>
          </div>
          <button style={{ ...sharedStyles.button, width: '100%', marginTop: '15px' }}>Save Preferences</button>
        </div>
      )}

      <div style={sharedStyles.navBar}>
        {['inventory', 'plan', 'shopping', 'settings'].map((screen, i) => (
          <button
            key={screen}
            style={sharedStyles.navButton(currentScreen === screen)}
            onClick={() => {
              setSelectedRecipe(null);
              setCurrentScreen(screen);
            }}
          >
            {screen === 'inventory' && '🥦 Inventory'}
            {screen === 'plan' && '📅 Meal Plan'}
            {screen === 'shopping' && '🛒 Shopping'}
            {screen === 'settings' && '⚙️ Settings'}
          </button>
        ))}
      </div>
    </div>
  );
}
