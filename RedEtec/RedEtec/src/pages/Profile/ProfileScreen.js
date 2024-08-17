import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

const colors = {
    primary: '#040915',
    secondary: '#1E2A38',
    background: '#F4F4F4',
    text: '#FFFFFF',
    border: '#8A8F9E'
};

function HomeScreen() {
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.secondary,
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
        fontSize: 30,
        color: colors.text,
        fontWeight: '400',
        fontFamily: 'Noto Serif',
    }
});

export default HomeScreen;
