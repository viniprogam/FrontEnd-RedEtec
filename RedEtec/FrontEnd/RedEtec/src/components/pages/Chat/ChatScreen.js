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
    text: '#E0E0E0',
    border: '#8A8F9E'
};

export default function ChatScreen() {
    const navigation = useNavigation();
    const [conversations, setConversations] = useState([]);
    const [groups, setGroups] = useState([]); // Inicializar como um array vazio
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [userProfiles, setUserProfiles] = useState({});

    useEffect(() => {
        fetchConversations();
        fetchGroups();
        console.log('Groups fetched:', groups);
    }, []);
    
    console.log(conversations)

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

            // Para cada postagem, vamos buscar o perfil do usuário
            response.data.forEach(async (conversation) => {
                await fetchUserProfile(conversation.Id_Usuario)
            });
        } catch (err) {
            console.error('Erro ao buscar conversas:', err);
            setError(err.message || 'Erro ao buscar conversas. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Função para buscar o perfil do usuário baseado no Id_Usuario
    const fetchUserProfile = async (userId) => {
        const response = await axios.get(`https://localhost:7140/api/Perfil/getperfil/${userId}`);
            if (response.data) {
                setUserProfiles((prevState) => ({
                    ...prevState,
                    [userId]: response.data, // Armazena os dados do perfil
                }));
            }
    };

    const fetchGroups = async () => {
        setLoading(true);
        setError('');
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get('https://localhost:7140/api/Grupo/curso', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const groupsData = Array.isArray(response.data) ? response.data : [response.data];
            setGroups(groupsData); 
        } catch (err) {
            console.error('Erro ao buscar grupos:', err);
            setError(err.message || 'Erro ao buscar grupos. Tente novamente mais tarde.');
        } finally {
            setLoading(false);
        }
    };
    

    console.log(groups);

    const handleSelectConversation = (conversation) => {
        navigation.navigate('PrivateChatScreen', { 
            userId: conversation.Id_Usuario,  
            userName: conversation.Nome_Usuario 
        });
    };

    const handleSelectGroup = (group) => {
        navigation.navigate('GroupChatScreen', {
            groupId: group.Id_Grupo, 
            groupName: group.Nome_Grupo 
        });
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchConversations();
    };

    const filteredConversations = conversations.filter(conversation => 
        conversation.Nome_Usuario?.toLowerCase().includes(searchText.toLowerCase())
    );

    const renderConversationItem = ({ item }) => {
        const userProfile = userProfiles[item.Id_Usuario]
        return (
            <TouchableOpacity
                style={styles.item}
                onPress={() => handleSelectConversation(item)}
                activeOpacity={0.7}
            >
                <Image 
                    source={{ uri: `https://localhost:7140/api/Postagem/imagem/${userProfile?.Foto_Perfil}` }} 
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
                    source={require('../../../../assets/grupo.png')}
                    style={styles.avatar} 
                />
                <View style={styles.itemDetails}>
                    <Text style={styles.itemText}>{item.Nome_Grupo}</Text>
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
    <Text style={styles.title}>
        REDE
        <Text style={styles.titleHighlight}>TEC</Text>
    </Text>
</View>
            </View>

            {error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : null}

            <TextInput
                style={styles.searchInput}
                placeholder="Pesquisar por conversa"
                placeholderTextColor={colors.text}
                value={searchText}
                onChangeText={setSearchText}
            />

            <Text style={styles.sectionTitle}>Conversas</Text>
            <FlatList
                style={styles.sectionConversations}
                data={filteredConversations} 
                keyExtractor={(item) => item.Id_Usuario ? item.Id_Usuario.toString() : Math.random().toString()} 
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

            <Text style={styles.sectionTitle}>Comunidade</Text>
            <FlatList
                data={groups}
                keyExtractor={(item) => item.Id_Grupo.toString()}
                renderItem={renderGroupItem}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Nenhum comunidade encontrado.</Text>
                    </View>
                }
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
    sectionConversations: {
        maxHeight: 400
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
        color: colors.primary,
    },
    flatListEmpty: {
        paddingBottom: 50,
    },
    searchInput: {
        backgroundColor: colors.primary,
        padding: 10,
        margin: 10,
        borderRadius: 5,
        color: colors.text,
    },
    searchInput: {
        backgroundColor: '#1A1A1A',
        padding: 10,
        margin: 10,
        borderRadius: 5,
        color: colors.text,
    },
    titleHighlight: {
        color: '#E0E0E0'
    }
});
