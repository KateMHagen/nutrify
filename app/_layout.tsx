import { Stack } from "expo-router";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { useRouter } from "expo-router";
import { Session } from "@supabase/supabase-js";
import { MealsProvider } from "./context/MealsContext";

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      router.replace("/(tabs)");
    } else {
      router.replace("/App");
    }
  }, [session, router]);

  return (
    <MealsProvider>
      <Stack>
        {/* Main tabs */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Login and Signup */}
        <Stack.Screen name="App" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in/index" options={{ headerShown: false }} />
        <Stack.Screen name="sign-up/index" options={{ headerShown: false }} />
      </Stack>
    </MealsProvider>
  );
}
