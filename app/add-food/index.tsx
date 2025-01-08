import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  StyleSheet,
} from 'react-native';
import { useMeals } from '../context/MealsContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import searchFoods from '@/lib/fatsecret';

// Helper functions for nutrition parsing and adjustment
export const parseNutritionalInfo = (foodDescription: string) => {
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

export const adjustNutritionForWeight = (nutrition: any, weight: number) => {
  const scaleFactor = weight / 100; // Assuming default serving is 100g
  return {
    calories: Math.round(nutrition.calories * scaleFactor),
    fat: (nutrition.fat * scaleFactor).toFixed(2),
    carbs: (nutrition.carbs * scaleFactor).toFixed(2),
    protein: (nutrition.protein * scaleFactor).toFixed(2),
  };
};

export default function AddFoodScreen() {
  const [query, setQuery] = useState<string>('');
  const [foods, setFoods] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedFood, setSelectedFood] = useState<any>(null); // For the modal
  const [customWeight, setCustomWeight] = useState<number>(100); // Default weight in grams
  const { getMeals, updateMeals } = useMeals();
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

  const handleSelectFood = (food: any) => {
    setSelectedFood(food);
  };

  const addFoodToMeal = (
    food: { food_description: string; food_name: string },
    customWeight = 100
  ) => {
    const nutritionalInfo = parseNutritionalInfo(food.food_description);
  
    // Adjust nutritional values based on the custom weight
    const adjustedNutrition = adjustNutritionForWeight(nutritionalInfo, customWeight);
  
    // Get the current meals for the selected date
    const meals = getMeals();
  
    const updatedMeals = meals.map((meal) => {
      if (meal.id === Number(mealId)) {
        const maxFoodId = meal.foods.length > 0 ? Math.max(...meal.foods.map((f) => f.foodId)) : 0;
        const newFoodId = maxFoodId + 1;
  
        // Add the new food with adjusted nutrition
        const updatedFoods = [
          ...meal.foods,
          {
            foodName: food.food_name,
            weight: customWeight,
            foodId: newFoodId,
            calories: adjustedNutrition.calories,
            carbs: Number(adjustedNutrition.carbs), // Ensure it's a number
            fat: Number(adjustedNutrition.fat), // Ensure it's a number
            protein: Number(adjustedNutrition.protein), // Ensure it's a number
          },
        ];
  
        // Recalculate the meal's total nutrition values
        const updatedTotals = updatedFoods.reduce(
          (acc, food) => {
            acc.calories += food.calories;
            acc.carbs += food.carbs;
            acc.fat += food.fat;
            acc.protein += food.protein;
            return acc;
          },
          { calories: 0, carbs: 0, fat: 0, protein: 0 }
        );
  
        return {
          ...meal,
          foods: updatedFoods,
          calories: `${Math.round(updatedTotals.calories)} kcal`,
          carbs: `${Math.round(updatedTotals.carbs)}g`,
          fat: `${Math.round(updatedTotals.fat)}g`,
          protein: `${Math.round(updatedTotals.protein)}g`,
        };
      }
      return meal;
    });
  
    // Update the meals for the current date
    updateMeals(updatedMeals);
  
    // Close the modal
    setSelectedFood(null);
  };
  
  
  

  return (
    <View style={{ padding: 16 }}>
      {/* Search for food item */}
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
      <TouchableOpacity style={styles.modalButtons} onPress={handleSearch} disabled={loading}>
        <Text style={styles.searchText}>Search</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      <FlatList
        data={foods}
        keyExtractor={(item) => item.food_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.foodItemContainer}>
            <TouchableOpacity onPress={() => handleSelectFood(item)}>
              <Text style={styles.foodItem}>{item.food_name}</Text>
              <Text style={styles.smallText}>{item.food_description}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => addFoodToMeal(item)}>
              <Text style={{ color: 'green', fontSize: 18 }}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      />

       {/* Modal for custom gram entry */}
       <Modal visible={!!selectedFood} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalInfo}>
            {selectedFood && (
              <>
                <Text style={styles.mediumText}>
                  {selectedFood.food_name}
                </Text>
                <Text style={styles.modalText}>
                  Calories: {adjustNutritionForWeight(parseNutritionalInfo(selectedFood.food_description), customWeight).calories} kcal{`\n`}
                  Carbs: {adjustNutritionForWeight(parseNutritionalInfo(selectedFood.food_description), customWeight).carbs} g{`\n`}
                  Fat: {adjustNutritionForWeight(parseNutritionalInfo(selectedFood.food_description), customWeight).fat} g{`\n`}
                  Protein: {adjustNutritionForWeight(parseNutritionalInfo(selectedFood.food_description), customWeight).protein} g{`\n`}
                </Text>
                <TextInput
                  keyboardType="numeric"
                  value={String(customWeight)}
                  onChangeText={(value) => setCustomWeight(Number(value))}
                  placeholder="Enter weight in grams"
                  style={styles.modalTextInput}
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity onPress={() => addFoodToMeal(selectedFood, customWeight)}>
                    <Text style={styles.buttonText}>Add to Meal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setSelectedFood(null)}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  foodItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#D6CECE',
    marginBottom: 5,
    borderRadius: 5
  },
  foodItem: {
    marginBottom: 5,
    fontFamily: 'OpenSans_400Regular',
  },
  smallText: {
    fontSize: 10,
    fontFamily: 'OpenSans_400Regular'
  },
  mediumText: {
    fontSize: 18,
    fontFamily: 'OpenSans_700Bold',
    marginBottom: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    padding: 20,
  },
  modalInfo: {
    backgroundColor: '#D6CECE',
    padding: 16,
    borderRadius: 5,
  },
  modalTextInput: {
    height: 40,
    borderColor: 'black',
    borderWidth: 1,
    paddingLeft: 10,
    borderRadius: 5,
  },
  modalText: {
    fontSize: 13,
    fontFamily: 'OpenSans_400Regular'
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'OpenSans_400Regular',
    margin: 3
  },
  modalButtons: {
    marginTop: 10,
    flexDirection: 'column',
    alignItems: 'center'
  },
  searchText: {
    fontSize: 16,
    fontFamily: 'OpenSans_400Regular', 
    marginBottom: 10
  },
})