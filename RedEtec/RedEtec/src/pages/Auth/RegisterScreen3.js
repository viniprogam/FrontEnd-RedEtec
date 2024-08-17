import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity } from "react-native";
import { RadioButton } from 'react-native-paper';
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
    const navigation = useNavigation();
    const [sex, setSex] = useState('');

    const handleSignIn = () => {
        navigation.navigate('TabNavigator');
    };

    return (
        <View style={styles.container}>
            <View style={styles.imgContainer}>
                <Image
                    source={require('../../../assets/Logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputTitle}>Email</Text>
                    <TextInput
                        style={styles.input}
                        autoCapitalize="none"
                        placeholder="Digite seu e-mail"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputTitle}>CPF</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder="Digite seu CPF"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputTitle}>Data de Nascimento</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder="DD/MM/AAAA"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputTitle}>Sexo</Text>
                    <View style={styles.radioContainer}>
                        <TouchableOpacity
                            style={styles.radioButton}
                            onPress={() => setSex('Masculino')}
                        >
                            <RadioButton
                                value="Masculino"
                                status={sex === 'Masculino' ? 'checked' : 'unchecked'}
                            />
                            <Text style={styles.radioLabel}>Masculino</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.radioButton}
                            onPress={() => setSex('Feminino')}
                        >
                            <RadioButton
                                value="Feminino"
                                status={sex === 'Feminino' ? 'checked' : 'unchecked'}
                            />
                            <Text style={styles.radioLabel}>Feminino</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.radioButton}
                            onPress={() => setSex('Outro')}
                        >
                            <RadioButton
                                value="Outro"
                                status={sex === 'Outro' ? 'checked' : 'unchecked'}
                            />
                            <Text style={styles.radioLabel}>Outro</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={handleSignIn}>
                    <Text style={styles.buttonText}>Finalizar</Text>
                </TouchableOpacity>
            </View>
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
    input: {
        height: 40,
        fontSize: 16,
        paddingHorizontal: 8,
        borderBottomColor: colors.primary,
        borderBottomWidth: 1,
    },
    radioContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    radioButton: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    radioLabel: {
        marginLeft: 8,
        fontSize: 16,
        color: colors.primary,
    },
    buttonContainer: {
        alignItems: 'center',
        marginTop: 30,
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: 4,
        width: '60%',
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: colors.text,
        fontWeight: '600',
        fontSize: 16,
    },
});
