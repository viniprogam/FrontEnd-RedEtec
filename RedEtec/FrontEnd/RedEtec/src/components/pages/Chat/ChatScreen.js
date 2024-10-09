// src/pages/Chat/ChatScreen.js

import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    Image, 
    TextInput, 
    ActivityIndicator, 
    RefreshControl 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const colors = {
    primary: '#040915',
    secondary: '#1E2A38',
    background: '#F4F4F4',
    text: '#FFFFFF',
    border: '#8A8F9E'
};

export default function ChatScreen() {
    const navigation = useNavigation();
    const [searchText, setSearchText] = useState('');
    const [conversations, setConversations] = useState([]);
    const [filteredConversations, setFilteredConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState([]);

    // Novas variáveis de estado para usuário selecionado
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [selectedUserName, setSelectedUserName] = useState('');

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        filterConversations();
    }, [searchText, conversations]);

    useEffect(() => {
        console.log('IDs Selecionados:', selectedUserIds);
    }, [selectedUserIds]);

    const fetchConversations = async () => {
        setLoading(true);
        setError('');
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                throw new Error('Token não encontrado. Por favor, faça login novamente.');
            }
            console.log('Token:', token);

            const response = await axios.get('https://localhost:7140/api/usuario/getcontatos', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Resposta da API:', response.data);

            setConversations(response.data);
        } catch (err) {
            console.error('Erro ao buscar conversas:', err);
            setError('Erro ao buscar conversas. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const filterConversations = () => {
        if (searchText.trim() === '') {
            setFilteredConversations(conversations);
        } else {
            const filtered = conversations.filter(conversation =>
                conversation.nome_Usuario.toLowerCase().includes(searchText.toLowerCase())
            );
            setFilteredConversations(filtered);
        }
    };

    const handleSelectConversation = (conversation) => {
        // Verifica se o ID já está no array para evitar duplicatas
        if (!selectedUserIds.includes(conversation.id_Usuario)) {
            setSelectedUserIds([...selectedUserIds, conversation.id_Usuario]);
        }

        // Define as variáveis de estado para o usuário selecionado
        setSelectedUserId(conversation.id_Usuario);
        setSelectedUserName(conversation.nome_Usuario);

        // Navega para PrivateChatScreen passando userId e userName
        navigation.navigate('PrivateChatScreen', { 
            userId: conversation.id_Usuario, 
            userName: conversation.nome_Usuario 
        });
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchConversations();
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.item}
            onPress={() => handleSelectConversation(item)}
        >
            <Image 
                source={require('../../../../assets/perfil.png')} 
                style={styles.avatar} 
            />
            <Text style={styles.itemText}>{item.nome_Usuario}</Text>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../../../assets/LogoWhite.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>RedEtec</Text>
                </View>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Pesquisar conversas..."
                    placeholderTextColor="#8A8F9E"
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>

            {error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            <FlatList
                data={filteredConversations}
                keyExtractor={(item) => item.id_Usuario.toString()}
                renderItem={renderItem}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Nenhuma conversa encontrada.</Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={filteredConversations.length === 0 ? styles.flatListEmpty : null}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerContainer: {
        height: 110,
        backgroundColor: colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        position: 'absolute',
        top: 40,
        left: 20,
    },
    logo: {
        width: 50,
        height: 50,
    },
    titleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 26,
        color: colors.text,
        fontWeight: '700',
        fontFamily: 'Noto Serif',
    },
    searchContainer: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: '#F4F4F4',
    },
    searchInput: {
        backgroundColor: '#FFFFFF',
        padding: 10,
        borderRadius: 10,
        borderColor: colors.border,
        borderWidth: 1,
        fontSize: 16,
        color: colors.primary,
    },
    item: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 15,
    },
    itemText: {
        fontSize: 18,
        color: colors.primary,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#8A8F9E',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    errorContainer: {
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
    },
    flatListEmpty: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
