import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RadioButton } from 'react-native-paper';
import axios from 'axios';

export default function RegisterScreen3() {
    const [Email_Usuario, setEmail_Usuario] = useState('');
    const [Cidade_Usuario, setCidade_Usuario] = useState('');
    const [CPF_Usuario, setCPF_Usuario] = useState('');
    const [Data_Nascimento_Usuario, setData_Nascimento_Usuario] = useState('');
    const [Nivel_Acesso, setNivel_Acesso] = useState(5);
    const [Sexo_Usuario, setSexo_Usuario] = useState('');

    const navigation = useNavigation();
    const route = useRoute();
    const { Nome_Usuario, Senha_Usuario } = route.params;

    const formatDate = (date) => {
        const [day, month, year] = date.split('/');
        return `${year}-${month}-${day}`;
    };

    const handleRegister = async () => {
        try {
            const formattedDate = formatDate(Data_Nascimento_Usuario);
            console.log({
                Nome_Usuario,
                CPF_Usuario,
                Data_Nascimento_Usuario: formattedDate,
                Cidade_Usuario,
                Email_Usuario,
                Senha_Usuario,
                Sexo_Usuario,
                Nivel_Acesso
            });
            const response = await axios.post('https://localhost:44315/api/Usuario', {
                Nome_Usuario,
                CPF_Usuario,
                Data_Nascimento_Usuario: formattedDate,
                Cidade_Usuario,
                Email_Usuario,
                Senha_Usuario,
                Sexo_Usuario,
                Nivel_Acesso
            });

            console.log('Cadastro bem-sucedido:', response.data);
            Alert.alert("Sucesso", "Cadastro realizado com sucesso!");
            navigation.navigate('TabNavigator'); // Navega para HomeScreen após o cadastro
        } catch (error) {
            console.error('Erro ao registrar:', error);
            const errorMessage = error.response?.data?.message || 'Não foi possível realizar o cadastro. Tente novamente.';
            Alert.alert("Erro", errorMessage);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.form}>
                {/* Campos de entrada */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputTitle}>Email</Text>
                    <TextInput
                        style={styles.input}
                        autoCapitalize="none"
                        placeholder="Digite seu e-mail"
                        value={Email_Usuario}
                        onChangeText={setEmail_Usuario}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputTitle}>Cidade</Text>
                    <TextInput
                        style={styles.input}
                        autoCapitalize="none"
                        placeholder="Digite sua cidade"
                        value={Cidade_Usuario}
                        onChangeText={setCidade_Usuario}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputTitle}>CPF</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder="Digite seu CPF"
                        value={CPF_Usuario}
                        onChangeText={setCPF_Usuario}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputTitle}>Data de Nascimento</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder="DD/MM/AAAA"
                        value={Data_Nascimento_Usuario}
                        onChangeText={setData_Nascimento_Usuario}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputTitle}>Sexo</Text>
                    <View style={styles.radioContainer}>
                        <TouchableOpacity
                            style={styles.radioButton}
                            onPress={() => setSexo_Usuario('M')}
                        >
                            <RadioButton
                                value="M"
                                status={Sexo_Usuario === 'M' ? 'checked' : 'unchecked'}
                            />
                            <Text style={styles.radioLabel}>Masculino</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.radioButton}
                            onPress={() => setSexo_Usuario('F')}
                        >
                            <RadioButton
                                value="F"
                                status={Sexo_Usuario === 'F' ? 'checked' : 'unchecked'}
                            />
                            <Text style={styles.radioLabel}>Feminino</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.radioButton}
                            onPress={() => setSexo_Usuario('O')}
                        >
                            <RadioButton
                                value="O"
                                status={Sexo_Usuario === 'O' ? 'checked' : 'unchecked'}
                            />
                            <Text style={styles.radioLabel}>Outro</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Finalizar</Text>
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
    button: {
        backgroundColor: colors.primary,
        borderRadius: 4,
        width: '60%',
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
