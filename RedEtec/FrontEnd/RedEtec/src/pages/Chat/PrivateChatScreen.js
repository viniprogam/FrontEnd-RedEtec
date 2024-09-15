// src/pages/Chat/PrivateChatScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';

const colors = {
    primary: '#040915',
    secondary: '#1E2A38',
    background: '#F4F4F4',
    text: '#FFFFFF',
    border: '#8A8F9E'
};

export default function PrivateChatScreen({ route }) {
    const { conversation } = route.params;
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);

    const handleSendMessage = () => {
        if (message.trim()) {
            setMessages([...messages, { text: message, sender: 'user' }]);
            setMessage('');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.nameUser}>{conversation.name}</Text>
            </View>
            <ScrollView style={styles.messageContainer}>
                {messages.map((msg, index) => (
                    <View
                        key={index}
                        style={[styles.message, msg.sender === 'user' ? styles.userMessage : styles.otherMessage]}
                    >
                        <Text>{msg.text}</Text>
                    </View>
                ))}
            </ScrollView>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Digite uma mensagem"
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                    <Text style={styles.sendButtonText}>Enviar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        height: 96,
        fontSize: 24,
        backgroundColor: colors.secondary,
    },
    nameUser: {
        color: colors.text,
        fontFamily: 'Noto Serif',
        paddingLeft: 50,
        paddingVertical: 46,
        fontWeight: '600',
        fontSize: 26
    },
    messageContainer: {
        flex: 1,
        padding: 10,
    },
    message: {
        padding: 10,
        borderRadius: 5,
        marginVertical: 5,
    },
    userMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#d1ffd1',
    },
    otherMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#f1f1f1',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopColor: colors.border,
        borderTopWidth: 1,
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 10,
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: colors.primary,
        padding: 10,
        borderRadius: 20,
    },
    sendButtonText: {
        color: colors.text,
        fontSize: 16,
    },
});
