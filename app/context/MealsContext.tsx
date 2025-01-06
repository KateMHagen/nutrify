import React, { createContext, useState, useContext } from 'react';

// Define the type for a food item
type Food = {
  foodName: string;
  weight: number;
  foodId: number;
  calories: number; // Nutritional data for each food item
  carbs: number;    // Nutritional data for each food item
  fat: number;      // Nutritional data for each food item
  protein: number;  // Nutritional data for each food item
};

// Define the type for a meal
type Meal = {
  id: number;
  name: string;
  carbs: string;
  fat: string;
  protein: string;
  calories: string;
  foods: Food[]; // Array of food items
};

// Define the context type
type MealsContextType = {
  meals: Meal[];
  setMeals: React.Dispatch<React.SetStateAction<Meal[]>>;
};

// Create the context
const MealsContext = createContext<MealsContextType | undefined>(undefined);

// Default meals
const defaultMeals: Meal[] = [
  { id: 1, name: 'Breakfast', foods: [], calories: '0 kcal', carbs: '0g', fat: '0g', protein: '0g' },
  { id: 2, name: 'Lunch', foods: [], calories: '0 kcal', carbs: '0g', fat: '0g', protein: '0g' },
  { id: 3, name: 'Dinner', foods: [], calories: '0 kcal', carbs: '0g', fat: '0g', protein: '0g' },
];

// Create the provider component
export const MealsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [meals, setMeals] = useState<Meal[]>(defaultMeals);

  return (
    <MealsContext.Provider value={{ meals, setMeals }}>
      {children}
    </MealsContext.Provider>
  );
};

// Custom hook to use the context
export const useMeals = () => {
  const context = useContext(MealsContext);
  if (!context) throw new Error('useMeals must be used within a MealsProvider');
  return context;
};
