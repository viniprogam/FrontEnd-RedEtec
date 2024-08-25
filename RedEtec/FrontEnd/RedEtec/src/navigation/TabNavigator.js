import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
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
                            iconName = 'home';
                            break;
                        case 'Post':
                            iconName = 'pencil-box';
                            break;
                        case 'Chat':
                            iconName = 'chat';
                            break;
                        case 'Profile':
                            iconName = 'account';
                            break;
                        default:
                            iconName = 'circle';
                    }

                    return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
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
