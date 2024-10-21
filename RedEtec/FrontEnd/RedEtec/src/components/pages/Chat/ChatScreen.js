import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    Image, 
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
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        setLoading(true);
        setError('');
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                throw new Error('Token não encontrado. Por favor, faça login novamente.');
            }

            const response = await axios.get('https://localhost:7140/api/Usuario/getcontatos', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log("Conversations fetched:", response.data); // Verifique os dados recebidos
            
            // Ajuste para acessar o array de conversas
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

    const renderItem = ({ item }) => {
        console.log("Rendering item:", item); // Adicione este log para ver o conteúdo do item

        return (
            <TouchableOpacity
                style={styles.item}
                onPress={() => handleSelectConversation(item)}
                activeOpacity={0.7} // Adiciona feedback visual ao toque
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

            <FlatList
                data={conversations} 
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
                contentContainerStyle={conversations.length === 0 ? styles.flatListEmpty : null}
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
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.secondary,
        padding: 10,
    },
    logoContainer: {
        flex: 1,
    },
    logo: {
        height: 40,
        width: 40,
    },
    titleContainer: {
        flex: 2,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        color: colors.text,
        fontWeight: 'bold',
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
});
