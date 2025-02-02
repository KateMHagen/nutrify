import { CustomButton } from '@/components/CustomButton';
import supabase from '@/lib/supabase';
import { router } from 'expo-router';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function CalorieTracker() {
  return (
    <View style={styles.container}>
      <CustomButton
        label="Sign Out"
        onPress={async () => {
          await supabase.auth.signOut();
          router.replace("../App")
        }}
       />
     
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
