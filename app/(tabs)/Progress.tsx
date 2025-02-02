import { View, Text, StyleSheet, TouchableOpacity, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import { ScrollView } from 'react-native';
import supabase from '@/lib/supabase';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function Progress() {
  const [weight, setWeight] = useState('');
  const [entries, setEntries] = useState<{ weight: number; date: string; user_id: string }[]>([]);
  const [startWeight, setStartWeight] = useState<number | null>(null);

  const [userId, setUserId] = useState('');
  const [editingStartWeight, setEditingStartWeight] = useState(false);
  const [startWeightDate, setStartWeightDate] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<{ weight: number; date: string; user_id: string } | null>(null);
  const [editedWeight, setEditedWeight] = useState<number | null>(null);

  // Fetch user ID once when the component mounts
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user?.id) {
        console.error('Error fetching user:', error?.message);
        return;
      }

      console.log("User ID:", data.user.id);
      setUserId(data.user.id);
      fetchEntries(data.user.id);
    };

    fetchUser();
  }, []);


  // Fetch weight entries for the logged-in user
  const fetchEntries = async (id: string) => {
    if (!id) return;
    
    // Fetch weight entries
    const { data: weightEntries, error: weightError } = await supabase
      .from('weight_entries')
      .select('*')
      .eq('user_id', id)
      .order('date', { ascending: false }); // Oldest entry first
  
    if(weightError) {
      console.error('Error fetching entries:', weightError.message);
    } 

    // Ensure weightEntries is always an array (prevents 'undefined' errors)
    const entries = weightEntries ?? [];
    setEntries(entries);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('start_weight, start_date')
      .eq('id', id)
      .single();
    
      if(profileError) {
        console.error('Error fetching entries:', profileError.message);
      } else if(profile?.start_weight !== null) {
        // If start weight is saved use it
        setStartWeight(profile.start_weight);
        setStartWeightDate(profile.start_date);
      } else if(entries?.length > 0) {
        // Else if there's no start weight in profile but weight entries,
        // make first entry start weight
        saveStartWeight(entries[0].weight, entries[0].date);
      } 
  };

  const saveStartWeight = async (weight: React.SetStateAction<number | null>, date: React.SetStateAction<string | null>) => {
    if (!userId) return;
  
    const { error } = await supabase
      .from('profiles')
      .update({ start_weight: weight, start_date: date })
      .eq('id', userId);
  
    if (error) {
      console.error('Error saving start weight:', error.message);
    } else {
      console.log('Start weight saved:', weight);
      setStartWeight(weight);
      setStartWeightDate(date);
    }
  };
  
  

  // Handle adding a new weight entry
  const handleAddEntry = async () => {
    if (!weight || !userId) return; // Ensure valid weight and userId
  
    const newEntry = {
      weight: parseFloat(weight),
      date: new Date().toISOString(),
      user_id: userId,
    };
  
    const { error } = await supabase.from('weight_entries').insert([newEntry]);
  
    if (error) {
      console.error('Error adding entry:', error.message);
    } else {
      console.log("Entry added:", newEntry);
  
      setEntries((prevEntries) => [newEntry, ...prevEntries]);
  
      // If this is the first weight entry, store it as the start weight
      if (entries.length === 0) {
        saveStartWeight(newEntry.weight, newEntry.date);
      }
  
      setWeight(''); // Clear input field
    }
  };
  
  const handleDeleteEntry = async (entry: { date: any; }) => {
    if(!entry || !userId) return;
  
    const { error} = await supabase
      .from('weight_entries')
      .delete()
      .eq('user_id', userId)
      .eq('date', entry.date);

    if (error) {
      console.error('Error deleting entry:', error.message);
      return;
    }
    
    console.log('Entry deleted successfully:', entry);
    
    // REmove from local state
    const updatedEntries = entries.filter((e) => e.date !== entry.date);

    setEntries(updatedEntries);

    // If deleted entry is start weight, update start weight
    if (entries.length > 0 && entry.date === entries[entries.length - 1].date) {
      console.log("Updating start weight after deleting first entry");
  
      if (updatedEntries.length > 0) {
        // New start weight is the next oldest entry
        const newStartWeight = updatedEntries[updatedEntries.length - 1];
        
        // Update start weight in Supabase profiles
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ start_weight: newStartWeight.weight })
          .eq('id', userId);
  
        if (profileError) {
          console.error('Error updating start weight in profile:', profileError.message);
        } else {
          setStartWeight(newStartWeight.weight);
        }
      } else {
        // If no more weight entries, remove start weight
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ start_weight: null })
          .eq('id', userId);
  
        if (profileError) {
          console.error('Error deleting start weight in profile:', profileError.message);
        } else {
          setStartWeight(null);
        }
      }
    }
  }


  const handleSaveEditedEntry = async () => {
    if (!editingEntry || !editingEntry.date || editedWeight === null || !userId) return;
  
    console.log("Updating weight:", editedWeight, "for date:", editingEntry.date);
  
    // Update the weight entry in weight_entries
    const { error: weightEntryError } = await supabase
      .from('weight_entries')
      .update({ weight: editedWeight })
      .eq('user_id', userId)
      .eq('date', editingEntry.date);
  
    if (weightEntryError) {
      console.error('Error updating weight entry:', weightEntryError.message);
      return;
    }
  
    console.log('Weight updated successfully:', editedWeight);
  
    // If this is the first entry, update the start weight in profiles
    if (entries.length > 0 && editingEntry.date === entries[entries.length - 1].date) {
      console.log('Updating start weight in profiles:', editedWeight);
  
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ start_weight: editedWeight })
        .eq('id', userId);
  
      if (profileError) {
        console.error('Error updating start weight in profiles:', profileError.message);
        return;
      }
  
      setStartWeight(editedWeight);
    }
  
    // Update UI immediately
    setEntries((prevEntries) =>
      prevEntries.map((entry) =>
        entry.date === editingEntry.date ? { ...entry, weight: editedWeight } : entry
      )
    );
  
    // Reset editing state
    setEditingEntry(null);
    setEditedWeight(null);
  };
  
  
  
  
  
  
  

  return (
    <View style={styles.container}>
      {/* Goals Section */}

      <Text style={styles.headerText}>Goals</Text>
      <View style={styles.goalsContainer}>
      
      <View style={styles.goalsWidget}>
        <Text style={styles.textStyle}>Start weight</Text>
        <Text style={[styles.textStyle, styles.bigText]}>
          {startWeight !== null ? `${startWeight} kg` : 'No Data'}
        </Text>
        <Text style={[styles.textStyle, styles.smallText]}>
          {startWeightDate ? new Date(startWeightDate).toLocaleDateString() : ''}
        </Text>
      </View>

        
        <View style={styles.goalsWidget}>
          <Text style={styles.textStyle}>Current weight</Text>
          <Text style={[styles.textStyle, styles.bigText]}>
            {entries.length > 0 ? `${entries[0].weight} kg` : 'No Data'}
          </Text>
          <Text style={[styles.textStyle, styles.smallText]}>
            {startWeight !== null && entries.length > 0 
              ? `${startWeight < entries[0].weight ? '+' : '-'} ${Math.abs(startWeight - entries[0].weight).toFixed(1)} kg`
              : ''}
          </Text>
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
  
      {/* Entries Section */}
      <Text style={[styles.headerText, { marginTop: 30 }]}>Your Entries</Text>
      <ScrollView style={styles.entriesContainer}>
        {entries.map((entry, index) => (
          <View key={index} style={styles.entriesWidget}>
            <View>
              <Text style={styles.textStyle}>{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long' })}</Text>
              <Text style={[styles.textStyle, styles.smallText]}>
                {new Date(entry.date).toLocaleDateString()}
              </Text>
            </View>

            {/* Edit entry */}
            <TouchableOpacity onPress={() => {
              setEditingEntry(entry);
              setEditedWeight(entry.weight);
            }}>
              {editingEntry?.date === entry.date ? (
                <View>
                  <TextInput 
                    style={[styles.textStyle, styles.bigText]}
                    keyboardType="decimal-pad"
                    value={editedWeight !== null ? editedWeight.toString() : ''}
                    onChangeText={(text) => {
                      const formattedText = text.replace(/[^0-9.]/g, '');
                      setEditedWeight(formattedText ? parseFloat(formattedText) : null);
                    }}
                  onBlur={handleSaveEditedEntry}
                  autoFocus
                  />
                  
               
                </View>
              ) : (
                <Text style={[styles.textStyle, styles.bigText]}>
                  {entry.weight} kg
                  <TouchableOpacity onPress={() => handleDeleteEntry(entry)}>
                    <Text style={{marginLeft: 15}}><AntDesign name="close" size={12} color="black" /></Text>
                  </TouchableOpacity>
                </Text>
              )}
      </TouchableOpacity>
    </View>
  ))}
      </ScrollView>

      {/* Input for Weight */}
      <TextInput
        style={styles.input}
        placeholder="Enter weight (kg)"
        placeholderTextColor={'#D5CAFB'}
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
      />

      {/* Add Entry Button */}
      <TouchableOpacity onPress={handleAddEntry}>
        <View style={{ marginTop: 5, alignSelf: 'center' }}>
          <Ionicons name="add-circle-sharp" size={50} color="black" />
        </View>
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
    backgroundColor: '#E6E6F2',
    height: 110,
    width: 120,
    borderRadius: 8,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    paddingHorizontal: 10,
    shadowColor: '#D5CAFB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5, 
  },
  textStyle: {
    fontFamily: 'OpenSans_400Regular',
  },
  smallText: {
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
    maxHeight: 450,
  },
  entriesWidget: {
    backgroundColor: '#E6E6F2',
    height: 60,
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    flexDirection: 'row',
    marginBottom: 10,
    shadowColor: '#D5CAFB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',

  },

});
