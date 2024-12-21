import { View, Text, StyleSheet } from 'react-native';

export default function Goals() {
  return (
    <View style={styles.container}>
      <Text>Tab [Goals]</Text>
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
