import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import Icon from 'react-native-vector-icons/Feather'; // Verifique se está instalado corretamente
import { useNavigation } from "@react-navigation/native";
import { login } from '../../services/api.js';
import { useUserProfile } from "../../context/UserProfileContext.js";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function LoginScreen() {
    const navigation = useNavigation();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const { setProfile } = useUserProfile();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignIn = async () => {
        setLoading(true);
        setError('');
        try {
            await login(username, password);
            setProfile
            navigation.navigate('TabNavigator');
        } catch (err) {
            setError('Dados inválidos. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
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
                <View style={styles.inputContainer}>
                    <Text style={styles.inputTitle}>Nome de Usuário</Text>
                    <TextInput
                        style={styles.inputCpf}
                        autoCorrect={false}
                        placeholder="Digite seu nome de usuário"
                        value={username}
                        onChangeText={setUsername}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputTitle}>Senha</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            secureTextEntry={!passwordVisible}
                            placeholder="Digite sua senha"
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity
                            onPress={() => setPasswordVisible(!passwordVisible)}
                            style={styles.eyeIcon}
                        >
                            <Icon
                                name={passwordVisible ? "eye-off" : "eye"}
                                size={20}
                                color="#040915"
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSignIn} disabled={loading}>
                {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                ) : (
                    <Text style={styles.buttonText}>Entrar</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.signupContainer} onPress={() => navigation.navigate('RegisterScreen')}>
                <Text style={styles.signupText}>
                    Não possui conta ainda? <Text style={styles.signupTextHighlight}>Cadastrar</Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: 'white'
    },
    imgContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
        marginTop: 60,
        marginBottom: 40,
    },
    logo: {
        width: 200,
        height: 200,
    },
    form: {
        marginHorizontal: 30,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputTitle: {
        color: '#040915',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 6,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: '#040915',
        borderBottomWidth: 1,
    },
    input: {
        height: 40,
        fontSize: 16,
        paddingHorizontal: 8,
    },
    inputCpf: {
        height: 40,
        fontSize: 16,
        paddingHorizontal: 8,
        borderBottomColor: '#040915',
        borderBottomWidth: 1,
    },
    eyeIcon: {
        padding: 8,
        justifyContent: 'center',
    },
    button: {
        backgroundColor: '#040915',
        borderRadius: 4,
        width: '85%',
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 16,
    },
    signupContainer: {
        alignSelf: 'center',
        marginTop: 20,
    },
    signupText: {
        color: '#414959',
        fontSize: 14,
    },
    signupTextHighlight: {
        fontWeight: '700',
        color: '#040915',
    },
    errorText: {
        color: 'red',
        marginTop: 10,
        textAlign: 'center',
    },
});
