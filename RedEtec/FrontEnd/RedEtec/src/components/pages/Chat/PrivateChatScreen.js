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
	Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const colors = {
	primary: '#040915',
	secondary: '#1E2A38',
	background: '#F4F4F4',
	text: '#FFFFFF',
	border: '#8A8F9E',
	messageUser: '#d1ffd1',
	messageOther: '#f1f1f1',
};

export default function PrivateChatScreen({ route, navigation }) {
	const { userId, userName, userPhoto } = route.params;
	const [message, setMessage] = useState('');
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(true);
	const flatListRef = useRef(null);
	const fetchIntervalRef = useRef(null);

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

			if (response.status === 200) {
				if (Array.isArray(response.data.$values)) {
					const fetchedMessages = response.data.$values.map(msg => ({
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
		fetchIntervalRef.current = setInterval(fetchMessages, 10000);

		return () => {
			clearInterval(fetchIntervalRef.current);
		};
	}, [userId]);

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
				<Text style={styles.timestamp}>
					{moment(item.Timestamp).format('LT')}
				</Text>
			</View>
		);
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
					<Ionicons name="send" size={24} color={colors.primary} />
				</TouchableOpacity>
			</View>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.background,
		padding: 10,
	},
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
		padding: 10,
		backgroundColor: colors.secondary,
		borderRadius: 10,
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
		backgroundColor: '#3e3e',
		alignSelf: 'flex-start',
	},
	otherMessage: {
		backgroundColor: colors.messageOther,
		alignSelf: 'flex-end',
	},
	messageImage: {
		width: 200,
		height: 200,
		borderRadius: 10,
		marginBottom: 5,
	},
	userText: {
		color: colors.primary,
	},
	otherText: {
		color: colors.secondary,
	},
	timestamp: {
		fontSize: 10,
		color: colors.border,
		alignSelf: 'flex-end',
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.secondary,
		borderRadius: 10,
		padding: 10,
	},
	input: {
		flex: 1,
		backgroundColor: '#fff',
		borderRadius: 10,
		padding: 10,
		marginRight: 10,
	},
	backButton: {
		marginRight: 10,
	},
});

