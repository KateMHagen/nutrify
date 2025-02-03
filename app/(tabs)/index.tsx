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
import { CustomButton } from '../components/CustomButton';
import { useMeals } from '../context/MealsContext';
import { router } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
import supabase from '@/lib/supabase';

export default function Index() {
  const { selectedDate, setSelectedDate, getMeals, updateMeals, addMeal } = useMeals();
  const [editingMeal, setEditingMeal] = useState<{ id: number; name: string } | null>(null);
  const [expandedMealId, setExpandedMealId] = useState<number | null>(null);
  const [selectedFood, setSelectedFood] = useState<{
    mealId: number;
    foodName: string;
    foodId: number;
    weight: number;
  } | null>(null);

  const [dailyTotals, setDailyTotals] = useState({
    calories: 0,
    carbs: 0,
    fat: 0,
    protein: 0,
  });

  const meals = getMeals();
  

  // Calculate daily totals
  useEffect(() => {
    const totals = meals.reduce(
      (acc, meal) => {
        acc.calories += Number(meal.calories) || 0;
        acc.carbs += Number(meal.carbs) || 0;
        acc.fat += Number(meal.fat) || 0;
        acc.protein += Number(meal.protein) || 0;
        return acc;
      },
      { calories: 0, carbs: 0, fat: 0, protein: 0 }
    );

    setDailyTotals((prevTotals) => {
      const updatedTotals = {
        calories: Math.round(totals.calories),
        carbs: Math.round(totals.carbs),
        fat: Math.round(totals.fat),
        protein: Math.round(totals.protein),
      };

      if (
        prevTotals.calories !== updatedTotals.calories ||
        prevTotals.carbs !== updatedTotals.carbs ||
        prevTotals.fat !== updatedTotals.fat ||
        prevTotals.protein !== updatedTotals.protein
      ) {
        return updatedTotals;
      }
      return prevTotals;
    });
  }, [meals]);

  const changeDate = (days: number) => {
    if (days === 0) {
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
    } else {
      const newDate = new Date(selectedDate);
      newDate.setDate(newDate.getDate() + days);
      setSelectedDate(newDate.toISOString().split('T')[0]);
    }
  };

  const toggleExpandMeal = (id: number) => {
    setExpandedMealId((prevId) => (prevId === id ? null : id));
  };

  const handleSelectFood = (mealId: number, foodName: string, foodId: number, weight: number) => {
    setSelectedFood({ mealId, foodName, foodId, weight });
  };

  // Update food weight and recalc macros locally (the MealsContext updateMeals call will upsert to Supabase)
  const updateFoodInMeal = (mealId: number, foodId: number, newWeight: number) => {
    const currentMeals = getMeals();
    const updatedMeals = currentMeals.map((meal) => {
      if (meal.id === mealId) {
        const updatedFoods = meal.foods.map((food) => {
          if (food.foodId === foodId) {
            const scaleFactor = newWeight / food.weight;
            return {
              ...food,
              weight: newWeight,
              calories: Math.round(food.calories * scaleFactor),
              carbs: Math.round(food.carbs * scaleFactor),
              fat: Math.round(food.fat * scaleFactor),
              protein: Math.round(food.protein * scaleFactor),
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
          calories: Math.round(updatedMealTotals.calories),
          carbs: Math.round(updatedMealTotals.carbs),
          fat: Math.round(updatedMealTotals.fat),
          protein: Math.round(updatedMealTotals.protein),
        };
      }
      return meal;
    });
    updateMeals(updatedMeals);
    setSelectedFood(null);
    // Auto-expand this meal so its foods are visible
    setExpandedMealId(mealId);
  };

  const removeFoodFromMeal = async (mealId: number, foodId: number) => {
    try {
      // ✅ Remove food using `id`
      const { error } = await supabase
        .from('meal_foods')
        .delete()
        .match({ id: foodId }); // ✅ Use primary key `id`
  
      if (error) {
        console.error('Error removing food:', error.message);
        return;
      }
  
      // ✅ Update UI to remove only the selected food
      const updatedMeals = meals.map((meal) => {
        if (meal.id === mealId) {
          return {
            ...meal,
            foods: meal.foods.filter((food) => food.id !== foodId), // ✅ Remove only this row
          };
        }
        return meal;
      });
  
      updateMeals(updatedMeals);
  
    } catch (error) {
      console.error('Error removing food from meal:', error);
    }
  };
  
  

  const deleteMeal = (mealId: number) => {
    updateMeals(getMeals().filter((meal) => meal.id !== mealId));
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
      updateMeals(
        getMeals().map((meal) =>
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
            <Text style={styles.smallText}>{selectedDate}</Text>
            <Text style={[styles.bigText, { marginTop: 10 }]}>
              {dailyTotals.calories} kcal / 1500 kcal
            </Text>
          </View>
          <View style={styles.headerInfo}>
            <View>
              <Text style={styles.medText}>Carbs</Text>
              <Text style={styles.gramsText}>{dailyTotals.carbs}g / 120g</Text>
              <View style={{ height: '5%', backgroundColor: '#C889CD', borderRadius: 5 }} />
            </View>
            <View>
              <Text style={styles.medText}>Fat</Text>
              <Text style={styles.gramsText}>{dailyTotals.fat}g / 120g</Text>
              <View style={{ height: '5%', backgroundColor: '#89B5CD', borderRadius: 5, marginTop: 3 }} />
            </View>
            <View>
              <Text style={styles.medText}>Protein</Text>
              <Text style={styles.gramsText}>{dailyTotals.protein}g / 120g</Text>
              <View style={{ height: '5%', backgroundColor: '#CD8A89', borderRadius: 5, marginTop: 3 }} />
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
            <TouchableOpacity onPress={() => changeDate(-1)}>
              <Text style={styles.dayNavText}>Yesterday</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => changeDate(0)}>
              <Text style={styles.dayNavText}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => changeDate(1)}>
              <Text style={styles.dayNavText}>Tomorrow</Text>
            </TouchableOpacity>
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
                        <TouchableWithoutFeedback onPress={() => handleTap(meal)} delayLongPress={300}>
                          {editingMeal?.id === meal.id ? (
                            <TextInput
                              value={editingMeal.name}
                              onChangeText={handleNameChange}
                              onBlur={saveName}
                              autoFocus
                              style={[styles.input, { fontFamily: 'OpenSans_400Regular' }]}
                            />
                          ) : (
                            <Text style={{ fontFamily: 'OpenSans_400Regular' }}>{meal.name}</Text>
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
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontFamily: 'OpenSans_400Regular' }}>{meal.calories}</Text>
                        <TouchableOpacity onPress={() => deleteMeal(meal.id)}>
                          <AntDesign name="close" size={15} color="black" />
                        </TouchableOpacity>
                      </View>
                      <CustomButton
                        label="Add Food"
                        onPress={() =>
                          router.push({ pathname: '/add-food', params: { mealId: meal.id } })
                        }
                      />
                    </View>
                  </View>

                  {expandedMealId === meal.id && (
                    <View>
                      {meal.foods.map((food) => (
                        <View key={food.food_id} style={styles.foodItem}>
                          <TouchableOpacity
                            onPress={() =>
                              handleSelectFood(meal.id, food.food_name, food.foodId, food.weight)
                            }
                          >
                            <Text style={styles.foodItemText}>{food.food_name}</Text> 
                          </TouchableOpacity>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.foodItemText}>{Math.round(food.calories)} kcal</Text>
                            <TouchableOpacity onPress={() => removeFoodFromMeal(meal.id, food.id)}>
                              <AntDesign name="close" size={12} color="black" style={{ marginLeft: 15 }} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                </View>
              </TouchableWithoutFeedback>
            )}
            ListFooterComponent={
              <View style={styles.addMealBtn}>
                <CustomButton label="Add meal" onPress={addMeal} />
              </View>
            }
          />
        </View>

        <Modal visible={!!selectedFood} animationType="slide">
          <View style={styles.modalContainer}>
            {selectedFood && (
              <>
                <Text style={styles.mediumText}>
                  {selectedFood.foodName} (Current Weight: {selectedFood.weight}g)
                </Text>
                <TextInput
                  keyboardType="numeric"
                  value={String(selectedFood.weight)}
                  onChangeText={(value) =>
                    setSelectedFood((prev) => (prev ? { ...prev, weight: Number(value) } : null))
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
    backgroundColor: '#EAE7F5',
  },
  headerContainer: {
    flex: 1,
    backgroundColor: '#EAE7F5',
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
    fontFamily: 'OpenSans_400Regular',
  },
  medText: {
    fontSize: 12,
    fontFamily: 'OpenSans_400Regular',
  },
  bigText: {
    fontSize: 20,
    fontFamily: 'OpenSans_700Bold',
  },
  gramsText: {
    fontSize: 10,
    fontWeight: '200',
    fontFamily: 'OpenSans_300Light',
  },
  mealContainer: {
    marginHorizontal: 30,
    marginTop: 20,
    backgroundColor: '#FBFBFB',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#EAE7F5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
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
    fontFamily: 'OpenSans_300Light',
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 10,
    marginRight: 3,
  },
  addMealBtn: {
    marginTop: 20,
    marginHorizontal: 30,
  },
  dayNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 10,
  },
  dayNavText: {
    fontFamily: 'OpenSans_400Regular',
    marginHorizontal: 10,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#CCC',
    padding: 5,
    fontSize: 16,
    fontFamily: 'OpenSans_400Regular',
  },
  expandText: {
    fontSize: 18,
    color: 'black',
    marginRight: 5,
  },
  foodItemText: {
    fontSize: 16,
    color: '#555',
    fontFamily: 'OpenSans_400Regular',
  },
  foodItem: {
    backgroundColor: '#EAE7F5',
    width: '98%',
    marginTop: 1,
    padding: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 5,
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
    margin: 3,
  },
  modalButtons: {
    marginTop: 10,
    flexDirection: 'column',
    alignItems: 'center',
  },
});
