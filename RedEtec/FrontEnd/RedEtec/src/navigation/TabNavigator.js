import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Feather from 'react-native-vector-icons/Feather'; // Altere para importar Feather
import HomeScreen from '../pages/Home/HomeScreen';
import PostScreen from '../pages/Post/PostScreen';
import ProfileScreen from '../pages/Profile/ProfileScreen';
import ChatStackNavigator from './ChatStackNavigator';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ color, size }) => {
                    let iconName;

                    switch (route.name) {
                        case 'Home':
                            iconName = 'home'; // Ícone Feather para Home
                            break;
                        case 'Post':
                            iconName = 'edit-2'; // Ícone Feather para Post (equivalente ao pencil-box)
                            break;
                        case 'Chat':
                            iconName = 'message-circle'; // Ícone Feather para Chat
                            break;
                        case 'Profile':
                            iconName = 'user'; // Ícone Feather para Profile
                            break;
                        default:
                            iconName = 'circle'; // Ícone Feather padrão
                    }

                    return <Feather name={iconName} size={size} color={color} />; // Use Feather aqui
                },
                tabBarActiveTintColor: '#040915',
                tabBarInactiveTintColor: '#8A8F9E',
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Post" component={PostScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Chat" component={ChatStackNavigator} options={{ headerShown: false }} />
            <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        </Tab.Navigator>
    );
}
