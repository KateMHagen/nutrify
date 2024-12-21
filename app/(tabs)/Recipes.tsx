import { View, Text, StyleSheet } from 'react-native';

export default function CalorieTracker() {
  return (
    <View style={styles.container}>
      <Text>Tab [Recipes]</Text>
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
