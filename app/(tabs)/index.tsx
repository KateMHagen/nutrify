import { Card } from '@rneui/themed';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase'

export default function Index() {
  // const [user, setUser] = useState<any>(null); // State to store the user object

  // useEffect(() => {
  //   // Get the current logged-in user
  //   const fetchUser = async () => {
  //     try {
  //       const { data: { user }, error } = await supabase.auth.getUser();
  //       if (error) {
  //         console.error('Error fetching user:', error);
  //         return;
  //       }
  //       setUser(user); // Set the user if logged in
  //     } catch (error) {
  //       console.error('Error:', error);
  //     }
  //   };

  //   fetchUser(); // Call the function to fetch user

  // }, []); 

  return (
    <View
      style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={{ alignItems: 'center', marginTop: 15, }}>
          <Text style={styles.smallText}>Wednesday 18th December</Text>  
          <Text style={[styles.bigText, {marginTop: 10}]}>1000 kcal / 1500 kcal</Text>
        </View>

        <View style={[
          {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 10,
 
          },
        ]}>
          <View>
      {/* {user ? (
        <Text>User ID: {user.id}</Text>
      ) : (
        <Text>No user logged in</Text>
      )} */}
    </View>
          <View>
            <Text style={styles.medText}>Carbs</Text>
            <Text style={styles.gramsText}>50g / 120g</Text>
            <View style={{height: '5%', backgroundColor:'#C889CD', borderRadius: '5%'}}></View>
          </View>
          <View>
            <Text style={styles.medText}>Fat</Text>
            <Text style={styles.gramsText}>50g / 120g</Text>
            <View style={{height: '5%', backgroundColor:'#89B5CD', borderRadius: '5%'}}></View>
          </View>
          <View>
            <Text style={styles.medText}>Protein</Text>
            
            <Text style={styles.gramsText}>50g / 120g</Text>
            <View style={{height: '5%', backgroundColor:'#CD8A89', borderRadius: '5%'}}></View>
          </View>
        </View>
        
      </View> 
      <View style={{flex: 6, backgroundColor: '#FFFFFF', borderTopLeftRadius: 70, borderTopRightRadius: 70}}>

      </View>

    </View>
  ); 
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
    backgroundColor: '#E0EBF1', 
  },
  headerContainer: {
    flex: 1, 
    backgroundColor: '#E0EBF1', 
    width: '70%', 
    margin: 'auto',
  },
  smallText: {
    fontSize: 10, 
  },
  
  medText: {
    fontSize: 12, 
  },
  bigText: {
    fontSize: 24,
    fontWeight: '600',
  },
  gramsText: {
    fontSize: 10,
    fontWeight: '200',
  },
 
});
