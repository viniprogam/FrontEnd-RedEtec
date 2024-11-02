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
    const [groups, setGroups] = useState([]); // Estado para grupos
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        fetchConversations();
        fetchGroups(); // Função para buscar grupos
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
            setConversations(response.data); 
        } catch (err) {
            console.error('Erro ao buscar conversas:', err);
            setError(err.message || 'Erro ao buscar conversas. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchGroups = async () => {
        setLoading(true);
        setError('');
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get('https://localhost:7140/api/Grupo/getgrupos', { // URL do seu endpoint de grupos
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setGroups(response.data); // Armazena os grupos no estado
        } catch (err) {
            console.error('Erro ao buscar grupos:', err);
            setError(err.message || 'Erro ao buscar grupos. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectConversation = (conversation) => {
        navigation.navigate('PrivateChatScreen', { 
            userId: conversation.Id_Usuario,  
            userName: conversation.Nome_Usuario 
        });
    };

    const handleSelectGroup = (group) => {
        navigation.navigate('GroupChatScreen', { // Navega para a tela do grupo
            groupId: group.Id_Grupo, 
            groupName: group.Nome_Grupo 
        });
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchConversations();
        fetchGroups(); // Atualiza os grupos também
    };

    const filteredConversations = conversations.filter(conversation => 
        conversation.Nome_Usuario?.toLowerCase().includes(searchText.toLowerCase())
    );

    const filteredGroups = groups.filter(group => 
        group.Nome_Grupo?.toLowerCase().includes(searchText.toLowerCase())
    );

    const renderConversationItem = ({ item }) => {
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

    const renderGroupItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={styles.item}
                onPress={() => handleSelectGroup(item)}
                activeOpacity={0.7}
            >
                <Image 
                    source={require('../../../../assets/grupo.png')} // Adicione uma imagem para o grupo
                    style={styles.avatar} 
                />
                <View style={styles.itemDetails}>
                    <Text style={styles.itemText}>{item.Nome_Grupo || 'Grupo desconhecido'}</Text>
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
                placeholder="Pesquisar por nome ou grupo"
                placeholderTextColor={colors.text}
                value={searchText}
                onChangeText={setSearchText}
            />

            <Text style={styles.sectionTitle}>Conversas</Text>
            <FlatList
                data={filteredConversations} 
                keyExtractor={(item) => item.id_Usuario ? item.id_Usuario.toString() : Math.random().toString()} 
                renderItem={renderConversationItem}
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

            <Text style={styles.sectionTitle}>Grupos</Text>
            <FlatList
                data={filteredGroups} 
                keyExtractor={(item) => item.id_Grupo ? item.id_Grupo.toString() : Math.random().toString()} 
                renderItem={renderGroupItem}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Nenhum grupo encontrado.</Text>
                    </View>
                }
                contentContainerStyle={filteredGroups.length === 0 ? styles.flatListEmpty : null}
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
    sectionTitle: {
        fontSize: 20,
        color: colors.primary,
        marginVertical: 10,
        marginLeft: 15,
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
    },
    searchInput: {
        height: 40,
        borderColor: colors.border,
        borderWidth: 1,
        margin: 15,
        paddingHorizontal: 10,
        borderRadius: 5,
        color: colors.text,
    },
});

