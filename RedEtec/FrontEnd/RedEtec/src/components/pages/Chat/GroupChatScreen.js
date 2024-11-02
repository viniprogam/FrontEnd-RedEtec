// src/pages/Chat/GroupChatScreen.js
import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TextInput, 
    TouchableOpacity, 
    ScrollView, 
    Image, 
    Modal, 
    Alert, 
    KeyboardAvoidingView, 
    Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Importando ícones
import avatar from '../../../../assets/perfil.png'

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
    name: 'Grupo de Teste',
    description: 'Este é um grupo de teste para fins de demonstração.',
    members: ['Usuário 1', 'Usuário 2', 'Usuário 3'],
    messages: [
        { text: 'Olá, pessoal!', sender: 'user' },
        { text: 'Oi! Tudo bem?', sender: 'other' },
        { text: 'Tudo ótimo, e você?', sender: 'user' },
    ],
};

export default function GroupChatScreen({ route, navigation }) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState(dummyConversation.messages);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isGroupInfoVisible, setIsGroupInfoVisible] = useState(false);

    useEffect(() => {
        // Simular carregamento das mensagens do servidor
        setMessages(dummyConversation.messages);
    }, []);

    const handleSendMessage = () => {
        if (message.trim()) {
            setMessages([...messages, { text: message, sender: 'user' }]);
            setMessage('');
        }
    };

    const handleDeleteConversation = () => {
        Alert.alert(
            'Confirmar',
            'Você tem certeza que deseja apagar esta conversa?',
            [
                { text: 'Cancelar', style: 'cancel' },
                { 
                    text: 'Apagar', 
                    style: 'destructive', 
                    onPress: () => {
                        setMessages([]); // Limpa as mensagens
                        Alert.alert('Conversa Apagada', 'A conversa foi apagada com sucesso.');
                        navigation.goBack(); // Navega de volta para a tela anterior
                    }
                },
            ]
        );
        setIsModalVisible(false);
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
                    <Text style={styles.nameUser}>{dummyConversation.name}</Text>
                </TouchableOpacity>
                {/* Botão de Opções */}
                <TouchableOpacity 
                    style={styles.optionsButton} 
                    onPress={() => setIsModalVisible(true)}
                >
                    <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Lista de Mensagens */}
            <ScrollView 
                style={styles.messageContainer} 
                contentContainerStyle={{ paddingVertical: 10 }}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((msg, index) => (
                    <View
                        key={index}
                        style={[
                            styles.message, 
                            msg.sender === 'user' ? styles.userMessage : styles.otherMessage
                        ]}
                    >
                        <Text style={msg.sender === 'user' ? styles.userText : styles.otherText}>
                            {msg.text}
                        </Text>
                    </View>
                ))}
            </ScrollView>

            {/* Input de Mensagem */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Digite uma mensagem"
                    placeholderTextColor="#8A8F9E"
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                    <Ionicons name="send" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Modal de Opções */}
            <Modal
                transparent={true}
                visible={isModalVisible}
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.modalOverlay} 
                    activeOpacity={1} 
                    onPressOut={() => setIsModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <TouchableOpacity 
                            style={styles.modalOption} 
                            onPress={handleDeleteConversation}
                        >
                            <Ionicons name="trash" size={20} color="#FF3B30" style={{ marginRight: 10 }} />
                            <Text style={styles.modalOptionText}>Sair da comunidade</Text>
                        </TouchableOpacity>
                        {/* Adicione mais opções aqui, se necessário */}
                    </View>
                </TouchableOpacity>
            </Modal>

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
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        height: 80,
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
        flex: 1,
        paddingHorizontal: 15,
        backgroundColor: colors.background,
    },
    message: {
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
        maxWidth: '80%',
    },
    userMessage: {
        backgroundColor: colors.messageUser,
        alignSelf: 'flex-end',
    },
    otherMessage: {
        backgroundColor: colors.messageOther,
        alignSelf: 'flex-start',
    },
    userText: {
        color: colors.primary,
    },
    otherText: {
        color: '#000',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: colors.secondary,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    input: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 15,
        marginRight: 10,
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
});
