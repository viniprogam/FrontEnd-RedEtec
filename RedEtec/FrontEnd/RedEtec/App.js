import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './src/navigation/AuthNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar
        hidden={false}
        backgroundColor="#1E2A38"
        style="light"
      />
      <AuthNavigator />
    </NavigationContainer>
  );
}
