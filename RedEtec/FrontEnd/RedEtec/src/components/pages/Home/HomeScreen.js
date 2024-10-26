import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';

const colors = {
    primary: '#040915',
    secondary: '#1E2A38',
    background: '#F4F4F4',
    text: '#FFFFFF',
    border: '#8A8F9E'
};

export default function HomeScreen() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const nivelDeAcesso = 'comum';
    const userId = 2;


    /*FUNÇÃO PARA CARREGAR OS POST */
    const fetchPosts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://localhost:7140/api/Postagem/postagens', {
                timeout: 10000000
            });
            if (response.data && Array.isArray(response.data.$values)) {
                setPosts(response.data.$values);
            } else {
                console.error("Data is not an array:", response.data);
            }
            console.log(response.data);
        } catch (error) {
            console.error("Erro ao buscar postagens:", error);
        } finally {
            setLoading(false);
        }
    };

    /*FUNÇÃO PARA DELETAR POSTS*/
    const handlerDeletePost = async (postId) => {
        try {
            await axios.delete(`https://localhost:7140/api/Postagem/${postId}`)
            fetchPosts();
            Alert.alert("Postagem deletada com sucesso")
        } catch (error) {
            console.error("Erro ao deletar postagem:", error);
        }
    };


    /*CHAMA A FUNÇÃO DE CARREGAR POST TODA VEZ QUE A TELA HOMESCREEN É ACESSADA */
    useFocusEffect(
        useCallback(() => {
            fetchPosts();
        }, [])
    );

    /* VIEW DE RENDERIZAÇÃO DOS POST EXIBE UM LOADING NA TELA ATE CARREGAR OS POSTS */
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

            <ScrollView contentContainerStyle={styles.postContainer}>
                {posts.map((post, index) => (
                    <View key={index} style={styles.post}>
                        <View style={styles.postHeader}>
                            <Image
                                style={styles.userAvatar}
                                source={require('../../../../assets/perfil.png')} // Exibe a imagem ou um placeholder
                            />
                            <Text style={styles.userName}>{post.Nome_Usuario}</Text>
                        </View>
                        <Image
                            style={styles.imgPost}
                            source={{ uri: `https://localhost:7140/api/Postagem/imagem/${post.imageUrl}`}}
                        />
                        <View style={styles.postFooter}>
                            <Text style={styles.postDescription}>{post.Legenda_Postagem}</Text>

                            {(nivelDeAcesso === 'admin' || post.Id_Usuario === userId) && (
                                <TouchableOpacity onPress={() => handlerDeletePost(post.Id_Postagem)} style={styles.deleteButton}>
                                    {/* <Feather name="trash-2" size={24} color={colors.primary} /> */}
                                    <Text style={styles.deleteButtonText}>x</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))}
            </ScrollView>
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
    postContainer: {
        paddingVertical: 10,
    },
    post: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        borderColor: colors.border,
        borderWidth: 1,
        marginVertical: 10,
        marginHorizontal: 5,
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: colors.secondary,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    imgPost: {
        width: '100%',
        height: 400,
        backgroundColor: colors.border,
    },
    postFooter: {
        padding: 10,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    postDescription: {
        fontSize: 14,
        color: colors.primary,
    },
    deleteButton: {
        padding: 2,
        margin: 0
    },
    deleteButtonText: {
        color: colors.primary,
        fontSize: 24,
        fontWeight: 'bold'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
