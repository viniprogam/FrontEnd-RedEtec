import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const colors = {
    primary: '#040915',
    secondary: '#1E2A38',
    background: '#F4F4F4',
    text: '#FFFFFF',
    border: '#8A8F9E'
};

export default function ProfileScreen() {
    const [email_Usuario, setEmail_Usuario] = useState('user@example.com');
    const [cidade_Usuario, setCidade_Usuario] = useState('São Paulo');
    const [data_Nascimento_Usuario, setData_Nascimento_Usuario] = useState('01/01/2000');
    const [sexo_Usuario, setSexo_Usuario] = useState('Masculino');

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../../../assets/LogoWhite.png')}
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
                    <Image
                        style={styles.profileImage}
                        source={{ uri: 'https://via.placeholder.com/150' }} // Imagem de perfil placeholder
                    />
                    <Text style={styles.username}>Nome do Usuário</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.infoLabel}>Email:</Text>
                    <Text style={styles.infoText}>{email_Usuario}</Text>

                    <Text style={styles.infoLabel}>Cidade:</Text>
                    <Text style={styles.infoText}>{cidade_Usuario}</Text>

                    <Text style={styles.infoLabel}>Data de Nascimento:</Text>
                    <Text style={styles.infoText}>{data_Nascimento_Usuario}</Text>

                    <Text style={styles.infoLabel}>Sexo:</Text>
                    <Text style={styles.infoText}>{sexo_Usuario}</Text>
                </View>
                <TouchableOpacity style={styles.editButton}>
                    <Text style={styles.editButtonText}>Editar Perfil</Text>
                </TouchableOpacity>
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
    infoLabel: {
        fontSize: 18,
        fontWeight: '500',
        color: colors.secondary,
        marginBottom: 5,
    },
    infoText: {
        fontSize: 16,
        color: colors.primary,
        marginBottom: 15,
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
});
