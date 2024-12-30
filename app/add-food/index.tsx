import React from 'react';
import { View, Text } from 'react-native';


// "https://platform.fatsecret.com/rest/foods/search/v3"

export default function addFoodScreen() {

  

    return (
      <View>
        {/* Search bar */}
        <Text>Search for a food</Text>
        {/* Options */}
        <View>
          <View><Text>Scan a Barcode</Text></View>
          <View><Text>Scan a Meal</Text></View>
          <View><Text>Quick Add</Text></View>
        </View>
        {/* History log */}
        <View>
          <Text>History</Text>
          {/* View for each food item, you can click on the food
          item then it will open a page with its nutrition info */}
          <View>
            <Text>Chicken Breast</Text>
            <Text>+</Text>
          </View>
        </View>
      </View>
    );
};


