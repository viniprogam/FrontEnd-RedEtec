// src/pages/Chat/GroupChatScreen.js
import React, { useState } from 'react';
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

const colors = {
    primary: '#040915',
    secondary: '#1E2A38',
    background: '#F4F4F4',
    text: '#FFFFFF',
    border: '#8A8F9E',
    messageUser: '#d1ffd1',
    messageOther: '#f1f1f1',
    modalBackground: 'rgba(0, 0, 0, 0.5)',
    modalContent: '#FFFFFF',
};

export default function GroupChatScreen({ route, navigation }) { // Adicionado navigation
    const { conversation } = route.params;
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);

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
                    source={conversation.avatar} 
                    style={styles.avatarHeader} 
                />
                {/* Nome da Conversa */}
                <Text style={styles.nameUser}>{conversation.name}</Text>
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
                            <Text style={styles.modalOptionText}>Apagar Conversa</Text>
                        </TouchableOpacity>
                        {/* Adicione mais opções aqui, se necessário */}
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
        height: 110,
        backgroundColor: colors.secondary,
        flexDirection: 'row',
        alignItems: 'flex-end', // Alinha verticalmente os itens no final
        paddingHorizontal: 15,
        paddingVertical: 10,
        justifyContent: 'space-between',
        elevation: 4, // Adiciona sombra no Android
        shadowColor: '#000', // Cor da sombra no iOS
        shadowOffset: { width: 0, height: 1 }, // Deslocamento da sombra no iOS
        shadowOpacity: 0.2, // Opacidade da sombra no iOS
        shadowRadius: 3, // Raio da sombra no iOS
    },
    backButton: {
        padding: 5,
    },
    avatarHeader: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    nameUser: {
        flex: 1,
        marginLeft: 15,
        fontSize: 20,
        color: colors.text,
        fontWeight: '700',
        fontFamily: 'Noto Serif',
        paddingVertical: 15,
    },
    optionsButton: {
        padding: 5,
        paddingVertical: 15,
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
        alignItems: 'center',
        padding: 10,
        borderTopColor: colors.border,
        borderTopWidth: 0.5,
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 15,
        fontSize: 16,
        color: colors.primary,
    },
    sendButton: {
        marginLeft: 10,
        backgroundColor: colors.primary,
        padding: 10,
        borderRadius: 20,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.modalBackground,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.modalContent,
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    modalOptionText: {
        fontSize: 16,
        color: '#FF3B30',
    },
});
