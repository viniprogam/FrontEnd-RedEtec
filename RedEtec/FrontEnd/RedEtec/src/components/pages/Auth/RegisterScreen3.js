import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image, Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RadioButton } from 'react-native-paper';
import axios from 'axios';
import DatePicker from 'react-native-modern-datepicker';
import { getFormatedDate } from 'react-native-modern-datepicker';
import * as ImagePicker from 'expo-image-picker';

export default function RegisterScreen3() {
    const [Email_Usuario, setEmail_Usuario] = useState('');
    const [Cidade_Usuario, setCidade_Usuario] = useState('qualquer');
    const [CPF_Usuario, setCPF_Usuario] = useState('');
    const [Data_Nascimento_Usuario, setData_Nascimento_Usuario] = useState('');
    const [Nivel_Acesso, setNivel_Acesso] = useState(5);
    const [Sexo_Usuario, setSexo_Usuario] = useState('');
    const [openCalendar, setOpenCalendar] = useState(false);
    const [ProfileImage, setProfileImage] = useState(null);
    const [file, setFile] = useState(null);
    const [errorMessage, setErrorMessage] = useState(''); // Mensagem de erro

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
                file: selectedFile,
            });
        };
        input.click();
    };

    const navigation = useNavigation();
    const route = useRoute();
    const { Nome_Usuario, Senha_Usuario } = route.params;

    const formatDate = (date) => {
        const [day, month, year] = date.split('/');
        return `${year}-${month}-${day}`;
    };

    const validateCPF = (cpf) => {
        // Remove caracteres não numéricos
        cpf = cpf.replace(/\D/g, '');

        // CPF deve ter 11 dígitos
        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
            return false;
        }

        // Cálculo do primeiro dígito verificador
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let firstDigit = (sum * 10) % 11;
        if (firstDigit === 10 || firstDigit === 11) {
            firstDigit = 0;
        }

        // Cálculo do segundo dígito verificador
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf.charAt(i)) * (11 - i);
        }
        let secondDigit = (sum * 10) % 11;
        if (secondDigit === 10 || secondDigit === 11) {
            secondDigit = 0;
        }

        return firstDigit === parseInt(cpf.charAt(9)) && secondDigit === parseInt(cpf.charAt(10));
    };

    const handleCpfChange = (text) => {
        let formattedCpf = text.replace(/\D/g, '');
        if (formattedCpf.length > 9) {
            formattedCpf = formattedCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        } else if (formattedCpf.length > 6) {
            formattedCpf = formattedCpf.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3');
        } else if (formattedCpf.length > 3) {
            formattedCpf = formattedCpf.replace(/(\d{3})(\d{3})/, '$1.$2');
        }
        setCPF_Usuario(formattedCpf);
    };

    const handleDateChange = (selectedDate) => {
        const formattedDate = getFormatedDate(new Date(selectedDate), 'DD/MM/YYYY');
        setData_Nascimento_Usuario(formattedDate);
        setOpenCalendar(false);
    };

    const handleRegister = async () => {
        if (!validateCPF(CPF_Usuario)) {
            setErrorMessage("CPF inválido. Por favor, verifique o número informado."); // Atualiza a mensagem de erro
            return; // Se o CPF for inválido, interrompe a execução da função
        } else {
            setErrorMessage(''); // Limpa a mensagem de erro se o CPF for válido
        }

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
            const response = await axios.post('https://localhost:7140/api/Usuario', {
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
            navigation.navigate('LoginScreen');
        } catch (error) {
            console.error('Erro ao registrar:', error);
            const errorMessage = error.response?.data?.message || 'Não foi possível realizar o cadastro. Tente novamente.';
            Alert.alert("Erro", errorMessage);
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
                    <Text style={styles.inputTitle}>Email</Text>
                    <TextInput
                        style={styles.input}
                        autoCapitalize="none"
                        placeholder="Digite seu e-mail"
                        value={Email_Usuario}
                        onChangeText={setEmail_Usuario}
                    />
                </View>
                <TouchableOpacity style={styles.imagePickerButton} onPress={pickFileWeb}>
                    <Text style={styles.imagePickerText}>Escolher Imagem</Text>
                </TouchableOpacity>

                {file && (
                    <View style={styles.previewContainer}>
                        <Image source={{ uri: file.uri }} style={styles.selectedImage} />
                    </View>
                )}

                <View style={styles.inputContainer}>
                    <Text style={styles.inputTitle}>CPF</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder="Digite seu CPF"
                        value={CPF_Usuario}
                        onChangeText={handleCpfChange}
                        maxLength={14}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputTitle}>Data de Nascimento</Text>
                    <TouchableOpacity onPress={() => setOpenCalendar(true)}>
                        <TextInput
                            style={styles.input}
                            placeholder="DD/MM/AAAA"
                            value={Data_Nascimento_Usuario}
                            editable={false}
                        />
                    </TouchableOpacity>
                </View>
                {openCalendar && (
                    <DatePicker
                        mode="calendar"
                        selected={getFormatedDate(new Date('2018-01-01'), 'YYYY-MM-DD')}
                        minimumDate={getFormatedDate(new Date('1920-01-01'), 'YYYY-MM-DD')}
                        maximumDate={getFormatedDate(new Date('2019-01-01'), 'YYYY-MM-DD')}
                        onDateChange={handleDateChange}
                        locale="pt"
                        options={{
                            mainColor: '#040915',
                        }}
                    />
                )}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputTitle}>Sexo</Text>
                    <View style={styles.radioContainer}>
                        <View style={styles.radioButton}>
                            <RadioButton 
                                value="M" 
                                status={Sexo_Usuario === 'M' ? 'checked' : 'unchecked'} 
                                onPress={() => setSexo_Usuario('M')} 
                            />
                            <Text style={styles.radioLabel}>Masculino</Text>
                        </View>
                        <View style={styles.radioButton}>
                            <RadioButton 
                                value="F" 
                                status={Sexo_Usuario === 'F' ? 'checked' : 'unchecked'} 
                                onPress={() => setSexo_Usuario('F')} 
                            />
                            <Text style={styles.radioLabel}>Feminino</Text>

                        </View>
                       
                        <View style={styles.radioButton}>
                            <RadioButton 
                                value="O" 
                                status={Sexo_Usuario === 'O' ? 'checked' : 'unchecked'} 
                                onPress={() => setSexo_Usuario('O')} 
                            />
                            <Text style={styles.radioLabel}>Outro</Text>

                        </View>
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
    imagePickerButton: {
        marginTop: 15,
        backgroundColor: colors.secondary,
        padding: 10,
        alignItems: 'center',
        borderRadius: 5,
    },
    imagePickerText: {
        color: colors.text,
        fontWeight: 'bold',
    },
    input: {
        height: 40,
        fontSize: 16,
        paddingHorizontal: 6,
        borderBottomColor: colors.primary,
        borderBottomWidth: 1,
    },
    radioContainer: {
        flexDirection: 'row', // Alinha em linha horizontal
        justifyContent: 'space-between', // Distribui igualmente entre os itens
        marginBottom: 20, // Espaçamento inferior entre as opções e o próximo campo
    },
    radioButton: {
        flexDirection: 'row', // Mantém o ícone e o texto na mesma linha
        alignItems: 'center', // Alinha verticalmente o ícone e o texto
    },
    radioLabel: {
        marginLeft: 6,
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
