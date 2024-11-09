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
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const colors = {
	primary: '#040915',
	secondary: '#1E2A38',
	background: '#F4F4F4',
	text: '#FFFFFF',
	border: '#8A8F9E'
};

export default function PrivateChatScreen({ route, navigation }) {
	const { userId, userName, userPhoto } = route.params;
	const [message, setMessage] = useState('');
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(true);
	const flatListRef = useRef(null);
	const fetchIntervalRef = useRef(null);

	const [nivelDeAcesso, setNivelDeAcesso] = useState(null);
    const [myId, setMyId] = useState(null);

	const [modalFileVisible, setModalFileVisible] = useState(false);

	const [modalVisible, setModalVisible] = useState(false);
	const [selectedMessageId, setSelectedMessageId] = useState(null);


	/*FUNÇÃO PARA CARREGAR OS MENSAGENS */
	const fetchMessages = async () => {
		try {
			const token = await AsyncStorage.getItem('token');
			if (!token) {
				throw new Error('Token não encontrado. Por favor, faça login novamente.');
			}

			const response = await axios.get(`https://localhost:7140/api/Chat/${userId}`, {
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			console.log(response)

			if (response.status === 200) {
				if (Array.isArray(response.data)) {
					const fetchedMessages = response.data.map(msg => ({
						MensagemId: msg.MensagemId,
						EmissorId: msg.EmissorId,
						ReceptorId: msg.ReceptorId,
						Mensagem: msg.Mensagem,
						LocalizacaoMidia: msg.LocalizacaoMidia,
						Timestamp: new Date(msg.Data_Mensagem),
						isSent: msg.EmissorId === userId
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


	useEffect(() => {
		fetchMessages();
		fetchIntervalRef.current = setInterval(fetchMessages, 100);
		userLog();

		return () => {
			clearInterval(fetchIntervalRef.current);
		};
	}, [userId]);

	/*FUNÇÃO PARA ENVIAS AS MENSAGENS */
	const handleSendMessage = async () => {
		if (message.trim()) {
			try {
				setLoading(true);
				const token = await AsyncStorage.getItem('token');
				if (!token) {
					throw new Error('Token não encontrado. Por favor, faça login novamente.');
				}

				const response = await axios.post(
					'https://localhost:7140/api/Chat/enviarmensagem',
					{
						ReceptorId: userId,
						Mensagem: message.trim(),
					},
					{
						headers: {
							Authorization: `Bearer ${token}`,
							'Content-Type': 'application/json',
						},
					}
				);


				if (response.status === 200) {
					const newMessage = {
						Mensagem: message.trim(),
						ReceptorId: userId,
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
			} catch (err) {
				Alert.alert('Erro', err.message || 'Não foi possível enviar a mensagem. Tente novamente.');
			} finally {
				setLoading(false);
			}
		} else {
			Alert.alert('Mensagem vazia', 'Por favor, digite uma mensagem antes de enviar.');
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
            } else {
                throw new Error('Dados do usuário não encontrados na resposta.');
            }
    
        } catch (error) {
            console.error("Erro ao buscar usuário logado: ", error.message);
        }
    };



	/*RENDERIZA AS MENSAGENS E ACORDO COM O ENVIO DO REMENETENTE: UserMessage ou OtherMessage */
	const renderItem = ({ item }) => {
    return (
    <View style={[styles.messageContainer, item.isSent ? styles.userMessage : styles.otherMessage]}>
        {item.LocalizacaoMidia ? (
        <Image 
            source={{ uri: item.LocalizacaoMidia }}
            style={styles.messageImage}
        />
        ) : null}
        <Text style={item.isSent ? styles.userText : styles.otherText}>
        {item.Mensagem}
        </Text>
        {(nivelDeAcesso === 1 || item.EmissorId === myId) && (
        <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDeleteMessage(item.MensagemId)}>
            <Ionicons name="trash" style={styles.deleteButtonText} />
        </TouchableOpacity>
        )}
    </View>
    );
};
	/*FUNÇÃO PARA DELETAR MENSAGENS */
	const confirmDeleteMessage = (messageId) => {
		setSelectedMessageId(messageId);
		setModalVisible(true);
	};
	/*FUNÇÃO PAR ABRIR MODAL DE ENVIAR ARQUIVOS (FOTOS, E ARQUIVOS DE DOC)  */
	const selectFileMessage = () => {
		setModalFileVisible(true);
	};

	const handlerDeleteMessage = async (messageId) => {
		try {
			const token = await AsyncStorage.getItem('token');
			if (!token) {
				throw new Error('Token não encontrado. Por favor, faça login novamente.');
			}

			await axios.delete(`https://localhost:7140/api/Chat/${messageId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				}
			});

			// Remove a mensagem excluída do estado de mensagens
			setMessages((prevMessages) => prevMessages.filter((msg) => msg.MensagemId !== messageId));
		} catch (error) {
			Alert.alert('Erro', error.message || 'Não foi possível excluir a mensagem.');
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

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			style={styles.container}
		>
			{/* Cabeçalho com foto de perfil e nome do usuário */}
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
					<Ionicons name="arrow-back" size={24} color={colors.text} />
				</TouchableOpacity>
				<Image source={require('../../../../assets/perfil.png')} style={styles.profileImage} />
				<Text style={styles.headerText}>{userName}</Text>
			</View>
			
			<FlatList
				data={messages}
				renderItem={renderItem}
				keyExtractor={keyExtractor}
				ref={flatListRef}
				contentContainerStyle={{ paddingBottom: 20 }}
                onEndReachedThreshold={0}
			/>
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


			{/* Modal de selecionar doc para enviar */}
			<Modal
				animationType="slide"
				transparent={true}
				visible={modalFileVisible}
				onRequestClose={() => setModalFileVisible(false)}
			>
				<View style={styles.modalFileOverlay}>
					<View style={styles.modalFileContainer}>
						<TouchableOpacity onPress={() => setModalFileVisible(false)}>
						<Ionicons name="image" size={24} color={colors.primary} />
						</TouchableOpacity>
						<TouchableOpacity onPress={() => setModalFileVisible(false)}>
						<Ionicons name="document-text" size={24} color={colors.primary} />
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
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
		padding: 10,
		backgroundColor: colors.secondary,
		
	},
	profileImage: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 10,
	},
	headerText: {
		color: colors.text,
		fontSize: 18,
	},
	messageContainer: {
		marginVertical: 5,
		padding: 10,
		borderRadius: 10,
	},
	userMessage: {
		backgroundColor: colors.secondary,
		alignSelf: 'flex-start',
		display: 'flex',
		flexDirection: 'row'
	},
	otherMessage: {
		backgroundColor: colors.border,
		alignSelf: 'flex-end',
		display: 'flex',
		flexDirection: 'row'
	},
	messageImage: {
		width: 200,
		height: 200,
		borderRadius: 10,
		marginBottom: 5,
	},
	userText: {
		color: colors.text,
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
	backButton: {
		marginRight: 10,
	},
	deleteButtonText: {
        marginLeft: 'auto',
        color: colors.text,
        fontSize: 10,
        fontWeight: 'bold'
    },
	deleteButton: {
		marginLeft:20,
		marginTop: 5
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
	modalButtons: {
		display: 'flex',
        flexDirection: 'row',
	},
	modalText: {
		marginBottom: 15,
		textAlign: 'center',
	},
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
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
	buttonFile: {
		width: 50,
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
});