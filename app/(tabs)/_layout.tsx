import { Tabs } from 'expo-router';
import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { BlurView } from 'expo-blur';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#9D5FE8", // Purple active color
        tabBarInactiveTintColor: "#C1B7E3", // Faded purple for inactive tabs
        headerShown: true, // Hides the header
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tracker',
          tabBarIcon: ({ color }) => <AntDesign name="book" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Diary"
        options={{
          title: 'Diary',
          tabBarIcon: ({ color }) => <AntDesign name="book" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => <AntDesign name="book" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="Account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <AntDesign name="user" size={26} color={color} />,
        }}
      />
    </Tabs>
  );
}

// Custom Tab Bar Component
function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.shadowContainer}>
      <BlurView intensity={40} tint="light" style={styles.tabBarContainer}>
        <View style={styles.tabBarContent}>
          {state.routes.map((route: { key: string | number; name: React.Key | null | undefined; }, index: any) => {
            const { options } = descriptors[route.key];
            const iconName =
              route.name === 'index'
                ? 'book'
                : route.name === 'Diary'
                ? 'book'
                : route.name === 'Progress'
                ? 'book'
                : 'user';

            const isFocused = state.index === index;
            const color = isFocused ? '#9D5FE8' : '#C1B7E3';

            return (
              <AntDesign
                key={route.name}
                name={iconName}
                size={26}
                color={color}
                onPress={() => navigation.navigate(route.name)}
                style={styles.icon}
              />
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  shadowContainer: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    right: 15,
    height: 80,
    borderRadius: 25,
    
    shadowColor: '#AC9DD8',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.3, 
    shadowRadius: 12, 
    elevation: 10,
  },
  tabBarContainer: {
    flex: 1,
    borderRadius: 25,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Slightly transparent
  },
  tabBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    paddingHorizontal: 20,
  },
  icon: {
    padding: 10,
  },
});
