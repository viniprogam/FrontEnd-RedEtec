// src/pages/Chat/PrivateChatScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    TouchableOpacity, 
    FlatList, 
    Image, 
    ActivityIndicator, 
    KeyboardAvoidingView, 
    Platform, 
    Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const colors = {
    primary: '#040915',
    secondary: '#1E2A38',
    background: '#F4F4F4',
    text: '#FFFFFF',
    border: '#8A8F9E',
    messageUser: '#d1ffd1',
    messageOther: '#f1f1f1',
};

export default function PrivateChatScreen({ route, navigation }) {
    const { userId, userName } = route.params; // Recebe os parâmetros passados
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]); // Inicializa como vazio
    const [loading, setLoading] = useState(false); // Inicializa como falso
    const [error, setError] = useState('');
    const flatListRef = useRef(null);


    // Removido: Função fetchMessages e useEffect correspondente

    // Função para enviar uma nova mensagem
    const handleSendMessage = async () => {
        if (message.trim()) {
            try {
                setLoading(true); // Opcional: Mostrar indicador de envio

                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    throw new Error('Token não encontrado. Por favor, faça login novamente.');
                }

            

                // Ajuste a URL conforme seu ambiente
                const API_URL = Platform.OS === 'android' 
                    ? 'http://10.0.2.2:7140/api/chat/messages'
                    : 'http://localhost:7140/api/chat/messages';

                // Enviar a mensagem para a API
                const response = await axios.post(API_URL, {
                    senderId: token,
                    receiverId: userId,
                    text: message.trim()
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Atualizar a lista de mensagens com a nova mensagem
                setMessages([...messages, response.data]);
                setMessage('');

                // Scroll automático para a última mensagem
                setTimeout(() => {
                    flatListRef.current.scrollToEnd({ animated: true });
                }, 100);

            } catch (err) {
                console.error('Erro ao enviar mensagem:', err);
                Alert.alert('Erro', 'Não foi possível enviar a mensagem. Tente novamente.');
            } finally {
                setLoading(false); // Ocultar indicador de envio
            }
        }
    };

    // Renderização de cada mensagem
    const renderItem = ({ item }) => {
        const isUser = item.senderId === userId; // Verifica se a mensagem foi enviada pelo outro usuário

        return (
            <View style={[styles.messageContainer, isUser ? styles.otherMessage : styles.userMessage]}>
                <Text style={isUser ? styles.otherText : styles.userText}>
                    {item.text}
                </Text>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={90}
        >
            {/* Cabeçalho */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Image 
                    source={require('../../../../assets/perfil.png')} // Imagem de perfil padrão
                    style={styles.avatarHeader} 
                />
                <Text style={styles.nameUser}>{userName}</Text>
            </View>

            {/* Lista de Mensagens */}
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.messagesList}
                onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
                onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Inicie a conversa enviando uma mensagem.</Text>
                    </View>
                }
            />

            {/* Input de Mensagem */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Digite uma mensagem"
                    placeholderTextColor="#8A8F9E"
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                    <Ionicons name="send" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Indicador de Envio */}
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        height: 60,
        backgroundColor: colors.secondary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    backButton: {
        marginRight: 10,
    },
    avatarHeader: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    nameUser: {
        marginLeft: 10,
        fontSize: 18,
        color: colors.text,
        fontWeight: '700',
    },
    messagesList: {
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    messageContainer: {
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
        maxWidth: '80%',
    },
    userMessage: {
        backgroundColor: colors.messageUser,
        alignSelf: 'flex-end',
    },
    otherMessage: {
        backgroundColor: colors.messageOther,
        alignSelf: 'flex-start',
    },
    userText: {
        color: colors.primary,
    },
    otherText: {
        color: '#000',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopColor: colors.border,
        borderTopWidth: 0.5,
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 15,
        fontSize: 16,
        color: colors.primary,
    },
    sendButton: {
        marginLeft: 10,
        padding: 10,
        borderRadius: 20,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#8A8F9E',
    },
});
