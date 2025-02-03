// Fetch and update meals from Supabase

import React, { createContext, useState, useContext, useEffect } from 'react';
import supabase from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

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
  carbs: number;
  fat: number;
  protein: number;
  calories: number;
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
  { id: 1, name: 'Breakfast', foods: [], calories: 0, carbs: 0, fat: 0, protein: 0 },
  { id: 2, name: 'Lunch', foods: [], calories: 0, carbs: 0, fat:0, protein: 0 },
  { id: 3, name: 'Dinner', foods: [], calories: 0, carbs: 0, fat: 0, protein: 0 },
];

export const MealsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mealsByDate, setMealsByDate] = useState<MealsByDate>({});
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user id and meals when selectedDate changes
  useEffect(() => {
    const fetchUser = async () => {
      const {data, error} = await supabase.auth.getUser();
      if(error || !data?.user?.id) {
        console.log('Error fetching user: ', error?.message);
        return;
      }
      setUserId(data.user.id);
      await fetchMealsFromDB(data.user.id, selectedDate)
    };
    fetchUser();
  }, [selectedDate]);


  const fetchMealsFromDB = async (userId: string, date: string) => {
    const {data, error} = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date);

    if(error) {
      console.error('Error fetching meals: ', error.message);
      return;
    }

    const meals = data.map((meal: any) => ({
      id: meal.id,
      name: meal.name,
      calories: meal.calories,
      carbs: meal.carbs,
      fat: meal.fat,
      protein: meal.protein,
      foods: meal.foods ? JSON.parse(meal.foods) : [],
    }));

    setMealsByDate((prev) => ({
      ...prev,
      [date]: meals.length > 0 ? meals : [...defaultMeals], // Default if no meals exist for the date
    }));

  };

  

  const saveMealsToDB = async (meals: Meal[]) => {
    if (!userId) return;

    for (const meal of meals) {
        const { error } = await supabase
            .from('meals')
            .upsert({
                id: meal.id,
                user_id: userId,
                date: selectedDate,
                name: meal.name,
                calories: Number(meal.calories),  // Ensure integer
                carbs: Number(meal.carbs),  // Ensure float
                fat: Number(meal.fat),  // Ensure float
                protein:Number(meal.protein),  // Ensure float
                foods: JSON.stringify(meal.foods),
            });

        if (error) {
            console.error(`Error saving meal ${meal.id}:`, error.message);
        }
    }
};


  const getMeals = (): Meal[] => {
    return mealsByDate[selectedDate] || defaultMeals;
  };

  const updateMeals = (updatedMeals: Meal[]) => {
    setMealsByDate((prev) => ({
      ...prev,
      [selectedDate]: updatedMeals,
    }));

    saveMealsToDB(updatedMeals);
  };

  const addMeal = () => {
    const newMeal: Meal = {
      id: new Date().getTime(),
      name: `Meal`,
      carbs: 0,
      fat: 0,
      protein: 0,
      calories: 0,
      foods: [],
    };

    const updatedMeals = [...getMeals(), newMeal];
    updateMeals(updatedMeals);
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
