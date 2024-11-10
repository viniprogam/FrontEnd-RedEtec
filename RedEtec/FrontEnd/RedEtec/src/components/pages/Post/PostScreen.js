import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert, ScrollView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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

export default function PostScreen() {

    const [postText, setPostText] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const navigation = useNavigation();
    const [file, setFile] = useState(null);

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

    const pickFileWeb = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (event) => {
            const selectedFile = event.target.files[0];
            setFile({
            uri: URL.createObjectURL(selectedFile),
            name: selectedFile.name,
            type: selectedFile.type,
            file: selectedFile, // Adicionando o arquivo ao estado
        });
        // Alert.alert('Arquivo Selecionado', selectedFile.name);
        };
        input.click(); // Simula o clique no input
    };

    const handlePost = async () => {
        if (!postText.trim() && !file) {
            Alert.alert('Erro', 'Por favor, insira um texto ou selecione uma imagem.');
            return;
        }

        const formData = new FormData();
        formData.append('Legenda_Postagem', postText.trim());
        if (file) {
            formData.append('file', file.file);
        }

        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                Alert.alert('Erro', 'Token de autenticação não encontrado.');
                return;
            }

            const response = await axios.post('https://localhost:7140/api/Postagem', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
            });

            if (response.status === 201) {
                Alert.alert('Sucesso', 'Postagem criada com sucesso!');
                setPostText('');
                setSelectedImage(null);
                setFile(null);
                navigation.navigate('Home'); // Navegar para a HomeScreen
            } else {
                Alert.alert('Erro', 'Houve um problema ao criar a postagem.');
            }
        } catch (error) {
            console.error('Erro ao criar a postagem:', error);
            Alert.alert('Erro', 'Houve um problema ao criar a postagem.');
        }
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
                    <Text style={styles.title}>RedEtec</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <Text style={styles.subTitle}>Criar Novo Post</Text>

                <TouchableOpacity style={styles.imagePickerButton} onPress={pickFileWeb}>
                    <Text style={styles.imagePickerText}>Escolher Imagem</Text>
                </TouchableOpacity>

                {file && (
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: file.uri }} style={styles.selectedImage} />
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
    title: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 26,
        color: colors.text,
        fontWeight: '700',
        fontFamily: 'Noto Serif',
    },
    subTitle: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 26,
        fontWeight: 'bold',
    },
    scrollViewContent: {
        flexGrow: 1,
        backgroundColor: colors.background,
        padding: 10,
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