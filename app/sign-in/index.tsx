import supabase from '@/lib/supabase';
import { Input } from '@rneui/base';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CustomButton } from "../components/CustomButton";

export default function SignIn() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    async function signInWithEmail() {
        setLoading(true)
        const { error, data: {session}, } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });
    
        if(session) {
          router.push("/(tabs)");
        }
        
    
        // if (error) Alert.alert(error.message)
        setLoading(false)
      }
  return (
    <View style={styles.container}>
      <View style={styles.input}>
      <Text style={styles.largeText}>SIGN IN</Text>
        <View style={[styles.verticallySpaced, styles.mt20]}>
        <Input
          label="Email"
          leftIcon={{ type: 'font-awesome', name: 'envelope' }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
      />
        </View>
        <View style={styles.verticallySpaced}>
          <Input
            label="Password"
            leftIcon={{ type: 'font-awesome', name: 'lock' }}
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            placeholder="Password"
            autoCapitalize={'none'}
          />
        </View>
        <View style={[styles.verticallySpaced, styles.mt20]}>
          <CustomButton label="Sign in" onPress={() => signInWithEmail()} />
          <CustomButton
            label="Sign up"
            onPress={() => router.push("/sign-up")}
            style={{ paddingHorizontal: 28 }} // Override padding if needed
          />
          
        </View>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 40,
      padding: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
  
    input: {
      width: '70%',
    },
    largeText: {
      fontSize: 40,
      fontFamily: 'OpenSans_800ExtraBold',
    },
    verticallySpaced: {
      paddingTop: 4,
      paddingBottom: 4,
      alignSelf: 'stretch',
    },
    mt20: {
      marginTop: 20,
    },
  })
