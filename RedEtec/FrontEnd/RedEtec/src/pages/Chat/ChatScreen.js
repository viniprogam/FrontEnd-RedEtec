import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const mockConversations = [
    { id: '1', name: 'Grupo de Amigos', type: 'group' },
    { id: '2', name: 'João', type: 'private' },
    { id: '3', name: 'Maria', type: 'private' },
];

export default function ChatScreen() {
    const navigation = useNavigation();

    const handleSelectConversation = (conversation) => {
        if (conversation.type === 'group') {
            navigation.navigate('GroupChatScreen', { conversation });
        } else {
            navigation.navigate('PrivateChatScreen', { conversation });
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={mockConversations}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => handleSelectConversation(item)}
                    >
                        <Text style={styles.itemText}>{item.name}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4F4F4',
    },
    item: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    itemText: {
        fontSize: 18,
    },
});
