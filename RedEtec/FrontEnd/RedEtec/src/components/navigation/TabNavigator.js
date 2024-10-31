import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../../components/pages/Home/HomeScreen';
import PostScreen from '../../components/pages/Post/PostScreen';
import ProfileScreen from '../../components/pages/Profile/ProfileScreen';
import ChatStackNavigator from './ChatStackNavigator';

import { Ionicons } from '@expo/vector-icons';

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
                            iconName = 'add-circle'; // Ícone Feather para Post (equivalente ao pencil-box)
                            break;
                        case 'Chat':
                            iconName = 'chatbubbles'; // Ícone Feather para Chat
                            break;
                        case 'Profile':
                            iconName = 'cog'; // Ícone Feather para Profile
                            break;
                        default:
                            iconName = 'ellipse'; // Ícone Feather padrão
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
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
