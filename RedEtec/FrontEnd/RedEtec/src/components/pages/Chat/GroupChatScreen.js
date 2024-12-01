import React, { useState, useEffect, useRef } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    TouchableOpacity, 
    FlatList, 
    Image, 
    ActivityIndicator, 
    KeyboardAvoidingView, 
    Platform, 
    Alert,
    Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons'; // Importando ícones
import avatar from '../../../../assets/perfil.png'
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const colors = {
    primary: '#040915',
    secondary: '#1E2A38',
    background: '#F4F4F4',
    text: '#FFFFFF',
    border: '#8A8F9E',
    messageUser: '#8A8F9E',
    messageOther: '#f1f1f1',
    modalBackground: 'rgba(0, 0, 0, 0.5)',
    modalContent: '#FFFFFF',
};

export default function GroupChatScreen({navigation, route}) {
    const {groupId, groupName} = route.params;

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const flatListRef = useRef(null);
    const fetchIntervalRef = useRef(null);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isGroupInfoVisible, setIsGroupInfoVisible] = useState(false);
    const [modalFileVisible, setModalFileVisible] = useState(false);

    const [file, setFile] = useState(null);


    const [nivelDeAcesso, setNivelDeAcesso] = useState(null);
    const [myId, setMyId] = useState(null);
    const [myUsername, setMyUsername] = useState(null);
    const [names, setNames] = useState({}); // Armazena nomes dos usuários por ID

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMessageId, setSelectedMessageId] = useState(null);




    // Função para buscar o nome do usuário pelo ID
    const fetchSenderName = async (userId) => {
        if (names[userId]) {
            return names[userId];
        }

        try {
            const response = await axios.get(`https://localhost:7140/api/Usuario/${userId}`);
            const userName = response.data.Nome_Usuario;
            setNames((prevNames) => ({
                ...prevNames,
                [userId]: userName
            }));
            return userName;
        } catch (error) {
            console.error('Erro ao buscar nome do usuário:', error);
            return 'Desconhecido';
        }
    };

    // Função para carregar as mensagens
    const fetchMessages = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                throw new Error('Token não encontrado. Por favor, faça login novamente.');
            }

            const response = await axios.get(`https://localhost:7140/api/ChatGrupo/${groupId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                if (Array.isArray(response.data)) {
                    const fetchedMessages = await Promise.all(response.data.map(async (msg) => {
                        const senderName = await fetchSenderName(msg.Id_Usuario_Emissor);
                        return {
                            Id_Mensagem_Grupo: msg.Id_Mensagem_Grupo,
                            Id_Usuario_Emissor: msg.Id_Usuario_Emissor,
                            Mensagem: msg.Mensagem,
                            Localizacao_Arquivo: msg.Localizacao_Arquivo,
                            Timestamp: new Date(msg.Data_Enviada),
                            senderName,
                            isSent: msg.Id_Usuario_Emissor === myId
                        };
                    }));

                    setMessages(fetchedMessages.sort((a, b) => a.Timestamp - b.Timestamp));
                    console.log(response)
                } else {
                    Alert.alert('Erro', 'Formato inesperado de dados retornado da API.');
                }
            } else {
                throw new Error(`Erro ao buscar mensagens: ${response.status} - ${response.data}`);
            }
        } catch (error) {
            handleError(error);
        } finally {
            setLoading(false);
        }
    };


    const handleError = (error) => {
        if (error.response) {
            Alert.alert('Erro', error.response.data.message || 'Erro desconhecido no servidor.');
        } else {
            Alert.alert('Erro', error.message || 'Erro ao buscar mensagens.');
        }
    };

    // Função para buscar dados do usuário logado
    const userLog = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                throw new Error('Token não encontrado. Por favor, faça login novamente.');
            }

            const response = await axios.get('https://localhost:7140/api/Usuario/getusuario', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const user = response.data;

            if (user && user.Id_Usuario !== undefined && user.Nivel_Acesso !== undefined) {
                setMyId(user.Id_Usuario);
                setNivelDeAcesso(user.Nivel_Acesso);
                setMyUsername(user.Nome_Usuario)
            } else {
                throw new Error('Dados do usuário não encontrados na resposta.');
            }

        } catch (error) {
            console.error("Erro ao buscar usuário logado: ", error.message);
        }
    };

    useEffect(() => {
        fetchMessages();
        fetchIntervalRef.current = setInterval(fetchMessages, 400);
        userLog();

        return () => {
            clearInterval(fetchIntervalRef.current);
        };
    }, [groupId]);

    // Função para enviar mensagens
const handleSendMessage = async (file) => {
    if (message.trim() || file) { // Verifica se há mensagem ou arquivo
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                throw new Error('Token não encontrado. Por favor, faça login novamente.');
            }

            // Criação do FormData
            const formData = new FormData();
            formData.append('Id_Grupo', groupId);
            if (message.trim()) {
                formData.append('Mensagem', message.trim());
            }
            if (file) {
                formData.append('file', file.file);
            }

            formData.forEach((value, key) => {
                console.log(`${key}: ${value}`);
                if (key === 'file') {
                    console.log(`file URI: ${value.uri}`);
                }
            });

            const response = await axios.post('https://localhost:7140/api/ChatGrupo',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    }
                }
            );

            if (response.status === 200) {
                const newMessage = {
                    Id_Grupo: groupId,
                    Mensagem: message.trim(),
                    Localizacao_Arquivo: file ? file.uri : null, // Localização do arquivo se presente
                    Timestamp: new Date(),
                    isSent: true
                };
                setMessages(prevMessages => [...prevMessages, newMessage]);
                setMessage('');
                setFile(null); // Limpa o arquivo selecionado
                flatListRef.current.scrollToEnd({ animated: true });
            } else {
                throw new Error('Não foi possível enviar a mensagem. Tente novamente.');
            }
        } catch (err) {
            Alert.alert('Erro', err.message || 'Não foi possível enviar a mensagem. Tente novamente.');
        } finally {
            setLoading(false);
        }
    } else {
        Alert.alert('Mensagem vazia', 'Por favor, digite uma mensagem ou selecione um arquivo antes de enviar.');
    }
};



const keyExtractor = (item) => {
    return item.Timestamp instanceof Date && !isNaN(item.Timestamp.getTime()) 
        ? item.Timestamp.toISOString() 
        : String(Math.random());
};

if (loading) {
    return <ActivityIndicator size="large" color={colors.primary} />;
}

const selectFileMessage = () => {
    setModalFileVisible(true);
};

// Função para pegar foto
const pickFileWeb = async () => {
    // Lógica específica para a versão web, criando um input file
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (event) => {
        const selectedFile = event.target.files[0];
        
        if (selectedFile) {
            const newFile = {
                uri: URL.createObjectURL(selectedFile),
                name: selectedFile.name,
                type: selectedFile.type,
                file: selectedFile,
            };
            setFile(newFile); // Atualiza o estado com o novo arquivo

            console.log('Arquivo selecionado:', newFile);
            handleSendMessage(newFile); // Passa o novo arquivo selecionado para a função
            setModalFileVisible(false);
        }
    };
    input.click();
};

const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // Aceita qualquer tipo de arquivo
        copyToCacheDirectory: true,
    });

    if (result.type === 'success') {
        const newFile = {
            uri: result.uri,
            name: result.name,
            type: result.mimeType,
        };
        setFile(newFile);
        setModalFileVisible(false);
        handleSendMessage(newFile); // Passa o novo arquivo selecionado para a função
    }
};

    

    /*FUNÇÃO PARA DELETAR MENSAGENS */
	const confirmDeleteMessage = (messageId) => {
		setSelectedMessageId(messageId);
        console.log(selectedMessageId)
		setModalVisible(true);
	};

	const handlerDeleteMessage = async (messageId) => {
		try {
			const token = await AsyncStorage.getItem('token');
			if (!token) {
				throw new Error('Token não encontrado. Por favor, faça login novamente.');
			}

			await axios.delete(`https://localhost:7140/api/ChatGrupo/${messageId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				}
			});

			// Remove a mensagem excluída do estado de mensagens
			setMessages((prevMessages) => prevMessages.filter((msg) => msg.Id_Mensagem_Grupo !== messageId));
            fetchMessages();
		} catch (error) {
			Alert.alert('Erro', error.message || 'Não foi possível excluir a mensagem.');
		}
	};	


    const renderItem = ({ item }) => {
		return (
				<View style={[styles.messageContainer, item.Id_Usuario_Emissor === myId ? styles.userMessage : styles.otherMessage]}>
                    <View style={styles.messageinfs}>
                        {!item.myId && (
                                <Text style={styles.senderName}>{item.senderName}</Text>
                            )}
                        {item.LocalizacaoMidia ? (
                        <Image 
                            source={{ uri: item.LocalizacaoMidia }}
                            style={styles.messageImage}
                        />
                        ) : null}
                        <Text style={item.isSent ? styles.userText : styles.otherText}>
                        {item.Mensagem}
                        </Text>
                        <Text style={styles.timestamp}>
                            {item.Timestamp.toLocaleString()}
                        </Text>
                    </View>
                    {(item.Id_Usuario_Emissor === myId || nivelDeAcesso === 1) && (
					<TouchableOpacity style={styles.deleteButton} onPress={() => confirmDeleteMessage(item.Id_Mensagem_Grupo)}>
						<Ionicons name="trash" style={styles.deleteButtonText} />
					</TouchableOpacity>
					)}
				</View>
			);
	};

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={0} // Ajuste este valor conforme necessário
        >
            {/* Cabeçalho */}
            <View style={styles.header}>
                {/* Botão de Voltar */}
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                {/* Imagem do Grupo */}
                <Image 
                    source={avatar} 
                    style={styles.avatarHeader} 
                />
                {/* Nome da Conversa com funcionalidade de clique */}
                <TouchableOpacity onPress={() => setIsGroupInfoVisible(true)} style={styles.nameContainer}>
                    <Text style={styles.nameUser}>{groupName}</Text>
                </TouchableOpacity>
            </View>

            {/* Lista de Mensagens */}
            <FlatList
				data={messages}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				ref={flatListRef}
				contentContainerStyle={{ paddingBottom: 20 }}
                onEndReachedThreshold={0}
			/>

            {/* Input de Mensagem */}
            <View style={styles.inputContainer}>
				<TextInput
					style={styles.input}
					value={message}
					onChangeText={setMessage}
					placeholder="Digite sua mensagem..."
					placeholderTextColor={colors.border}
				/>
				<TouchableOpacity onPress={handleSendMessage}>
					<Ionicons name="send" size={15} color={colors.text} />
				</TouchableOpacity>
                {(nivelDeAcesso === 1) && (
                    <TouchableOpacity onPress={selectFileMessage}>
					    <Ionicons name="ellipsis-vertical" size={15} color={colors.text} />
				    </TouchableOpacity>
                )}
            </View>


            {/* Modal de Informações do Grupo */}
            <Modal
                transparent={true}
                visible={isGroupInfoVisible}
                animationType="slide"
                onRequestClose={() => setIsGroupInfoVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1} 
                    onPressOut={() => setIsGroupInfoVisible(false)}
                >
                </TouchableOpacity>
            </Modal>

            <Modal
				animationType="slide"
				transparent={true}
				visible={modalFileVisible}
				onRequestClose={() => setModalFileVisible(false)}
			>
				<View style={styles.modalFileOverlay}>
					<View style={styles.modalFileContainer}>
						<TouchableOpacity onPress={pickFileWeb}>
						<Ionicons name="image" size={24} color={colors.primary} />
						</TouchableOpacity>
						<TouchableOpacity onPress={pickDocument}>
						<Ionicons name="document-text" size={24} color={colors.primary} />
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

            {/* Modal de confirmação de exclusão */}
			<Modal
				animationType="slide"
				transparent={true}
				visible={modalVisible}
				onRequestClose={() => {
					setModalVisible(!modalVisible);
				}}>
				<View style={styles.modalView}>
					<Text style={styles.modalText}>Tem certeza que deseja excluir esta mensagem?</Text>
					<View style={styles.modalButtons}>
						<TouchableOpacity
							style={[styles.button, styles.buttonDelete]}
							onPress={() => {
								handlerDeleteMessage(selectedMessageId);
								setModalVisible(false);
							}}>
							<Text style={styles.buttonText}>Excluir</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.button, styles.buttonCancel]}
							onPress={() => setModalVisible(false)}>
							<Text style={styles.buttonText}>Cancelar</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

            


        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        height: 110,
        backgroundColor: colors.secondary,
        flexDirection: 'row',
        alignItems: 'center', // Alinhando verticalmente os itens no centro
        paddingHorizontal: 15,
        paddingVertical: 10,
        justifyContent: 'space-between',
    },
    backButton: {
        padding: 5,
    },
    avatarHeader: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginLeft: 10, // Adiciona uma margem para a esquerda
    },
    nameContainer: {
        flex: 1,
        marginLeft: 10, // Adiciona uma margem à esquerda da caixa de texto
        justifyContent: 'center', // Centraliza verticalmente o texto
    },
    previewContainer: {
        marginBottom: 20,
        width: '100%',
        height: 380,
    },
    nameUser: {
        fontSize: 20,
        color: colors.text,
        fontWeight: '700',
        fontFamily: 'Noto Serif',
        paddingVertical: 5,
    },
    optionsButton: {
        padding: 5,
    },
    messageContainer: {
		marginVertical: 5,
		padding: 10,
		borderRadius: 10,
	},
    message: {
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
        maxWidth: '80%',
    },
    userMessage: {
		backgroundColor: colors.border,
		alignSelf: 'flex-end',
		display: 'flex',
		flexDirection: 'row'
	},
	otherMessage: {
        backgroundColor: colors.secondary,
		alignSelf: 'flex-start',
		display: 'flex',
		flexDirection: 'row'
	},
    userText: {
        color: colors.primary,
    },
    otherText: {
        color: colors.text,
    },
    inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 15,
		backgroundColor: colors.primary,
		borderTopWidth: 1,
		borderTopColor: colors.border
	},
	input: {
		flex: 1,
		height: 50,
		borderColor: colors.border,
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 10,
		color: colors.text,
		backgroundColor: colors.secondary,
		marginRight: 10
	},
    sendButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.modalBackground,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalFileOverlay: {
		position: 'absolute',
		bottom: 0,
		left: 0,
		marginBottom: 100,
		width: '100%',
		height: 'auto'
	},
	modalFileContainer: {
		display: 'flex',
		flexDirection: 'row',
		width: 100,
		marginBottom: 20,
		padding: 5,
		backgroundColor: 'white',
		borderRadius: 10,
		alignItems: 'center',
        gap: 5,
        justifyContent: 'center'
	},
    modalContent: {
        backgroundColor: colors.modalContent,
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        width: '100%',
    },
    modalOptionText: {
        fontSize: 16,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalDescription: {
        fontSize: 16,
        marginBottom: 10,
    },
    modalMembersTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
    },
    modalMember: {
        fontSize: 16,
        marginBottom: 5,
    },
    closeButton: {
        marginTop: 15,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: colors.primary,
        borderRadius: 5,
    },
    closeButtonText: {
        color: colors.text,
        fontWeight: 'bold',
    },
    messageImage: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginBottom: 10,
    },
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
    modalButtons: {
		display: 'flex',
        flexDirection: 'row',
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
    senderName: {
        fontSize: 14,
        color: colors.border,
        fontWeight: 'bold',
    },
    messageinfs: {
        display: 'flex',
        flexDirection: 'column'
    },
    timestamp: {
        fontSize: 10,
        color: colors.text,
        marginTop: 5,
        textAlign: 'right',
    },
});
