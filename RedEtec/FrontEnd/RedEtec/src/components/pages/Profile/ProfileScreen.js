// ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Modal, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useUserProfile } from '../../context/UserProfileContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const colors = {
    primary: '#040915',
    secondary: '#1E2A38',
    background: '#F4F4F4',
    text: '#FFFFFF',
    border: '#8A8F9E'
};

export default function ProfileScreen() {
    const { profile, setProfile } = useUserProfile();
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [newUsername, setNewUsername] = useState(profile.username);

    /*DADOS DO USUÁRIO LOGADO */
    const [nivelDeAcesso, setNivelDeAcesso] = useState(null);
    const [myId, setMyId] = useState(null);
    const [myUsername, setMyUsername] = useState(null);


    /*FUNÇÃO PARA BUSCAR DADOS DO USUÁRIO LOGADO*/
    const userLog = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                throw new Error('Token não encontrado. Por favor, faça login novamente.');
            }
            
            const response = await axios.get('https://localhost:7140/getperfil', {
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
        userLog();
    })






    const handleEditProfile = () => {
        setProfile(prevProfile => ({
            ...prevProfile,
            username: newUsername
        }));
        setEditModalVisible(false);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setProfile(prevProfile => ({
                ...prevProfile,
                profileImage: result.assets[0].uri
            }));
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../../../assets/LogoWhite.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>RedEtec</Text>
                </View>
            </View>
            <View style={styles.profileContainer}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={pickImage}>
                        <Image
                            style={styles.profileImage}
                            source={{ uri: profile.profileImage }}
                        />
                    </TouchableOpacity>
                    <Text style={styles.username}>{myUsername}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <View style={styles.followInfoContainer}>
                        <View style={styles.followItem}>
                            <Text style={styles.followLabel}>Seguidores</Text>
                            <Text style={styles.followCount}>{profile.seguidores}</Text>
                        </View>
                        <View style={styles.followItem}>
                            <Text style={styles.followLabel}>Seguindo</Text>
                            <Text style={styles.followCount}>{profile.seguindo}</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={styles.editButton} onPress={() => setEditModalVisible(true)}>
                    <Text style={styles.editButtonText}>Editar Perfil</Text>
                </TouchableOpacity>

                {/* Modal de edição */}
                <Modal
                    visible={editModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setEditModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Editar Nome</Text>
                            <TextInput
                                style={styles.modalInput}
                                value={newUsername}
                                onChangeText={setNewUsername}
                            />
                            <Button title="Salvar" onPress={handleEditProfile} />
                            <Button title="Cancelar" onPress={() => setEditModalVisible(false)} />
                        </View>
                    </View>
                </Modal>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerContainer: {
        height: 110,
        backgroundColor: colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        position: 'absolute',
        top: 40,
        left: 20,
    },
    logo: {
        width: 50,
        height: 50,
    },
    titleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        marginTop: 20,
        textAlign: 'center',
        fontSize: 26,
        color: colors.text,
        fontWeight: '700',
        fontFamily: 'Noto Serif',
    },
    profileContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 20
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderColor: colors.primary,
        borderWidth: 2,
    },
    username: {
        marginTop: 10,
        fontSize: 24,
        fontWeight: '600',
        color: colors.primary,
    },
    infoContainer: {
        marginVertical: 20,
    },
    followInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    followItem: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    followLabel: {
        fontSize: 18,
        fontWeight: '500',
        color: colors.secondary,
    },
    followCount: {
        fontSize: 24,
        fontWeight: '600',
        color: colors.primary,
        marginTop: 5,
    },
    editButton: {
        backgroundColor: colors.primary,
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 30,
    },
    editButtonText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semitransparente para dar destaque ao modal
    },
    modalContent: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    modalInput: {
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
});
