import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image, Modal } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RadioButton } from 'react-native-paper';
import axios from 'axios';
import { Calendar, LocaleConfig } from "react-native-calendars";
import { ptBR } from "../../utils/localeCalendarConfig";
import { Feather } from "@expo/vector-icons";

LocaleConfig.locales["pt-br"] = ptBR;
LocaleConfig.defaultLocale = "pt-br"

export default function RegisterScreen3() {
    const [Email_Usuario, setEmail_Usuario] = useState('');
    const [CPF_Usuario, setCPF_Usuario] = useState('');
    const [Data_Nascimento_Usuario, setData_Nascimento_Usuario] = useState('');
    const [Nivel_Acesso, setNivel_Acesso] = useState(0);
    const [openCalendar, setOpenCalendar] = useState(false);
    const [errorMessage, setErrorMessage] = useState(''); // Mensagem de erro
    const [selectedDay, setSelectedDay] = useState('');
    const [selectedArea, setSelectedArea] = useState('Selecione a área'); // Área selecionada
    const [selectedAreaId, setSelectedAreaId] = useState(null);
    const [showSelectOptions, setShowSelectOptions] = useState(false); // Controle de visibilidade do modal de opções

    

    const handleAreaSelect = (area) => {
        setSelectedArea(area.Nome_Curso); // Atualiza o nome da área selecionada
        setSelectedAreaId(area.Id_Curso); // Salva o ID da área selecionada
        setShowSelectOptions(false); // Esconde o menu após a seleção
    };

    useEffect(() => {
        console.log(selectedArea);  // Vai mostrar o valor atualizado de selectedArea
        console.log(selectedAreaId);  // Vai mostrar o valor atualizado de selectedAreaId
    }, [selectedArea, selectedAreaId]);
    


    const navigation = useNavigation();
    const route = useRoute();
    const { Nome_Usuario, Senha_Usuario, ProfileImage } = route.params;

    const [currentYear, setCurrentYear] = useState('2018-01-01');
    

    const formatDate = (date) => {
        const [day, month, year] = date.split('/');
        return `${year}-${month}-${day}`;
    };

    const formattedDate = formatDate(selectedDay);

    const formatToTwoDigits = (num) => (num < 10 ? `0${num}` : num);


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

    console.log(communities)


    const handleRegister = async () => {

        // console.log(ProfileImage) TESTE PARA VER SE A IMAGEM ESTAVA SENDO RECEBIDA

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
                    <Calendar
                        current={currentYear} // Adicionando a propriedade current
                        onDayPress={(day) => {
                            const formattedDay = formatToTwoDigits(day.day);
                            const formattedMonth = formatToTwoDigits(day.month);
                            setSelectedDay(`${day.year}-${formattedMonth}-${formattedDay}`);
                            setOpenCalendar(false);
                            setData_Nascimento_Usuario(`${formattedDay}/${formattedMonth}/${day.year}`);
                        }}
                        headerStyle={{
                            borderBottomWidth: 0.4,
                            borderBottomColor: "#000000", // Cor da borda inferior preta
                            paddingBottom: 0,
                            marginBottom: 0,
                            backgroundColor: "transparent", // Fundo da header transparenter
                            marginTop: -35,

                        }}
                        theme={{
                            textMonthFontSize: 15,
                            monthTextColor: "#000000", // Cor do texto do mês preto
                            todayTextColor: "#000000", // Cor do texto do dia atual preto
                            selectedDayBackgroundColor: "#FFFFFF", // Fundo do dia selecionado branco
                            selectedDayTextColor: "#000000", // Texto do dia selecionado preto
                            arrowColor: "#000000", // Cor das setas pretas
                            calendarBackground: "transparent", // Fundo do calendário transparente
                            textDayStyle: { color: "#000000" }, // Cor do texto dos dias pretos
                            textDisabledColor: "#000000", // Cor do texto dos dias desabilitados preto

                        }}
                        minDate={'1950-01-01'} // Define a data mínima como 1 de janeiro de 1950
                        maxDate={'2018-12-31'} // Define a data máxima como 31 de dezembro de 2018
                    />

                )}

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
                            {/* Renderizando cada curso da lista */}
                            {communities.map((area, index) => (
                                <TouchableOpacity
                                    key={area.Id_Curso}  // Usando Id_Curso como chave única
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