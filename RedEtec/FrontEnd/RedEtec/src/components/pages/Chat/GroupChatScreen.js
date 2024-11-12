// src/pages/Chat/GroupChatScreen.js
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

const dummyConversation = {
    avatar: { uri: avatar },
    description: 'Este é um grupo de teste para fins de demonstração.',
    members: ['Usuário 1', 'Usuário 2', 'Usuário 3'],
    messages: [
        { text: 'Olá, pessoal!', sender: 'user' },
        { text: 'Oi! Tudo bem?', sender: 'other' },
        { text: 'Tudo ótimo, e você?', sender: 'user' },
    ],
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
    const [selectedImage, setSelectedImage] = useState(null);

    const [nivelDeAcesso, setNivelDeAcesso] = useState(null);
    const [myId, setMyId] = useState(null);
    const [myUsername, setMyUsername] = useState(null);

    const [modalVisible, setModalVisible] = useState(false);
	const [selectedMessageId, setSelectedMessageId] = useState(null);


    /*FUNÇÃO PARA CARREGAR OS MENSAGENS */
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

			console.log(response)

			if (response.status === 200) {
				if (Array.isArray(response.data)) {
					const fetchedMessages = response.data.map(msg => ({
						MensagemId: msg.MensagemId,
						Id_Usuario_Emissor: msg.Id_Usuario_Emissor,
						Mensagem: msg.Mensagem,
						LocalizacaoMidia: msg.LocalizacaoMidia,
						Timestamp: new Date(msg.Data_Mensagem),
						isSent: msg.Id_Usuario_Emissor === myId
					}));

					// Atualiza o estado com as mensagens mais recentes
					setMessages(fetchedMessages.sort((a, b) => a.Timestamp - b.Timestamp));
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


    
    /*FUNÇÃO PARA BUSCAR DADOS DO USUÁRIO LOGADO*/
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

            console.log(user);

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
		fetchIntervalRef.current = setInterval(fetchMessages, 3000);
		userLog();

		return () => {
			clearInterval(fetchIntervalRef.current);
		};
	}, [groupId]);

    /*FUNÇÃO PARA ENVIAS AS MENSAGENS */
	const handleSendMessage = async () => {
        if(message.trim()) {
            try {
                setLoading(true);
                const token = await AsyncStorage.getItem('token');
                if(!token) {
                    throw new Error('Token não encontrado. Por favor, faça login novamente.');
                }
                const response = await axios.post('https://localhost:7140/api/ChatGrupo',
                    {
                        Id_Grupo: groupId,
                        Mensagem: message.trim(),
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        }
                    }
                );
                

                if (response.status === 200) {
					const newMessage = {
                        Id_Grupo: groupId,
						Mensagem: message.trim(),
						LocalizacaoMidia: null,
						Timestamp: new Date(),
						isSent: true
					};
                    setMessages(prevMessages => [...prevMessages, newMessage]);
					setMessage('');
					flatListRef.current.scrollToEnd({ animated: true });
                } else {
					throw new Error('Não foi possível enviar a mensagem. Tente novamente.');
				}
            } catch(err) {
                Alert.alert('Erro', err.message || 'Não foi possível enviar a mensagem. Tente novamente.');
            } finally {
				setLoading(false);
			}
        } else {
			Alert.alert('Mensagem vazia', 'Por favor, digite uma mensagem antes de enviar.');
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
    

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Desculpe, precisamos de permissão para acessar a galeria!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setFile(result.assets[0]);
            setModalFileVisible(false)
        }
    };

    const pickDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: '*/*', // Aceita qualquer tipo de arquivo
            copyToCacheDirectory: true,
        });

        // Verifica se a seleção foi bem-sucedida
        if (result.type === 'success') {
            console.log(result.uri); // Mostra o URI do arquivo no console
            setFile(result.uri); // Armazena o arquivo no estado
            
        } else {
            Alert.alert('Falha ao selecionar o documento.');
            setModalFileVisible(false);
        }
    };

    const renderItem = ({ item }) => {
		return (
				<View style={[styles.messageContainer, item.Id_Usuario_Emissor === myId ? styles.userMessage : styles.otherMessage]}>
					{item.LocalizacaoMidia ? (
					<Image 
						source={{ uri: item.LocalizacaoMidia }}
						style={styles.messageImage}
					/>
					) : null}
					<Text style={item.isSent ? styles.userText : styles.otherText}>
					{item.Mensagem}
					</Text>
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
                    source={dummyConversation.avatar} 
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
                <TouchableOpacity onPress={selectFileMessage}>
					<Ionicons name="ellipsis-vertical" size={15} color={colors.text} />
				</TouchableOpacity>
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
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{dummyConversation.name}</Text>
                        <Text style={styles.modalDescription}>{dummyConversation.description}</Text>
                        <Text style={styles.modalMembersTitle}>Integrantes:</Text>
                        {dummyConversation.members.map((member, index) => (
                            <Text key={index} style={styles.modalMember}>{member}</Text>
                        ))}
                        <TouchableOpacity 
                            style={styles.closeButton} 
                            onPress={() => setIsGroupInfoVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
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
						<TouchableOpacity onPress={pickImage}>
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
        color: '#000',
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
});
