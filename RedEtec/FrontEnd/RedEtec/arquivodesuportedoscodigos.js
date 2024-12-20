{/* tela que renderiza o nome do usuario que enviou a mensagem */}
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
    const [selectedImage, setSelectedImage] = useState(null);

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
                            LocalizacaoMidia: msg.LocalizacaoMidia,
                            Timestamp: new Date(msg.Data_Enviada),
                            senderName,
                            isSent: msg.Id_Usuario_Emissor === myId
                        };
                    }));

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
        fetchIntervalRef.current = setInterval(fetchMessages, 300);
        userLog();

        return () => {
            clearInterval(fetchIntervalRef.current);
        };
    }, [groupId]);

    // Função para enviar mensagens
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

        if (result.type === 'success') {
            setFile(result);
            setModalFileVisible(false);
        }
    };

    const handleDeleteMessage = async (messageId) => {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            throw new Error('Token não encontrado. Por favor, faça login novamente.');
        }

        try {
            const response = await axios.delete(`https://localhost:7140/api/ChatGrupo/${messageId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                setMessages(prevMessages => prevMessages.filter(msg => msg.Id_Mensagem_Grupo !== messageId));
                setModalVisible(false);
            } else {
                throw new Error('Não foi possível excluir a mensagem.');
            }
        } catch (error) {
            console.error('Erro ao excluir mensagem:', error);
            Alert.alert('Erro', 'Não foi possível excluir a mensagem.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={90}
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.title}>{groupName}</Text>
                <TouchableOpacity onPress={() => setIsGroupInfoVisible(!isGroupInfoVisible)}>
                    <Ionicons name="information-circle-outline" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={keyExtractor}
                renderItem={({ item }) => (
                    <View style={[styles.messageContainer, item.isSent ? styles.sentMessage : styles.receivedMessage]}>
                        {!item.isSent && (
                            <Text style={styles.senderName}>{item.senderName}</Text>
                        )}
                        <Text style={styles.messageText}>{item.Mensagem}</Text>
                        {item.LocalizacaoMidia && (
                            <Image source={{ uri: item.LocalizacaoMidia }} style={styles.messageImage} />
                        )}
                        <Text style={styles.timestamp}>
                            {item.Timestamp.toLocaleString()}
                        </Text>
                        {item.isSent || nivelDeAcesso === 1 ? (
                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedMessageId(item.Id_Mensagem_Grupo);
                                    setModalVisible(true);
                                }}
                            >
                                <Ionicons name="trash-outline" size={16} color={colors.text} />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                )}
            />

            <View style={styles.footer}>
                <TextInput
                    style={styles.input}
                    placeholder="Digite uma mensagem..."
                    placeholderTextColor={colors.border}
                    value={message}
                    onChangeText={setMessage}
                />
                <TouchableOpacity onPress={handleSendMessage}>
                    <Ionicons name="send" size={24} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={selectFileMessage}>
                    <Ionicons name="attach" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <Modal visible={modalFileVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Selecione um Arquivo</Text>
                        <TouchableOpacity style={styles.modalButton} onPress={pickImage}>
                            <Ionicons name="image-outline" size={24} color={colors.primary} />
                            <Text style={styles.modalButtonText}>Imagem</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalButton} onPress={pickDocument}>
                            <Ionicons name="document-outline" size={24} color={colors.primary} />
                            <Text style={styles.modalButtonText}>Documento</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalButton, styles.modalCancelButton]} onPress={() => setModalFileVisible(false)}>
                            <Ionicons name="close" size={24} color={colors.primary} />
                            <Text style={styles.modalButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Confirmar Exclusão</Text>
                        <Text style={styles.modalMessage}>Deseja realmente excluir esta mensagem?</Text>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.confirmDeleteButton]}
                            onPress={() => handleDeleteMessage(selectedMessageId)}
                        >
                            <Text style={styles.modalButtonText}>Excluir</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.modalCancelButton]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalButtonText}>Cancelar</Text>
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
        justifyContent: 'space-between',
        backgroundColor: colors.primary,
        padding: 10,
    },
    title: {
        fontSize: 18,
        color: colors.text,
        fontWeight: 'bold',
    },
    messageContainer: {
        margin: 5,
        padding: 10,
        borderRadius: 10,
        maxWidth: '80%',
    },
    sentMessage: {
        alignSelf: 'flex-end',
        backgroundColor: colors.messageUser,
    },
    receivedMessage: {
        alignSelf: 'flex-start',
        backgroundColor: colors.messageOther,
    },
    messageText: {
        fontSize: 16,
        color: colors.text,
    },
    messageImage: {
        width: 200,
        height: 200,
        borderRadius: 10,
        marginTop: 5,
    },
    timestamp: {
        fontSize: 10,
        color: colors.text,
        marginTop: 5,
        textAlign: 'right',
    },
    senderName: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: colors.secondary,
    },
    input: {
        flex: 1,
        backgroundColor: colors.background,
        color: colors.text,
        paddingHorizontal: 10,
        borderRadius: 20,
        marginRight: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.modalBackground,
    },
    modalContent: {
        backgroundColor: colors.modalContent,
        padding: 20,
        borderRadius: 10,
        width: '80%',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: colors.primary,
    },
    modalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 10,
        width: '100%',
        justifyContent: 'center',
        marginVertical: 5,
    },
    modalButtonText: {
        fontSize: 16,
        color: colors.primary,
        marginLeft: 10,
    },
    modalCancelButton: {
        backgroundColor: colors.secondary,
    },
    confirmDeleteButton: {
        backgroundColor: 'red',
    },
    modalMessage: {
        fontSize: 16,
        marginBottom: 20,
        color: colors.primary,
    },
});




{/*TELA CRIADA PELO CHAT GPT CRIA A OPÇÃO DE RESPOSTA DA CONVERSA */}


// import React, { useState } from 'react';
// import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

// const ChatScreen = () => {
//     const [messages, setMessages] = useState([
//         { id: '1', text: 'Oi, como você está?' },
//         { id: '2', text: 'Estou bem, e você?' },
//         { id: '3', text: 'Tudo ótimo! O que vamos fazer hoje?' },
//     ]);
//     const [responseMessage, setResponseMessage] = useState(null); // Mensagem que será respondida
//     const [message, setMessage] = useState(''); // Mensagem que o usuário digita para responder

//     // Função para selecionar uma mensagem para resposta
//     const handleSelectMessage = (message) => {
//         setResponseMessage(message); // Armazena a mensagem selecionada para resposta
//         setMessage(''); // Limpa o campo de entrada
//     };

//     // Função para enviar a resposta
//     const handleSendMessage = () => {
//         if (message.trim() !== '') {
//             const newMessage = { id: `${messages.length + 1}`, text: message, responseTo: responseMessage.id };
//             setMessages([...messages, newMessage]);
//             setMessage('');
//             setResponseMessage(null); // Limpa a mensagem selecionada após o envio
//         }
//     };

//     // Função para renderizar as mensagens
//     const renderMessageItem = ({ item }) => (
//         <TouchableOpacity onPress={() => handleSelectMessage(item)}>
//             <View style={styles.messageContainer}>
//                 <Text>{item.text}</Text>

//                 {/* Se a mensagem tem resposta, exibe ela abaixo */}
//                 {item.responseTo && (
//                     <View style={styles.responseContainer}>
//                         <Text style={styles.responseText}>Resposta: {messages.find(m => m.id === item.responseTo)?.text}</Text>
//                     </View>
//                 )}
//             </View>
//         </TouchableOpacity>
//     );

//     return (
//         <View style={styles.container}>
//             <FlatList
//                 data={messages}
//                 keyExtractor={(item) => item.id}
//                 renderItem={renderMessageItem}
//             />
            
//             {/* Mostrar a mensagem selecionada para resposta */}
//             {responseMessage && (
//                 <View style={styles.replyContainer}>
//                     <Text style={styles.replyText}>Respondendo a:</Text>
//                     <Text style={styles.replyMessage}>{responseMessage.text}</Text>
//                 </View>
//             )}

//             <View style={styles.inputContainer}>
//                 <TextInput
//                     style={styles.input}
//                     placeholder="Digite sua mensagem"
//                     value={message}
//                     onChangeText={setMessage}
//                 />
//                 <TouchableOpacity onPress={handleSendMessage}>
//                     <Text style={styles.sendButton}>Enviar</Text>
//                 </TouchableOpacity>
//             </View>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         padding: 10,
//         backgroundColor: '#fff',
//     },
//     messageContainer: {
//         padding: 10,
//         marginVertical: 5,
//         backgroundColor: '#f1f1f1',
//         borderRadius: 5,
//     },
//     responseContainer: {
//         backgroundColor: '#e0e0e0',
//         marginTop: 5,
//         padding: 5,
//         borderRadius: 5,
//     },
//     responseText: {
//         fontSize: 12,
//         fontStyle: 'italic',
//         color: '#555',
//     },
//     inputContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         borderTopWidth: 1,
//         borderColor: '#ccc',
//         padding: 10,
//     },
//     input: {
//         flex: 1,
//         borderWidth: 1,
//         borderRadius: 5,
//         padding: 10,
//         marginRight: 10,
//     },
//     sendButton: {
//         color: 'blue',
//     },
//     replyContainer: {
//         backgroundColor: '#f9f9f9',
//         padding: 10,
//         marginBottom: 10,
//     },
//     replyText: {
//         fontSize: 12,
//         color: '#888',
//     },
//     replyMessage: {
//         fontSize: 14,
//         fontWeight: 'bold',
//     },
// });

// export default ChatScreen;



// // src/pages/Chat/GroupChatScreen.js
// import React, { useState } from 'react';
// import { 
//     View, 
//     Text, 
//     StyleSheet, 
//     TextInput, 
//     TouchableOpacity, 
//     ScrollView, 
//     Image, 
//     Modal, 
//     Alert, 
//     KeyboardAvoidingView, 
//     Platform 
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons'; // Importando ícones

// const colors = {
//     primary: '#040915',
//     secondary: '#1E2A38',
//     background: '#F4F4F4',
//     text: '#FFFFFF',
//     border: '#8A8F9E',
//     messageUser: '#d1ffd1',
//     messageOther: '#f1f1f1',
//     modalBackground: 'rgba(0, 0, 0, 0.5)',
//     modalContent: '#FFFFFF',
// };

// export default function GroupChatScreen({ route, navigation }) { // Adicionado navigation
//     const { conversation } = route.params;
//     const [message, setMessage] = useState('');
//     const [messages, setMessages] = useState([]);
//     const [isModalVisible, setIsModalVisible] = useState(false);

//     const handleSendMessage = () => {
//         if (message.trim()) {
//             setMessages([...messages, { text: message, sender: 'user' }]);
//             setMessage('');
//         }
//     };

//     const handleDeleteConversation = () => {
//         Alert.alert(
//             'Confirmar',
//             'Você tem certeza que deseja apagar esta conversa?',
//             [
//                 { text: 'Cancelar', style: 'cancel' },
//                 { 
//                     text: 'Apagar', 
//                     style: 'destructive', 
//                     onPress: () => {
//                         setMessages([]); // Limpa as mensagens
//                         Alert.alert('Conversa Apagada', 'A conversa foi apagada com sucesso.');
//                         navigation.goBack(); // Navega de volta para a tela anterior
//                     }
//                 },
//             ]
//         );
//         setIsModalVisible(false);
//     };

//     return (
//         <KeyboardAvoidingView 
//             style={styles.container} 
//             behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//             keyboardVerticalOffset={0} // Ajuste este valor conforme necessário
//         >
//             {/* Cabeçalho */}
//             <View style={styles.header}>
//                 {/* Botão de Voltar */}
//                 <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
//                     <Ionicons name="arrow-back" size={24} color={colors.text} />
//                 </TouchableOpacity>
//                 {/* Imagem do Grupo */}
//                 <Image 
//                     source={conversation.avatar} 
//                     style={styles.avatarHeader} 
//                 />
//                 {/* Nome da Conversa */}
//                 <Text style={styles.nameUser}>{conversation.name}</Text>
//                 {/* Botão de Opções */}
//                 <TouchableOpacity 
//                     style={styles.optionsButton} 
//                     onPress={() => setIsModalVisible(true)}
//                 >
//                     <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
//                 </TouchableOpacity>
//             </View>

//             {/* Lista de Mensagens */}
//             <ScrollView 
//                 style={styles.messageContainer} 
//                 contentContainerStyle={{ paddingVertical: 10 }}
//                 showsVerticalScrollIndicator={false}
//             >
//                 {messages.map((msg, index) => (
//                     <View
//                         key={index}
//                         style={[
//                             styles.message, 
//                             msg.sender === 'user' ? styles.userMessage : styles.otherMessage
//                         ]}
//                     >
//                         <Text style={msg.sender === 'user' ? styles.userText : styles.otherText}>
//                             {msg.text}
//                         </Text>
//                     </View>
//                 ))}
//             </ScrollView>

//             {/* Input de Mensagem */}
//             <View style={styles.inputContainer}>
//                 <TextInput
//                     style={styles.input}
//                     value={message}
//                     onChangeText={setMessage}
//                     placeholder="Digite uma mensagem"
//                     placeholderTextColor="#8A8F9E"
//                 />
//                 <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
//                     <Ionicons name="send" size={24} color={colors.text} />
//                 </TouchableOpacity>
//             </View>

//             {/* Modal de Opções */}
//             <Modal
//                 transparent={true}
//                 visible={isModalVisible}
//                 animationType="fade"
//                 onRequestClose={() => setIsModalVisible(false)}
//             >
//                 <TouchableOpacity 
//                     style={styles.modalOverlay} 
//                     activeOpacity={1} 
//                     onPressOut={() => setIsModalVisible(false)}
//                 >
//                     <View style={styles.modalContent}>
//                         <TouchableOpacity 
//                             style={styles.modalOption} 
//                             onPress={handleDeleteConversation}
//                         >
//                             <Ionicons name="trash" size={20} color="#FF3B30" style={{ marginRight: 10 }} />
//                             <Text style={styles.modalOptionText}>Apagar Conversa</Text>
//                         </TouchableOpacity>
//                         {/* Adicione mais opções aqui, se necessário */}
//                     </View>
//                 </TouchableOpacity>
//             </Modal>
//         </KeyboardAvoidingView>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: colors.background,
//     },
//     header: {
//         height: 110,
//         backgroundColor: colors.secondary,
//         flexDirection: 'row',
//         alignItems: 'flex-end', // Alinha verticalmente os itens no final
//         paddingHorizontal: 15,
//         paddingVertical: 10,
//         justifyContent: 'space-between',
//         elevation: 4, // Adiciona sombra no Android
//         shadowColor: '#000', // Cor da sombra no iOS
//         shadowOffset: { width: 0, height: 1 }, // Deslocamento da sombra no iOS
//         shadowOpacity: 0.2, // Opacidade da sombra no iOS
//         shadowRadius: 3, // Raio da sombra no iOS
//     },
//     backButton: {
//         padding: 5,
//     },
//     avatarHeader: {
//         width: 50,
//         height: 50,
//         borderRadius: 25,
//     },
//     nameUser: {
//         flex: 1,
//         marginLeft: 15,
//         fontSize: 20,
//         color: colors.text,
//         fontWeight: '700',
//         fontFamily: 'Noto Serif',
//         paddingVertical: 15,
//     },
//     optionsButton: {
//         padding: 5,
//         paddingVertical: 15,
//     },
//     messageContainer: {
//         flex: 1,
//         paddingHorizontal: 15,
//         backgroundColor: colors.background,
//     },
//     message: {
//         padding: 10,
//         borderRadius: 10,
//         marginVertical: 5,
//         maxWidth: '80%',
//     },
//     userMessage: {
//         backgroundColor: colors.messageUser,
//         alignSelf: 'flex-end',
//     },
//     otherMessage: {
//         backgroundColor: colors.messageOther,
//         alignSelf: 'flex-start',
//     },
//     userText: {
//         color: colors.primary,
//     },
//     otherText: {
//         color: '#000',
//     },
//     inputContainer: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         padding: 10,
//         borderTopColor: colors.border,
//         borderTopWidth: 0.5,
//         backgroundColor: '#fff',
//     },
//     input: {
//         flex: 1,
//         height: 40,
//         borderColor: colors.border,
//         borderWidth: 1,
//         borderRadius: 20,
//         paddingHorizontal: 15,
//         fontSize: 16,
//         color: colors.primary,
//     },
//     sendButton: {
//         marginLeft: 10,
//         backgroundColor: colors.primary,
//         padding: 10,
//         borderRadius: 20,
//     },
//     modalOverlay: {
//         flex: 1,
//         backgroundColor: colors.modalBackground,
//         justifyContent: 'flex-end',
//     },
//     modalContent: {
//         backgroundColor: colors.modalContent,
//         padding: 20,
//         borderTopLeftRadius: 20,
//         borderTopRightRadius: 20,
//     },
//     modalOption: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         paddingVertical: 10,
//     },
//     modalOptionText: {
//         fontSize: 16,
//         color: '#FF3B30',
//     },
// });














// import React, { useState, useEffect, useRef } from 'react';
// import { 
// 	View, 
// 	Text, 
// 	StyleSheet, 
// 	TextInput, 
// 	TouchableOpacity, 
// 	FlatList, 
// 	Image, 
// 	ActivityIndicator, 
// 	KeyboardAvoidingView, 
// 	Platform, 
// 	Alert,
// 	Modal
// } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import axios from 'axios';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const colors = {
// 	primary: '#040915',
// 	secondary: '#1E2A38',
// 	background: '#F4F4F4',
// 	text: '#FFFFFF',
// 	border: '#8A8F9E'
// };

// export default function PrivateChatScreen({ route, navigation }) {
// 	const { userId, userName, userPhoto } = route.params;
// 	const [message, setMessage] = useState('');
// 	const [messages, setMessages] = useState([]);
// 	const [loading, setLoading] = useState(true);
// 	const flatListRef = useRef(null);
// 	const fetchIntervalRef = useRef(null);
// 	const [nivelDeAcesso, setNivelDeAcesso] = useState(null);
//     const [myId, setMyId] = useState(null);
// 	const [modalFileVisible, setModalFileVisible] = useState(false);
// 	const [modalVisible, setModalVisible] = useState(false);
// 	const [selectedMessageId, setSelectedMessageId] = useState(null);

// 	const fetchMessages = async () => {
// 		try {
// 			const token = await AsyncStorage.getItem('token');
// 			if (!token) {
// 				throw new Error('Token não encontrado. Por favor, faça login novamente.');
// 			}

// 			const response = await axios.get(`https://localhost:7140/api/Chat/${userId}`, {
// 				headers: {
// 					Authorization: `Bearer ${token}`
// 				}
// 			});

// 			if (response.status === 200) {
// 				if (Array.isArray(response.data)) {
// 					const fetchedMessages = response.data.map(msg => ({
// 						MensagemId: msg.MensagemId,
// 						EmissorId: msg.EmissorId,
// 						ReceptorId: msg.ReceptorId,
// 						Mensagem: msg.Mensagem,
// 						LocalizacaoMidia: msg.LocalizacaoMidia,
// 						Timestamp: new Date(msg.Data_Mensagem),
// 						isSent: msg.EmissorId === userId
// 					}));

// 					setMessages(fetchedMessages.sort((a, b) => a.Timestamp - b.Timestamp));
// 				} else {
// 					Alert.alert('Erro', 'Formato inesperado de dados retornado da API.');
// 				}
// 			} else {
// 				throw new Error(`Erro ao buscar mensagens: ${response.status} - ${response.data}`);
// 			}
// 		} catch (error) {
// 			handleError(error);
// 		} finally {
// 			setLoading(false);
// 		}
// 	};

// 	const handleError = (error) => {
// 		if (error.response) {
// 			Alert.alert('Erro', error.response.data.message || 'Erro desconhecido no servidor.');
// 		} else {
// 			Alert.alert('Erro', error.message || 'Erro ao buscar mensagens.');
// 		}
// 	};

// 	useEffect(() => {
// 		fetchMessages();
// 		fetchIntervalRef.current = setInterval(fetchMessages, 1000); // Adjust the interval as needed
// 		userLog();

// 		return () => {
// 			clearInterval(fetchIntervalRef.current);
// 		};
// 	}, [userId]);

// 	const handleSendMessage = async () => {
// 		if (message.trim()) {
// 			try {
// 				setLoading(true);
// 				const token = await AsyncStorage.getItem('token');
// 				if (!token) {
// 					throw new Error('Token não encontrado. Por favor, faça login novamente.');
// 				}

// 				const response = await axios.post(
// 					'https://localhost:7140/api/Chat/enviarmensagem',
// 					{
// 						ReceptorId: userId,
// 						Mensagem: message.trim(),
// 					},
// 					{
// 						headers: {
// 							Authorization: `Bearer ${token}`,
// 							'Content-Type': 'application/json',
// 						},
// 					}
// 				);

// 				if (response.status === 200) {
// 					const newMessage = {
// 						MensagemId: response.data.MensagemId, // Assuming response contains the new message ID
// 						Mensagem: message.trim(),
// 						ReceptorId: userId,
// 						LocalizacaoMidia: null,
// 						Timestamp: new Date(),
// 						isSent: true
// 					};
// 					setMessages(prevMessages => [...prevMessages, newMessage]);
// 					setMessage('');
// 					flatListRef.current.scrollToEnd({ animated: true });
// 				} else {
// 					throw new Error('Não foi possível enviar a mensagem. Tente novamente.');
// 				}
// 			} catch (err) {
// 				Alert.alert('Erro', err.message || 'Não foi possível enviar a mensagem. Tente novamente.');
// 			} finally {
// 				setLoading(false);
// 			}
// 		} else {
// 			Alert.alert('Mensagem vazia', 'Por favor, digite uma mensagem antes de enviar.');
// 		}
// 	};

// 	const userLog = async () => {
//         try {
//             const token = await AsyncStorage.getItem('token');
//             if (!token) {
//                 throw new Error('Token não encontrado. Por favor, faça login novamente.');
//             }
            
//             const response = await axios.get('https://localhost:7140/getperfil', {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     'Content-Type': 'application/json',
//                 },
//             });
    
//             const user = response.data;

//             if (user && user.Id_Usuario !== undefined && user.Nivel_Acesso !== undefined) {
//                 setMyId(user.Id_Usuario);
//                 setNivelDeAcesso(user.Nivel_Acesso);
//             } else {
//                 throw new Error('Dados do usuário não encontrados na resposta.');
//             }
    
//         } catch (error) {
//             console.error("Erro ao buscar usuário logado: ", error.message);
//         }
//     };

// 	const renderItem = ({ item }) => (
// 		<View style={[styles.messageContainer, item.isSent ? styles.userMessage : styles.otherMessage]}>
// 			{item.LocalizacaoMidia ? (
// 				<Image 
// 					source={{ uri: item.LocalizacaoMidia }}
// 					style={styles.messageImage}
// 				/>
// 			) : null}
// 			<Text style={item.isSent ? styles.userText : styles.otherText}>
// 				{item.Mensagem}
// 			</Text>
// 			{(nivelDeAcesso === 1 || item.EmissorId === myId) && (
// 				<TouchableOpacity style={styles.deleteButton} onPress={() => confirmDeleteMessage(item.MensagemId)}>
// 					<Ionicons name="trash" style={styles.deleteButtonText} />
// 				</TouchableOpacity>
// 			)}
// 		</View>
// 	);

// 	const confirmDeleteMessage = (messageId) => {
// 		setSelectedMessageId(messageId);
// 		setModalVisible(true);
// 	};

// 	const selectFileMessage = () => {
// 		setModalFileVisible(true);
// 	};

// 	const handlerDeleteMessage = async (messageId) => {
// 		try {
// 			const token = await AsyncStorage.getItem('token');
// 			if (!token) {
// 				throw new Error('Token não encontrado. Por favor, faça login novamente.');
// 			}

// 			await axios.delete(`https://localhost:7140/api/Chat/${messageId}`, {
// 				headers: {
// 					Authorization: `Bearer ${token}`,
// 				}
// 			});

// 			setMessages((prevMessages) => prevMessages.filter((msg) => msg.MensagemId !== messageId));
// 		} catch (error) {
// 			Alert.alert('Erro', error.message || 'Não foi possível excluir a mensagem.');
// 		}
// 	};

// 	const keyExtractor = (item) => item.MensagemId.toString();

// 	if (loading) {
// 		return <ActivityIndicator size="large" color={colors.primary} />;
// 	}

// 	return (
// 		<KeyboardAvoidingView
// 			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
// 			style={styles.container}
// 		>
// 			<View style={styles.header}>
// 				<TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
// 					<Ionicons name="arrow-back" size={24} color={colors.text} />
// 				</TouchableOpacity>
// 				<Image source={require('../../../../assets/perfil.png')} style={styles.profileImage} />
// 				<Text style={styles.headerText}>{userName}</Text>
// 			</View>
			
// 			<FlatList
// 				data={messages}
// 				renderItem={renderItem}
// 				keyExtractor={keyExtractor}
// 				ref={flatListRef}
// 				contentContainerStyle={{ paddingBottom: 20 }}
//                 onEndReachedThreshold={0}
// 			/>
// 			<View style={styles.inputContainer}>
// 				<TextInput
// 					style={styles.input}
// 					value={message}
// 					onChangeText={setMessage}
// 					placeholder="Digite sua mensagem..."
// 					placeholderTextColor={colors.border}
// 				/>
// 				<TouchableOpacity onPress={handleSendMessage}>
// 					<Ionicons name="send" size={24} color={colors.text} />
// 				</TouchableOpacity>
// 				<TouchableOpacity onPress={selectFileMessage}>
// 					<Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
// 				</TouchableOpacity>
// 			</View>

// 			<Modal
// 				animationType="slide"
// 				transparent={true}
// 				visible={modalVisible}
// 				onRequestClose={() => setModalVisible(false)}
// 			>
// 				<View style={styles.modalOverlay}>
// 					<View style={styles.modalContainer}>
// 						<Text style={styles.modalTitle}>Confirmar Exclusão</Text>
// 						<Text style={styles.modalText}>Tem certeza de que deseja excluir esta mensagem?</Text>
// 						<View style={styles.modalButtons}>
// 							<TouchableOpacity
// 								style={[styles.modalButton, styles.cancelButton]}
// 								onPress={() => setModalVisible(false)}
// 							>
// 								<Text style={styles.cancelButtonText}>Cancelar</Text>
// 							</TouchableOpacity>
// 							<TouchableOpacity
// 								style={[styles.modalButton, styles.confirmButton]}
// 								onPress={() => {
// 									handlerDeleteMessage(selectedMessageId);
// 									setModalVisible(false);
// 								}}
// 							>
// 								<Text style={styles.confirmButtonText}>Confirmar</Text>
// 							</TouchableOpacity>
// 						</View>
// 					</View>
// 				</View>
// 			</Modal>

// 			<Modal
// 				animationType="slide"
// 				transparent={true}
// 				visible={modalFileVisible}
// 				onRequestClose={() => setModalFileVisible(false)}
// 			>
// 				<View style={styles.modalFileOverlay}>
// 					<View style={styles.modalFileContainer}>
// 						<TouchableOpacity onPress={() => setModalFileVisible(false)}>
// 						<Ionicons name="image" size={24} color={colors.primary} />
// 						</TouchableOpacity>
// 						<TouchableOpacity onPress={() => setModalFileVisible(false)}>
// 						<Ionicons name="document-text" size={24} color={colors.primary} />
// 						</TouchableOpacity>
// 					</View>
// 				</View>
// 			</Modal>
// 		</KeyboardAvoidingView>
// 	);
// }

// const styles = StyleSheet.create({
// 	container: {
// 		flex: 1,
// 		backgroundColor: colors.background
// 	},
// 	header: {
// 		flexDirection: 'row',
// 		alignItems: 'center',
// 		backgroundColor: colors.primary,
// 		paddingHorizontal: 16,
// 		paddingVertical: 10,
// 		borderBottomWidth: 1,
// 		borderBottomColor: colors.border
// 	},
// 	backButton: {
// 		marginRight: 8
// 	},
// 	profileImage: {
// 		width: 40,
// 		height: 40,
// 		borderRadius: 20,
// 		marginRight: 8
// 	},
// 	headerText: {
// 		fontSize: 18,
// 		color: colors.text,
// 		fontWeight: 'bold'
// 	},
// 	messageContainer: {
// 		marginVertical: 8,
// 		marginHorizontal: 16,
// 		padding: 10,
// 		borderRadius: 8,
// 		maxWidth: '80%'
// 	},
// 	userMessage: {
// 		alignSelf: 'flex-end',
// 		backgroundColor: colors.primary,
// 	},
// 	otherMessage: {
// 		alignSelf: 'flex-start',
// 		backgroundColor: colors.secondary,
// 	},
// 	userText: {
// 		color: colors.text,
// 		fontSize: 16,
// 	},
// 	otherText: {
// 		color: colors.text,
// 		fontSize: 16,
// 	},
// 	messageImage: {
// 		width: 200,
// 		height: 200,
// 		borderRadius: 10,
// 		marginBottom: 5,
// 	},
// 	inputContainer: {
// 		flexDirection: 'row',
// 		alignItems: 'center',
// 		padding: 10,
// 		backgroundColor: colors.primary,
// 		borderTopWidth: 1,
// 		borderTopColor: colors.border
// 	},
// 	input: {
// 		flex: 1,
// 		height: 40,
// 		borderColor: colors.border,
// 		borderWidth: 1,
// 		borderRadius: 20,
// 		paddingHorizontal: 10,
// 		color: colors.text,
// 		backgroundColor: colors.secondary,
// 		marginRight: 10
// 	},
// 	deleteButton: {
// 		marginLeft: 10,
// 		padding: 5
// 	},
// 	deleteButtonText: {
// 		color: colors.text,
// 		fontSize: 20
// 	},
// 	modalFileOverlay: {
// 		position: 'absolute',
// 		bottom: 0,
// 		left: 0,
// 		marginBottom: 100,
// 		width: '100%',
// 		height: 'auto'
// 	},
// 	modalFileContainer: {
// 		display: 'flex',
// 		flexDirection: 'row',
// 		width: 100,
// 		marginBottom: 20,
// 		padding: 5,
// 		backgroundColor: 'white',
// 		borderRadius: 10,
// 		alignItems: 'center',
//         gap: 5,
//         justifyContent: 'center'
// 	},
// 	modalContainer: {
// 		display: 'flex',
// 		flexDirection: 'row',
// 		width: 300,
// 		marginBottom: 20,
// 		padding: 20,
// 		backgroundColor: 'white',
// 		borderRadius: 10,
// 		alignItems: 'center'
// 	},
// 	modalTitle: {
// 		fontSize: 18,
// 		fontWeight: 'bold',
// 		marginBottom: 10
// 	},
// 	modalText: {
// 		fontSize: 16,
// 		marginBottom: 20
// 	},
// 	modalButtons: {
// 		flexDirection: 'row'
// 	},
// 	modalButton: {
// 		flex: 1,
// 		padding: 10,
// 		borderRadius: 5,
// 		justifyContent: 'center',
// 		alignItems: 'center'
// 	},
// 	cancelButton: {
// 		backgroundColor: colors.secondary,
// 		marginRight: 5
// 	},
// 	confirmButton: {
// 		backgroundColor: colors.primary,
// 		marginLeft: 5
// 	},
// 	cancelButtonText: {
// 		color: colors.text,
// 		fontSize: 16
// 	},
// 	confirmButtonText: {
// 		color: colors.text,
// 		fontSize: 16
// 	}
// });
