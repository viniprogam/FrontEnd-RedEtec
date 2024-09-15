import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './src/components/navigation/AuthNavigator';
import { PostProvider } from './src/components/context/PostContext';
import { UserProfileProvider } from './src/components/context/UserProfileContext';

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar
        hidden={false}
        backgroundColor="#1E2A38"
        style="light"
      />
      <UserProfileProvider>
        <PostProvider>
          <AuthNavigator />
        </PostProvider>
      </UserProfileProvider>
    </NavigationContainer>
  );
}
