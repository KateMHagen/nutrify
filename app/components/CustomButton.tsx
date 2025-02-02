import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface CustomButtonProps {
  onPress: () => void;
  label: string;
  style?: object; // Optional additional styles
}

export const CustomButton: React.FC<CustomButtonProps> = ({ onPress, label, style }) => {
  return (
    <TouchableOpacity style={[styles.baseButton, style]} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    backgroundColor: "#9B88FE",
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 5,
    paddingHorizontal: 30, // Default padding
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    fontFamily: 'OpenSans_400Regular'
  },
});
