// RegisterScreen.js
import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function RegisterScreen() {
    const [Nome_Usuario, setNome_Usuario] = useState('');
    const navigation = useNavigation();

    const handleNext = () => {
        // Navega para a próxima tela e passa o nome de usuário como parâmetro
        navigation.navigate('RegisterScreen2', { Nome_Usuario });
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
                    <Text style={styles.title}>Criar nome de usuário</Text>
                    <Text style={styles.text}>Escolha um nome de usuário para sua nova conta.</Text>
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputTitle}>Nome do usuário</Text>
                    <TextInput
                        style={styles.input}
                        autoCapitalize="none"
                        placeholder="Digite seu nome de usuário"
                        value={Nome_Usuario}
                        onChangeText={setNome_Usuario}
                    />
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
        backgroundColor: colors.background
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
        fontSize: 10,
        fontWeight: '400',
        marginBottom: 10,
    },
    form: {
        marginHorizontal: 30,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputTitle: {
        color: colors.primary,
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 6,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: colors.primary,
        borderBottomWidth: 1,
    },
    input: {
        height: 40,
        fontSize: 16,
        paddingHorizontal: 8,
        color: colors.secondary,
        borderBottomColor: colors.primary,
        borderBottomWidth: 1,
    },
    eyeIcon: {
        padding: 8,
        justifyContent: 'center',
    },
    button: {
        backgroundColor: colors.primary,
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