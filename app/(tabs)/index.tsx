import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { CustomButton } from "../components/CustomButton";
import { router } from 'expo-router';
import { useMeals } from '../context/MealsContext';


export default function Index() {
  const { meals, setMeals } = useMeals(); // Access meals and setMeals from context
  const [editingMeal, setEditingMeal] = useState<{ id: number; name: string } | null>(null);
  const [expandedMealId, setExpandedMealId] = useState<number | null>(null);
  const [selectedFood, setSelectedFood] = useState<{ mealId: number; foodName: string, foodId: number, weight: number } | null>(null);
  const [customWeight, setCustomWeight] = useState<number>(100);

  const [dailyTotals, setDailyTotals] = useState({
    calories: 0,
    carbs: 0,
    fat: 0,
    protein: 0,
  });

  // Calculate daily totals
  useEffect(() => {

    const totals = meals.reduce(
      (acc, meal) => {
        acc.calories += parseInt(meal.calories) || 0;
        acc.carbs += parseInt(meal.carbs) || 0;
        acc.fat += parseInt(meal.fat) || 0;
        acc.protein += parseInt(meal.protein) || 0;
        return acc;
      },
      { calories: 0, carbs: 0, fat: 0, protein: 0 }
    );
  
    setDailyTotals({
      calories: Math.round(totals.calories),
      carbs: Math.round(totals.carbs),
      fat: Math.round(totals.fat),
      protein: Math.round(totals.protein),
    });
  }, [meals]);
  

  const toggleExpandMeal = (id: number) => {
    setExpandedMealId((prevId) => (prevId === id ? null : id)); // Toggle expand/collapse
  };

  const handleSelectFood = (mealId: number, foodName: string, foodId: number, weight: number) => {
    setSelectedFood({ mealId, foodName, foodId, weight });
  };

  const updateFoodInMeal = (mealId: number, foodId: number, newWeight: number) => {
    setMeals((prevMeals) =>
      prevMeals.map((meal) => {
        if (meal.id === mealId) {
          const updatedFoods = meal.foods.map((food) => {
            if (food.foodId === foodId) {
              const scaleFactor = newWeight / food.weight;
              return {
                ...food,
                weight: newWeight,
                calories: food.calories * scaleFactor,
                carbs: food.carbs * scaleFactor,
                fat: food.fat * scaleFactor,
                protein: food.protein * scaleFactor,
              };
            }
            return food;
          });
  
          const updatedMealTotals = updatedFoods.reduce(
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
            calories: `${Math.round(updatedMealTotals.calories)} kcal`,
            carbs: `${Math.round(updatedMealTotals.carbs)}g`,
            fat: `${Math.round(updatedMealTotals.fat)}g`,
            protein: `${Math.round(updatedMealTotals.protein)}g`,
          };
        }
        return meal;
      })
    );
  
    setSelectedFood(null); // Close the modal
  };
  
  

  const handleTap = (meal: { id: number; name: string }) => {
    setEditingMeal({ id: meal.id, name: meal.name });
  };

  const handleNameChange = (newName: string) => {
    setEditingMeal((prev) => ({
      ...(prev || { id: -1 }),
      name: newName,
    }));
  };

  const saveName = () => {
    if (editingMeal) {
      setMeals((prevMeals) =>
        prevMeals.map((meal) =>
          meal.id === editingMeal.id ? { ...meal, name: editingMeal.name } : meal
        )
      );
      setEditingMeal(null);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={{ alignItems: 'center', marginTop: 15 }}>
            <Text style={styles.smallText}>Wednesday 18th December</Text>
            <Text style={[styles.bigText, { marginTop: 10 }]}>
              {dailyTotals.calories} kcal / 1500 kcal
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <View>
              <Text style={styles.medText}>Carbs</Text>
              <Text style={styles.gramsText}>{dailyTotals.carbs}g / 120g</Text>
              <View style={{ height: '5%', backgroundColor: '#C889CD', borderRadius: '5%' }}></View>
            </View>
            <View>
              <Text style={styles.medText}>Fat</Text>
              <Text style={styles.gramsText}>{dailyTotals.fat}g / 120g</Text>
              <View style={{ height: '5%', backgroundColor: '#89B5CD', borderRadius: '5%' }}></View>
            </View>
            <View>
              <Text style={styles.medText}>Protein</Text>
              <Text style={styles.gramsText}>{dailyTotals.protein}g / 120g</Text>
              <View style={{ height: '5%', backgroundColor: '#CD8A89', borderRadius: '5%' }}></View>
            </View>
          </View>
        </View>
        <View
          style={{
            flex: 6,
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 70,
            borderTopRightRadius: 70,
            marginTop: 10,
            paddingBottom: 90,
          }}
        >
          <View style={styles.dayNav}>
            <Text>Yesterday</Text>
            <Text>Today</Text>
            <Text>Tomorrow</Text>
          </View>
          <FlatList
            data={meals}
            keyExtractor={(meal) => meal.id.toString()}
            renderItem={({ item: meal }) => (
              <TouchableWithoutFeedback>
                <View style={styles.mealContainer}>
                  <View style={styles.mealInfo}>
                    <View>
                      <View style={styles.mealInfoName}>
                        <TouchableWithoutFeedback onPress={() => toggleExpandMeal(meal.id)}>
                          <Text style={styles.expandText}>
                            {expandedMealId === meal.id ? '▲' : '▼'}
                          </Text>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback
                          onPress={() => handleTap(meal)}
                          delayLongPress={300}
                        >
                          {editingMeal?.id === meal.id ? (
                            <TextInput
                              value={editingMeal.name}
                              onChangeText={handleNameChange}
                              onBlur={saveName}
                              autoFocus
                              style={[styles.input, { fontFamily: 'OpenSans_400Regular' }]}
                            />
                          ) : (
                            <Text style={{ fontFamily: 'OpenSans_400Regular' }}>
                              {meal.name}
                            </Text>
                          )}
                        </TouchableWithoutFeedback>
                      </View>
                      <View style={styles.mealInfoMacros}>
                        <View style={[styles.circle, { backgroundColor: '#C889CD' }]} />
                        <Text style={styles.macrosText}>{meal.carbs}</Text>
                        <View style={[styles.circle, { backgroundColor: '#89B5CD' }]} />
                        <Text style={styles.macrosText}>{meal.fat}</Text>
                        <View style={[styles.circle, { backgroundColor: '#CD8A89' }]} />
                        <Text style={styles.macrosText}>{meal.protein}</Text>
                      </View>
                    </View>

                    <View>
                      <Text style={{ fontFamily: 'OpenSans_400Regular' }}>{meal.calories}</Text>
                      <CustomButton
                        label="Add Food"
                        onPress={() =>
                          router.push({ pathname: '/add-food', params: { mealId: meal.id } })
                        }
                      />
                    </View>
                  </View>

                  {/* Show foods in meal */}
                  {expandedMealId === meal.id && (
                    <View>
                      {meal.foods.map((food, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => handleSelectFood(meal.id, food.foodName, food.foodId, food.weight)}
                        >
                          <Text style={[styles.foodItem, { fontFamily: 'OpenSans_400Regular' }]}>
                            {food.foodName}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              </TouchableWithoutFeedback>
            )}
            ListFooterComponent={
              <View style={styles.addMealBtn}>
                <CustomButton
                  label="Add meal"
                  onPress={() =>
                    setMeals([
                      ...meals,
                      {
                        id: meals.length + 1,
                        name: `Meal`,
                        carbs: '0g',
                        fat: '0g',
                        protein: '0g',
                        calories: '0 kcal',
                        foods: [],
                      },
                    ])
                  }
                />
              </View>
            }
          />
        </View>

        {/* Modal for editing food */}
        {/* Modal for editing food */}
<Modal visible={!!selectedFood} animationType="slide">
  <View style={styles.modalContainer}>
    {selectedFood && (
      <>
        <Text style={styles.mediumText}>
          {selectedFood.foodName} (Current Weight: {selectedFood.weight}g)
        </Text>
        {/* <Text >
                  Calories: {adjustNutritionForWeight(parseNutritionalInfo(selectedFood.weight), customWeight).calories} kcal{`\n`}
                  Carbs: {adjustNutritionForWeight(parseNutritionalInfo(selectedFood.weight), customWeight).carbs} g{`\n`}
                  Fat: {adjustNutritionForWeight(parseNutritionalInfo(selectedFood.food_description), customWeight).fat} g{`\n`}
                  Protein: {adjustNutritionForWeight(parseNutritionalInfo(selectedFood.food_description), customWeight).protein} g{`\n`}
                </Text> */}
        <TextInput
          keyboardType="numeric"
          value={String(selectedFood.weight)}
          onChangeText={(value) =>
            setSelectedFood((prev) =>
              prev ? { ...prev, weight: Number(value) } : null
            )
          }
          placeholder="Enter weight in grams"
          style={styles.modalTextInput}
        />
        <View style={styles.modalButtons}>
          <TouchableOpacity
            onPress={() =>
              updateFoodInMeal(
                selectedFood.mealId,
                selectedFood.foodId,
                selectedFood.weight
              )
            }
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedFood(null)}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </>
    )}
  </View>
</Modal>

      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
    backgroundColor: '#F4E3E3',
  },
  headerContainer: {
    flex: 1,
    backgroundColor: '#F4E3E3',
    width: '70%',
    margin: 'auto',
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    
  },
  smallText: {
    fontSize: 12,
    fontFamily: 'OpenSans_400Regular'
  },
  medText: {
    fontSize: 12,
    fontFamily: 'OpenSans_400Regular'
  },
  bigText: {
    fontSize: 20,
    fontFamily: 'OpenSans_700Bold',
  
    
  },
  gramsText: {
    fontSize: 10,
    fontWeight: '200', 
    fontFamily: 'OpenSans_300Light,'
  },
  mealContainer: {
    marginLeft: 30,
    marginRight: 30,
    marginTop: 20,
    backgroundColor: '#D6CECE',
    borderRadius: 10,
    padding: 20,
  },
  mealInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mealInfoName: {
    flexDirection: 'row',
  },
  mealInfoMacros: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  macrosText: {
    marginRight: 5,
    fontSize: 12,
    fontFamily: 'OpenSans_300Light'
  },
  circle: {
    width: 10, 
    height: 10, 
    borderRadius: 10,
    marginRight: 3, 
  },
  addMealBtn: {
    marginTop: 20,
    marginLeft: 30,
    marginRight: 30,
    
  },
  dayNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#CCC',
    padding: 5,
    fontSize: 16,
    fontFamily: 'OpenSans_400Regular'
  },
  expandText: {
    fontSize: 18,
    color: '#888',
  },
  foodItem: {
    fontSize: 16,
    color: '#555',
    backgroundColor: '#F4E3E3',
    marginTop: 1,
    padding: 5
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    padding: 20,
  },
  mediumText: {
    fontSize: 18,
    fontFamily: 'OpenSans_700Bold',
    marginBottom: 10,
  },
  modalTextInput: {
    height: 40,
    borderColor: '#CCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    fontFamily: 'OpenSans_400Regular',
    width: '100%',
    marginBottom: 15,
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
});