// src/pages/Post/PostScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

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

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setSelectedImage(result.uri);
        }
    };

    const handlePost = () => {
        if (postText.trim() === '' || !selectedImage) {
            Alert.alert('Erro', 'Por favor, insira uma frase e selecione uma imagem.');
            return;
        }

        // Aqui você pode adicionar a lógica para enviar o post para o backend
        Alert.alert('Postagem', 'Seu post foi criado com sucesso!');
        setPostText('');
        setSelectedImage(null);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Criar Novo Post</Text>

            <TextInput
                style={styles.textInput}
                placeholder="Digite sua frase aqui..."
                value={postText}
                onChangeText={setPostText}
            />

            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                <Text style={styles.imagePickerText}>Escolher Imagem</Text>
            </TouchableOpacity>

            {selectedImage && (
                <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            )}

            <TouchableOpacity style={styles.postButton} onPress={handlePost}>
                <Text style={styles.postButtonText}>Publicar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 20,
    },
    textInput: {
        height: 100,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    imagePickerButton: {
        backgroundColor: colors.primary,
        padding: 10,
        borderRadius: 10,
        marginBottom: 20,
    },
    imagePickerText: {
        color: colors.text,
        textAlign: 'center',
    },
    selectedImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 20,
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
