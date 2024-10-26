import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    Image, 
    ActivityIndicator, 
    RefreshControl, 
    TextInput 
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
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState(''); // Estado para o texto de pesquisa

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        setLoading(true);
        setError('');
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get('https://localhost:7140/api/Usuario/getcontatos', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            setConversations(response.data.$values || []); 
        } catch (err) {
            console.error('Erro ao buscar conversas:', err);
            setError(err.message || 'Erro ao buscar conversas. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleSelectConversation = (conversation) => {
        navigation.navigate('PrivateChatScreen', { 
            userId: conversation.Id_Usuario,  
            userName: conversation.Nome_Usuario 
        });
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchConversations();
    };

    // Função para filtrar as conversas com base no texto de pesquisa
    const filteredConversations = conversations.filter(conversation => 
        conversation.Nome_Usuario?.toLowerCase().includes(searchText.toLowerCase())
    );

    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={styles.item}
                onPress={() => handleSelectConversation(item)}
                activeOpacity={0.7}
            >
                <Image 
                    source={require('../../../../assets/perfil.png')} 
                    style={styles.avatar} 
                />
                <View style={styles.itemDetails}>
                    <Text style={styles.itemText}>{item.Nome_Usuario || 'Usuário desconhecido'}</Text>
                </View>
            </TouchableOpacity>
        );
    };

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

            {error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            <TextInput
                style={styles.searchInput}
                placeholder="Pesquisar por nome"
                placeholderTextColor={colors.text}
                value={searchText}
                onChangeText={setSearchText}
            />

            <FlatList
                data={filteredConversations} 
                keyExtractor={(item) => item.id_Usuario ? item.id_Usuario.toString() : Math.random().toString()} 
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
    item: {
        flexDirection: 'row',
        padding: 15,
        borderBottomColor: colors.border,
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    itemDetails: {
        flex: 1,
    },
    itemText: {
        fontSize: 16,
        color: colors.primary
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        padding: 15,
        backgroundColor: colors.primary,
    },
    errorText: {
        color: colors.text,
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        color: colors.text,
        fontSize: 16,
        textAlign: 'center',
    },
    searchInput: {
        height: 40,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 5,
        margin: 10,
        paddingHorizontal: 10,
        color: colors.primary,
    },
});
