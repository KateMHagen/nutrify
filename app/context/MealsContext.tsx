import React, { createContext, useState, useContext } from 'react';

type Food = {
  foodName: string;
  weight: number;
  foodId: number;
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
};

type Meal = {
  id: number;
  name: string;
  carbs: string;
  fat: string;
  protein: string;
  calories: string;
  foods: Food[];
};

type MealsByDate = {
  [date: string]: Meal[];
};

type MealsContextType = {
  mealsByDate: MealsByDate;
  selectedDate: string;
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
  getMeals: () => Meal[];
  updateMeals: (updatedMeals: Meal[]) => void;
  addMeal: () => void;
};

const MealsContext = createContext<MealsContextType | undefined>(undefined);

const defaultMeals: Meal[] = [
  { id: 1, name: 'Breakfast', foods: [], calories: '0 kcal', carbs: '0g', fat: '0g', protein: '0g' },
  { id: 2, name: 'Lunch', foods: [], calories: '0 kcal', carbs: '0g', fat: '0g', protein: '0g' },
  { id: 3, name: 'Dinner', foods: [], calories: '0 kcal', carbs: '0g', fat: '0g', protein: '0g' },
];

export const MealsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mealsByDate, setMealsByDate] = useState<MealsByDate>({});
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Set default meals for everyday
  React.useEffect(() => {
    if (!mealsByDate[selectedDate]) {
      setMealsByDate((prev) => ({
        ...prev,
        [selectedDate]: [...defaultMeals],
      }));
    }
  }, [selectedDate, mealsByDate]);

  const getMeals = (): Meal[] => {
    return mealsByDate[selectedDate] || defaultMeals;
  };

  const updateMeals = (updatedMeals: Meal[]) => {
    setMealsByDate((prev) => ({
      ...prev,
      [selectedDate]: updatedMeals,
    }));
  };

  const addMeal = () => {
    updateMeals([
      ...getMeals(),
      {
        id: new Date().getTime(), // Ensure unique ID
        name: `Meal`,
        carbs: '0g',
        fat: '0g',
        protein: '0g',
        calories: '0 kcal',
        foods: [],
      },
    ]);
  };

  return (
    <MealsContext.Provider value={{ mealsByDate, selectedDate, setSelectedDate, getMeals, updateMeals, addMeal }}>
      {children}
    </MealsContext.Provider>
  );
};

export const useMeals = () => {
  const context = useContext(MealsContext);
  if (!context) throw new Error('useMeals must be used within a MealsProvider');
  return context;
};
