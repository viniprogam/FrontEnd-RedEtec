import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ScrollView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { usePosts } from '../../context/PostContext'; // Ajuste o caminho conforme necessário

const colors = {
    primary: '#040915',
    secondary: '#1E2A38',
    background: '#F4F4F4',
    text: '#FFFFFF',
    border: '#8A8F9E'
};

export default function PostScreen() {
    const [postText, setPostText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const navigation = useNavigation();
    const { addPost } = usePosts(); // Usar o contexto

    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    alert('Desculpe, precisamos de permissão para acessar as fotos para que isso funcione!');
                }
            }
        })();
    }, []);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const handlePost = () => {
        if (!selectedImage) {
            Alert.alert('Erro', 'Por favor, selecione uma imagem.');
            return;
        }

        // Adicionar o post ao contexto
        addPost({
            text: postText.trim(), // Adiciona a legenda, se houver
            imageUri: selectedImage,
        });

        setPostText('');
        setSelectedImage(null);
        navigation.navigate('Home'); // Navegar para a HomeScreen
    };

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
                    <Text style={styles.titleLogo}>RedEtec</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <Text style={styles.title}>Criar Novo Post</Text>

                <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                    <Text style={styles.imagePickerText}>Escolher Imagem</Text>
                </TouchableOpacity>

                {selectedImage && (
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
                    </View>
                )}

                <TextInput
                    style={styles.textInput}
                    placeholder="Digite a legenda de seu post (opcional)"
                    value={postText}
                    onChangeText={setPostText}
                />

                <TouchableOpacity style={styles.postButton} onPress={handlePost}>
                    <Text style={styles.postButtonText}>Publicar</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    titleLogo: {
        textAlign: 'center',
        fontSize: 26,
        color: colors.text,
        fontWeight: '700',
        fontFamily: 'Noto Serif',
    },
    scrollViewContent: {
        flexGrow: 1,
        backgroundColor: colors.background,
        padding: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 20,
        textAlign: 'center',
    },
    textInput: {
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        backgroundColor: '#fff',
        textAlignVertical: 'top',
        height: 50,
        marginBottom: 20,
    },
    imagePickerButton: {
        backgroundColor: colors.primary,
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        alignItems: 'center',
    },
    imagePickerText: {
        color: colors.text,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
    },
    previewContainer: {
        marginBottom: 20,
        width: '100%',
        height: 380,
    },
    selectedImage: {
        width: '100%',
        height: '100%',
        borderRadius: 10,
    },
    postButton: {
        backgroundColor: colors.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    postButtonText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
});
