import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { ScrollView } from 'react-native';
export default function Goals() {
  return (
    <View style={styles.container}>

      {/* Goals Container */}
      <Text style={styles.headerText}>Goals</Text>
      <View style={styles.goalsContainer}>
        <View style={styles.goalsWidget}>
          <Text style={styles.textStyle}>Start weight</Text>
          <Text style={[styles.textStyle, styles.bigText]}>64.4 kg</Text>
          <Text style={[styles.textStyle, styles.smallText]}>01/15/2025</Text>
        </View>

        <View style={styles.goalsWidget}>
          <Text style={styles.textStyle}>Current weight</Text>
          <Text style={[styles.textStyle, styles.bigText]}>64.4 kg</Text>
          <Text style={[styles.textStyle, styles.smallText, {color: 'green'}]}>- 0.9kg</Text>
        </View>

        <View style={styles.goalsWidget}>
          <Text style={styles.textStyle}>Nutrition goal</Text>
          <Text style={[styles.textStyle, styles.bigText]}>1500 kcal</Text>
          <View style={styles.macros}>
            <View>
              <Text style={[styles.textStyle, styles.smallText]}>Carbs</Text>
              <Text style={[styles.textStyle, styles.smallText]}>120 g</Text>
              <View style={[styles.circle, { backgroundColor: '#C889CD' }]} />
            </View>
            <View>
              <Text style={[styles.textStyle, styles.smallText]}>Fat</Text>
              <Text style={[styles.textStyle, styles.smallText]}>120 g</Text>
              <View style={[styles.circle, { backgroundColor: '#89B5CD' }]} />
            </View>
            <View>
              <Text style={[styles.textStyle, styles.smallText]}>Protein</Text>
              <Text style={[styles.textStyle, styles.smallText]}>120 g</Text>
              <View style={[styles.circle, { backgroundColor: '#CD8A89' }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Entries Container */}
      <Text style={[styles.headerText, {marginTop: 30}]}>Your Entries</Text>
      <ScrollView style={styles.entriesContainer}> 
        <View style={styles.entriesWidget}>
          <View>
            <Text style={styles.textStyle}>Wednesday</Text>
            <Text style={[styles.textStyle, styles.smallText]}>01/15/2025</Text>
          </View>
          <Text style={[styles.textStyle, styles.bigText]}>64.4 kg</Text>
        </View>
          
      </ScrollView>

      <TouchableOpacity>
        <View style={{marginTop: 5, alignSelf: 'center'}}><Ionicons name="add-circle-sharp" size={50} color="black" /></View>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    justifyContent: 'center',

  },
  goalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',

  },
  goalsWidget: {
    backgroundColor: '#D4DFF0',
    height: 110,
    width: 120,
    borderRadius: 8,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    paddingHorizontal: 10
  },
  textStyle: {
    fontFamily: 'OpenSans_400Regular',
  },
  smallText: {
    fontFamily: 'OpenSans_400Regular',
    fontSize: 10,
  },
  headerText: {
    fontSize: 20,
    marginBottom: 10,
  },
  bigText: {
    fontSize: 16,
    fontFamily: 'OpenSans_700Bold',
  },
  macros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circle: {
    width: 27,
    height: 3,
    borderRadius: 10,
    marginRight: 3,
  },
  entriesContainer: {
    maxHeight: 450
  },
  entriesWidget: {
    backgroundColor: '#D4DFF0',
    height: 60,
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    flexDirection: 'row',
    marginBottom: 10,
  },
 


});
