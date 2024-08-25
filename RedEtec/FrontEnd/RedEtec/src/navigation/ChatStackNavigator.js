import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ChatScreen from '../pages/Chat/ChatScreen';
import GroupChatScreen from '../pages/Chat/GroupChatScreen';
import PrivateChatScreen from '../pages/Chat/PrivateChatScreen';

const Stack = createNativeStackNavigator();

export default function ChatStackNavigator() {
    return (
        <Stack.Navigator initialRouteName="ChatScreen">
            <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: false }} />
            <Stack.Screen name="GroupChatScreen" component={GroupChatScreen} options={{ headerShown: false }} />
            <Stack.Screen name="PrivateChatScreen" component={PrivateChatScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}
