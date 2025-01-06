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
import { OpenSans_600SemiBold, OpenSans_700Bold } from '@expo-google-fonts/open-sans';

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

  const handleSelectFood = (food: any) => {
    setSelectedFood(food);
  };

  const addFoodToMeal = (food: { food_description: string; food_name: any; }, customWeight = 100) => {
    const nutritionalInfo = parseNutritionalInfo(food.food_description);
    
    setMeals((prevMeals) => {
      const updatedMeals = prevMeals.map((meal) => {
        if (meal.id === Number(mealId)) {
          // Calculate new foodId
          const maxFoodId = meal.foods.length > 0 ? Math.max(...meal.foods.map((f) => f.foodId)) : 0;
          const newFoodId = maxFoodId + 1;

          // Add the new food to the foods array
          const updatedFoods = [
            ...meal.foods,
            {
              foodName: food.food_name,
              weight: customWeight,
              foodId: newFoodId,
              calories: nutritionalInfo.calories,
              carbs: nutritionalInfo.carbs,
              fat: nutritionalInfo.fat,
              protein: nutritionalInfo.protein,
            },
          ];

          // Recalculate meal totals
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

          // Return the updated meal
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
      
      return updatedMeals;
    });

    setSelectedFood(null); // Close the modal
};


  

  return (
    <View style={{ padding: 16 }}>
      {/* Search for food item */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', fontFamily: 'OpenSans_400Regular' }}>Search for a food</Text>
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
          fontFamily: 'OpenSans_400Regular'
        }}
      />
      <View style={styles.modalButtons}>
        <TouchableOpacity onPress={handleSearch} disabled={loading}>
          <Text style={styles.searchText}>Search</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      <View style={{ paddingBottom: 250 }}>
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
      </View>

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