import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image, Modal } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RadioButton } from 'react-native-paper';
import axios from 'axios';
import { Feather } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen3() {
    const [Email_Usuario, setEmail_Usuario] = useState('');
    const [CPF_Usuario, setCPF_Usuario] = useState('');
    const [Data_Nascimento_Usuario, setData_Nascimento_Usuario] = useState('');
    const [Nivel_Acesso, setNivel_Acesso] = useState(0);
    const [errorMessage, setErrorMessage] = useState(''); 
    const [selectedArea, setSelectedArea] = useState('Selecione a área'); 
    const [selectedAreaId, setSelectedAreaId] = useState(null);
    const [showSelectOptions, setShowSelectOptions] = useState(false); 
    const [modalErrorVisible, setModalErrorVisible] = useState(false);

    const handleAreaSelect = (area) => {
        setSelectedArea(area.Nome_Curso); 
        setSelectedAreaId(area.Id_Curso); 
        setShowSelectOptions(false); 
    };

    useEffect(() => {
        console.log(selectedArea);  
        console.log(selectedAreaId);  
    }, [selectedArea, selectedAreaId]);

    const navigation = useNavigation();
    const route = useRoute();
    const { Nome_Usuario, Senha_Usuario } = route.params;

    const [communities, setCommunities] = useState([]);

    const getCourse = async () => {
        try {
            const response = await axios.get('https://localhost:7140/api/Curso')
            setCommunities(response.data)
        }
        catch(error) {
            console.error(error);
        }
    }

    useState(() => {
        getCourse();
    }, [])

    const handleRegister = async () => {
        if (!validateCPF(CPF_Usuario)) {
            setErrorMessage("CPF inválido. Por favor, verifique o número informado.");
            setModalErrorVisible(true)
            return; 
        } else {
            setErrorMessage('');
        }

        try {
            const formattedDate = formatDate(Data_Nascimento_Usuario);
            console.log({
                Nome_Usuario,
                CPF_Usuario,
                Data_Nascimento_Usuario,
                Email_Usuario,
                Senha_Usuario,
                Nivel_Acesso,
                selectedAreaId
            });
            const response = await axios.post('https://localhost:7140/api/Usuario', {
                Nome_Usuario,
                CPF_Usuario,
                Data_Nascimento_Usuario: formattedDate,
                Email_Usuario,
                Senha_Usuario,
                Nivel_Acesso,
                Id_Curso: selectedAreaId
            });

            console.log('Cadastro bem-sucedido:', response.data);
            Alert.alert("Sucesso", "Cadastro realizado com sucesso!");
            navigation.navigate('LoginScreen');
        } catch (error) {
            console.error('Erro ao registrar:', error);
            const errorMessage = error.response?.data?.message || 'Não foi possível realizar o cadastro. Tente novamente.';
            Alert.alert("Erro", errorMessage);
            setModalErrorVisible(true)
        }
    };

    const formatDate = (date) => {
        const [day, month, year] = date.split('/');
        return `${year}-${month}-${day}`;
    };

    const formatToTwoDigits = (num) => (num < 10 ? `0${num}` : num);

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

    const validateCPF = (cpf) => {
        cpf = cpf.replace(/\D/g, '');
        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
            return false;
        }

        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let firstDigit = (sum * 10) % 11;
        if (firstDigit === 10 || firstDigit === 11) {
            firstDigit = 0;
        }

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
                <View style={styles.inputContainer}>
                    <Text style={styles.inputTitle}>CPF</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Digite seu CPF"
                        value={CPF_Usuario}
                        onChangeText={handleCpfChange}
                        maxLength={14}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputTitle}>Data de Nascimento</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="DD/MM/AAAA"
                        value={Data_Nascimento_Usuario}
                        onChangeText={(text) => {
                            if (text.length <= 10) {
                                let formattedText = text.replace(/\D/g, '').slice(0, 8);
                                if (formattedText.length >= 2) {
                                    formattedText = `${formattedText.slice(0, 2)}/${formattedText.slice(2)}`;
                                }
                                if (formattedText.length >= 5) {
                                    formattedText = `${formattedText.slice(0, 5)}/${formattedText.slice(5)}`;
                                }
                                setData_Nascimento_Usuario(formattedText);
                            }
                        }}
                    />
                </View>

                {/* Área de Seleção */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputTitle}>Área de Interesse</Text>
                    <Text style={styles.text}>A área deve ser selecionada conforme o seu interesse, pois você será adicionado à comunidade correspondente, com acesso a conteúdos exclusivos.</Text>
                    <TouchableOpacity style={styles.selectButton} onPress={() => setShowSelectOptions(true)}>
                        <Text style={styles.selectButtonText}>{selectedArea}</Text>
                    </TouchableOpacity>
                </View>

                {/* Modal para exibir as opções */}
                <Modal visible={showSelectOptions} transparent animationType="slide">
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.selectTitle}>Selecione a Área</Text>
                            
                            {communities.map((area, index) => (
                                <TouchableOpacity
                                    key={area.Id_Curso}
                                    style={styles.optionButton}
                                    onPress={() => handleAreaSelect(area)}
                                >
                                    <Text style={styles.optionText}>{area.Nome_Curso}</Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowSelectOptions(false)}>
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

            </View>
            <TouchableOpacity
                style={styles.button}
                onPress={async () => {
                    await handleRegister();
                }}
            >
                <Text style={styles.buttonText}>Finalizar</Text>
            </TouchableOpacity>


            <Modal
                transparent={true}
                animationType="slide"
                visible={modalErrorVisible}
                onRequestClose={() => setModalErrorVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Não foi possível realizar o cadastro. Tente novamente.</Text>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => setModalErrorVisible(false)}
                        >
                            <Text style={styles.buttonText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    modalView: {
		marginTop: 200,
		backgroundColor: 'white',
		borderRadius: 20,
		padding: 35,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
    modalText: {
		marginBottom: 15,
		textAlign: 'center',
	},
    button: {
		width: 100,
		borderRadius: 10,
		padding: 10,
		elevation: 2,
		backgroundColor: colors.primary,
		flex: 1,
		marginHorizontal: 5,
	},
    buttonText: {
		color: 'white',
		textAlign: 'center',
	},
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
        width: 120,
        height: 120,
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
        paddingHorizontal: 6,
        borderBottomColor: colors.primary,
        borderBottomWidth: 1,
    },
    text: {
        color: colors.border,
        fontSize: 12,
        fontWeight: '400',
        marginBottom: 10,
    },
    radioContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 1,
    },
    radioButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioLabel: {
        marginLeft: 6,
        fontSize: 16,
        color: colors.primary,
    },
    button: {
        backgroundColor: colors.primary,
        margin: 10,
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
    selectButton: {
        paddingVertical: 10,
        borderColor: '#8A8F9E',
        borderWidth: 1,
        borderRadius: 4,
        paddingHorizontal: 10,
        backgroundColor: '#FFFFFF',
    },
    selectButtonText: {
        fontSize: 16,
        color: '#040915',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 4,
        width: '80%',
        alignItems: 'center',
    },
    optionButton: {
        paddingVertical: 10,
        width: '100%',
        alignItems: 'center',
    },
    optionText: {
        fontSize: 16,
        color: '#040915',
    },
    cancelButton: {
        paddingVertical: 10,
        width: '100%',
        alignItems: 'center',
        marginTop: 10,
        borderTopWidth: 1,
        borderColor: '#ccc',
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#FF0000',
    },
});