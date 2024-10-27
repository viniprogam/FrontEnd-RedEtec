import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from "@react-navigation/native";

export default function RegisterScreenImg() {
    const navigation = useNavigation();
    const route = useRoute();
    const { Nome_Usuario, Senha_Usuario } = route.params;
    const [ProfileImage, setProfileImage] = useState({ profileImage: null });

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setProfileImage(prevProfile => ({
                ...prevProfile,
                profileImage: result.assets[0].uri
            }));
        }
    };

    const handleNext = () => {
        navigation.navigate('RegisterScreen3', { Nome_Usuario, Senha_Usuario, ProfileImage });
    };

    return (
        <View style={styles.container}>
            <View style={styles.imgContainer}>
                <Image
                    source={require('../../../../assets/Logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>
            
            <View style={styles.form}>

            <View style={styles.textContainer}>
                    <Text style={styles.title}>Foto de perfil</Text>
                    <Text style={styles.text}>Escolha uma foto de perfil para sua nova conta.</Text>
                </View>

                <View style={styles.inputContainer}>
                    <TouchableOpacity onPress={pickImage}>
                        <Image
                            style={styles.profileImage}
                            source={
                                ProfileImage.profileImage
                                    ? { uri: ProfileImage.profileImage }
                                    : require('../../../../assets/perfil.png')
                            }
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleNext}>
                    <Text style={styles.buttonText}>Avançar</Text>
            </TouchableOpacity>
        </View>
    );
}

const colors = {
    primary: '#040915',
    secondary: '#1E2A38',
    background: '#F4F4F4',
    text: '#FFFFFF',
    border: '#8A8F9E'
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: colors.background,
    },
    imgContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
        marginTop: 20,
        marginBottom: 10,
    },
    logo: {
        width: 150,
        height: 150,
    },
    textContainer: {
        justifyContent: 'center',
        marginBottom: 30,
    },
    title: {
        color: colors.primary,
        fontSize: 30,
        fontWeight: '800',
        marginBottom: 10,
    },
    text: {
        color: colors.border,
        fontSize: 12,
        fontWeight: '400',
        marginBottom: 10,
    },
    form: {
        display: 'flex',
        alignItems: 'center',
        marginHorizontal: 30,
    },
    profileImage: {
        padding: 20,
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: colors.border,
    },
    button: {
        backgroundColor: colors.primary,
        marginTop: 20,
        borderRadius: 4,
        width: '85%',
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    buttonText: {
        color: colors.text,
        fontWeight: '600',
        fontSize: 16,
    },
});
