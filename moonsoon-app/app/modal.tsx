import { StatusBar } from 'expo-status-bar';
import { Text, Platform } from 'react-native';
import { supabase } from '../utils/supabase'

import { ScreenContent } from '@/components/ScreenContent';

export default function Modal() {
  return (
    <>
      <Text className="text-xl">Hello Modal</Text>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </>
  );
}
