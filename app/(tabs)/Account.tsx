import supabase from '@/lib/supabase';
import { router } from 'expo-router';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function CalorieTracker() {
  return (
    <View style={styles.container}>
      <Text>Tab [Account]</Text>
      <Button title="Sign Out"  onPress={async () => {
        await supabase.auth.signOut();
        router.replace("../App")
      }} />
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
