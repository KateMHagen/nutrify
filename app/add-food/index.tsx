import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  StyleSheet,
} from 'react-native';
import { useMeals } from '../context/MealsContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import searchFoods from '@/lib/fatsecret';

export default function AddFoodScreen() {
  const [query, setQuery] = useState<string>('');
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFood, setSelectedFood] = useState<any>(null); // For the modal
  const [customWeight, setCustomWeight] = useState<number>(100); // Default weight in grams
  const { meals, setMeals } = useMeals();
  const navigation = useNavigation();
  const route = useRoute();

  const { mealId } = route.params as { mealId: number };

  const handleSearch = async () => {
    if (query.trim()) {
      setLoading(true);
      try {
        const result = await searchFoods(query);
        if (result?.foods?.food) {
          const foodList = Array.isArray(result.foods.food)
            ? result.foods.food
            : [result.foods.food];
          setFoods(foodList);
        } else {
          setFoods([]);
        }
      } catch (error) {
        console.error('Error searching for foods:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const parseNutritionalInfo = (foodDescription: string) => {
    const regex =
      /Calories:\s*(\d+)[^\|]*\|\s*Fat:\s*([\d.]+)g[^\|]*\|\s*Carbs:\s*([\d.]+)g[^\|]*\|\s*Protein:\s*([\d.]+)g/;
    const match = regex.exec(foodDescription);

    if (match) {
      return {
        calories: parseInt(match[1], 10) || 0,
        fat: parseFloat(match[2]) || 0,
        carbs: parseFloat(match[3]) || 0,
        protein: parseFloat(match[4]) || 0,
      };
    }

    return { calories: 0, fat: 0, carbs: 0, protein: 0 };
  };

  const adjustNutritionForWeight = (nutrition: any, weight: number) => {
    const scaleFactor = weight / 100; // Assuming default serving is 100g
    return {
      calories: Math.round(nutrition.calories * scaleFactor),
      fat: (nutrition.fat * scaleFactor).toFixed(2),
      carbs: (nutrition.carbs * scaleFactor).toFixed(2),
      protein: (nutrition.protein * scaleFactor).toFixed(2),
    };
  };

  const handleSelectFood = (food: any) => {
    setSelectedFood(food);
  };

  const addFoodToMeal = (food: any, customWeight = 100) => {
  const nutritionalInfo = parseNutritionalInfo(food.food_description);
  const adjustedNutrition = adjustNutritionForWeight(nutritionalInfo, customWeight);

  setMeals((prevMeals) => {
    const updatedMeals = prevMeals.map((meal) => {
      if (meal.id === Number(mealId)) {
        return {
          ...meal,
          foods: [...meal.foods, food.food_name],
          calories: `${Math.round(parseInt(meal.calories) + adjustedNutrition.calories)} kcal`,
          carbs: `${Math.round(parseFloat(meal.carbs) + Number(adjustedNutrition.carbs))}g`,
          fat: `${Math.round(parseFloat(meal.fat) + Number(adjustedNutrition.fat))}g`,
          protein: `${Math.round(parseFloat(meal.protein) + Number(adjustedNutrition.protein))}g`,
        };
      }
      return meal;
    });
    return updatedMeals;
  });

  if (selectedFood) setSelectedFood(null); // Close the modal if used
};


  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Search for a food</Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Enter food name"
        style={{
          height: 40,
          borderColor: '#ccc',
          borderWidth: 1,
          marginTop: 10,
          paddingLeft: 10,
          borderRadius: 5,
        }}
      />
      <Button title="Search" onPress={handleSearch} disabled={loading} />
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      <FlatList
        data={foods}
        keyExtractor={(item) => item.food_id.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 10,
            }}
          >
            <TouchableOpacity onPress={() => handleSelectFood(item)}>
              <Text style={{ padding: 10 }}>{item.food_name}</Text>
            </TouchableOpacity>
            {/* Instant Add Button */}
            <TouchableOpacity onPress={() => addFoodToMeal(item)}>
              <Text style={{ color: 'green', fontSize: 18 }}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* Modal for custom gram entry */}
      <Modal visible={!!selectedFood} animationType="slide">
        <View style={{ padding: 16 }}>
          {selectedFood && (
            <>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
                {selectedFood.food_name}
              </Text>
              <Text>{selectedFood.food_description}</Text>
              <TextInput
                keyboardType="numeric"
                value={String(customWeight)}
                onChangeText={(value) => setCustomWeight(Number(value))}
                placeholder="Enter weight in grams"
                style={{
                  height: 40,
                  borderColor: '#ccc',
                  borderWidth: 1,
                  marginTop: 10,
                  paddingLeft: 10,
                  borderRadius: 5,
                }}
              />
              <Button title="Add to Meal" onPress={() => addFoodToMeal(selectedFood, customWeight)} />
              <Button title="Cancel" onPress={() => setSelectedFood(null)} />
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}
