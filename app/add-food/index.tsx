import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import searchFoods from "../lib/fatsecret"; // Import the searchFoods function

export default function AddFoodScreen() {
  // State variables
  const [query, setQuery] = useState<string>(''); // Food search query
  const [foods, setFoods] = useState<any[]>([]); // List of foods fetched from the API
  const [loading, setLoading] = useState<boolean>(false); // Loading state

  // Function to handle food search
  const handleSearch = async () => {
    if (query.trim()) {
      setLoading(true); // Set loading to true when starting the search
      try {
        const result = await searchFoods(query); // Call the search function

        // Check the structure of the API response and set the foods
        if (result && result.foods && result.foods.food) {
          const foodList = Array.isArray(result.foods.food)
            ? result.foods.food
            : [result.foods.food]; // Ensure we have an array
          setFoods(foodList); // Set the foods in state
        } else {
          setFoods([]); // No foods found
        }
      } catch (error) {
        console.error('Error searching for foods:', error);
      } finally {
        setLoading(false); // Set loading to false after the search is complete
      }
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Search for a food</Text>

      {/* Search bar */}
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

      {/* Search button */}
      <Button title="Search" onPress={handleSearch} disabled={loading} />

      {loading && (
        <View style={{ marginVertical: 10 }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}

      {/* Display food search results */}
      <FlatList
        data={foods}
        keyExtractor={(item) => item.food_id.toString()}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 }}>
            <Text>{item.food_name}</Text>
            <TouchableOpacity onPress={() => alert(`Added ${item.food_name}`)}>
              <Text style={{ color: 'green' }}>+</Text>
            </TouchableOpacity>
          </View>
        )}
        
      />

      {/* Options for other actions */}
      <View style={{ marginTop: 20 }}>
        <Text>Options:</Text>
        <View>
          <TouchableOpacity><Text>Scan a Barcode</Text></TouchableOpacity>
          <TouchableOpacity><Text>Scan a Meal</Text></TouchableOpacity>
          <TouchableOpacity><Text>Quick Add</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
