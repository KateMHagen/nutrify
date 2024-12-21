import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://kkiuuthixhzukosqkffm.supabase.co"
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtraXV1dGhpeGh6dWtvc3FrZmZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3MzYxMTcsImV4cCI6MjA1MDMxMjExN30.R1A0JI8_AcSewDFpEk7M1MY59AjULkGMxzOH-goVQCA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export default supabase