import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator } from "react-native";
import axios from 'axios'; // Certifique-se de ter o axios instalado

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

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get('https://localhost:44315/api/Postagem/postagens');
                setPosts(response.data);
                console.log(response.data)
            } catch (error) {
                console.error("Erro ao buscar postagens:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);


    if (loading) {
        return <ActivityIndicator size="large" color={colors.primary} />;
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
                            source={{ uri: `https://localhost:44315/api/Postagem/imagem/${post.imageUrl}`}}
                        />
                        <View style={styles.postFooter}>
                            <Text style={styles.postDescription}>{post.legenda_Postagem}</Text>
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
        top:40,
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
        marginHorizontal: 5
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
        backgroundColor: colors.border
    },
    postFooter: {
        padding: 10,
    },
    postDescription: {
        fontSize: 14,
        color: colors.primary,
    }
});