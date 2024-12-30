import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { CustomButton } from "../components/CustomButton";
import { router } from 'expo-router';

export default function Index() {
  const [meals, setMeals] = useState([
    { id: 1, name: 'Breakfast', carbs: '50g', fat: '50g', protein: '50g', calories: '500 kcal', foods: ['Eggs', 'Toast', 'Orange Juice'] },
    { id: 2, name: 'Lunch', carbs: '60g', fat: '30g', protein: '40g', calories: '450 kcal', foods: ['Salad', 'Chicken', 'Rice'] },
    { id: 3, name: 'Dinner', carbs: '40g', fat: '20g', protein: '30g', calories: '350 kcal', foods: ['Steak', 'Potatoes', 'Green Beans'] },
  ]);

  const [editingMeal, setEditingMeal] = useState<{ id: number; name: string } | null>(null);
  const [expandedMealId, setExpandedMealId] = useState<number | null>(null);

  // Get next available meal ID
  const getNextMealId = () => {
    const maxId = meals.reduce((max, meal) => Math.max(max, meal.id), 0);
    return maxId + 1;
  };

  const addMeal = () => {
    const newMeal = {
      id: getNextMealId(),
      name: `Meal`,
      carbs: '0g',
      fat: '0g',
      protein: '0g',
      calories: '0 kcal',
      foods: [], // Empty foods list initially
    };
    setMeals([...meals, newMeal]);
  };

  const removeMeal = (id: number) => {
    const newMeals = meals.filter((meal) => meal.id !== id)
    setMeals(newMeals);
  };

  const handleTap = (meal: { id: any; name: any; }) => {
    setEditingMeal({ id: meal.id, name: meal.name });
  };

  const handleNameChange = (newName: string) => {
    setEditingMeal((prev) => ({
      ...(prev || { id: -1 }), // Default ID if prev is null
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

  const toggleExpandMeal = (id: number) => {
    setExpandedMealId((prevId) => (prevId === id ? null : id)); // Toggle expand/collapse
  };

  const renderMeals = () => {
    return meals.map((meal) => (
      <View key={meal.id} style={styles.mealContainer}>
        <View style={styles.mealInfo}>
         
            <View>
              <View style={styles.mealInfoName}>
                <TouchableWithoutFeedback onPress={() => toggleExpandMeal(meal.id)}>
                  <Text style={styles.expandText}>{expandedMealId === meal.id ? '▲' : '▼'}</Text>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback
                  onPress={() => handleTap(meal)}
                  delayLongPress={300} // Adjust for responsiveness
                >
                  {editingMeal?.id === meal.id ? (
                    <TextInput
                      value={editingMeal.name}
                      onChangeText={handleNameChange}
                      onBlur={saveName} // Save name when input loses focus
                      autoFocus
                      style={[styles.input, {fontFamily: 'OpenSans_400Regular'}]}
                    />
                  ) : (
                    <Text style={{fontFamily: 'OpenSans_400Regular'}} >{meal.name}</Text>
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
              <Text style={{fontFamily: 'OpenSans_400Regular'}}>{meal.calories}</Text>
              <CustomButton label="Add Food" onPress={() => router.push("/add-food")}/>
            </View>
            
            
         

          
            
        </View>
          
          {expandedMealId === meal.id && (
            <View>
              {meal.foods.length > 0 ? (
                meal.foods.map((food, index) => <Text key={index} style={[styles.foodItem, {fontFamily: 'OpenSans_400Regular'}]}>{food}</Text>)
              ) : (
                <Text>No foods logged</Text>
              )}
            </View>
          )}
        
        <View>
          
         
          {/* <CustomButton label="Remove Meal" onPress={() => removeMeal(meal.id)} /> */}
        </View> 
      </View>
    ));
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={{ alignItems: 'center', marginTop: 15 }}>
            <Text style={styles.smallText}>Wednesday 18th December</Text>
            <Text style={[styles.bigText, { marginTop: 10 }]}>1000 kcal / 1500 kcal</Text>
          </View>
          <View style={styles.headerInfo}>
            <View>
              <Text style={styles.medText}>Carbs</Text>
              <Text style={styles.gramsText}>50g / 120g</Text>
              <View style={{ height: '5%', backgroundColor: '#C889CD', borderRadius: '5%' }}></View>
            </View>
            <View>
              <Text style={styles.medText}>Fat</Text>
              <Text style={styles.gramsText}>50g / 120g</Text>
              <View style={{ height: '5%', backgroundColor: '#89B5CD', borderRadius: '5%' }}></View>
            </View>
            <View>
              <Text style={styles.medText}>Protein</Text>
              <Text style={styles.gramsText}>50g / 120g</Text>
              <View style={{ height: '5%', backgroundColor: '#CD8A89', borderRadius: '5%' }}></View>
            </View>
          </View>
        </View>
        <View style={{ flex: 6, backgroundColor: '#FFFFFF', borderTopLeftRadius: 70, borderTopRightRadius: 70, marginTop: 10}}>
          <View style={styles.dayNav}>
            <Text>Yesterday</Text>
            <Text>Today</Text>
            <Text>Tomorrow</Text>
          </View>
          {renderMeals()}
          <View style={styles.addMealBtn}>
            <CustomButton label="Add meal" onPress={addMeal} />
          </View>
        </View>
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
    marginTop: 10,
    
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
    fontSize: 22,
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
});