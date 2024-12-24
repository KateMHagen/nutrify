import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'expo-router';
import { useFonts } from 'expo-font';
import { OpenSans_400Regular, OpenSans_800ExtraBold } from '@expo-google-fonts/open-sans';
import { CustomButton } from './components/CustomButton';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  // Load fonts
  const [fontsLoaded] = useFonts({
    OpenSans_400Regular,
    OpenSans_800ExtraBold,
  }); 

  useEffect(() => {
    // Fetch the session on mount
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Redirect based on session state
  useEffect(() => {
    if (session?.user) {
      router.replace("/(tabs)");
    }
  }, [session, router]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // Render UI for unauthenticated users
  return (
    <View style={styles.container}>
      <Text style={styles.largeText}>NUTRIFY</Text>
      <CustomButton label="Sign in" onPress={() => router.push("/sign-in")} />
      <CustomButton
        label="Sign up"
        onPress={() => router.push("/sign-up")}
        style={{ paddingHorizontal: 28 }} 
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  smallText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'OpenSans_400Regular'
  },
  largeText: {
    fontSize: 40,
    fontFamily: 'OpenSans_800ExtraBold',
  },
});
