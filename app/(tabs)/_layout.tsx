import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useRouter } from 'expo-router';

export default function TabLayout() {
  const router = useRouter();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "blue", // Active tab color
        tabBarStyle: {
          backgroundColor: '#E0EBF1', // Set the background color of the tab bar
          ...Platform.select({
            ios: {
              position: 'absolute', // For iOS, if you want a transparent background effect
            },
            default: {},
          }),
        },
        headerTitle: 'Nutrify', // Set a global header title
        headerStyle: {
          backgroundColor: '#CDD8DE',
        },
     
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tracker',
          tabBarIcon: ({ color }) => <AntDesign name="book" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Diary"
        options={{
          title: 'Diary',
          tabBarIcon: ({ color }) => <AntDesign name="book" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Recipes"
        options={{
          title: 'Recipes',
          tabBarIcon: ({ color }) => <AntDesign name="book" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ color }) => <AntDesign name="book" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <AntDesign name="user" size={28} color={color} />,
        }}
      />
      
    </Tabs>
  );
}
