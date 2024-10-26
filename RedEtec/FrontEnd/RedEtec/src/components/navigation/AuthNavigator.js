// src/navigation/AuthNavigator.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SingInToken from '../pages/Auth/SingInToken';
import LoginScreen from '../pages/Auth/LoginScreen';
import RegisterScreen from '../pages/Auth/RegisterScreen';
import RegisterScreen2 from '../pages/Auth/RegisterScreeen2';
import RegisterScreen3 from '../pages/Auth/RegisterScreen3';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
    return (
        <Stack.Navigator>
            {/* <Stack.Screen name="SingInToken" component={SingInToken} options={{ headerShown: false }} /> */}
            
            <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} options={{ headerShown: false }} />
            <Stack.Screen name="RegisterScreen2" component={RegisterScreen2} options={{ headerShown: false }} />
            <Stack.Screen name="RegisterScreen3" component={RegisterScreen3} options={{ headerShown: false }} />
            <Stack.Screen name="TabNavigator" component={TabNavigator} options={{ headerShown: false }} />
            
        </Stack.Navigator>
    );
}
