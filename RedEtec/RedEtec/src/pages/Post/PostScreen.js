import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";

const colors = {
    primary: '#040915',
    secondary: '#1E2A38',
    background: '#F4F4F4',
    text: '#FFFFFF',
    border: '#8A8F9E'
};

export default function PostScreen() {
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
                    <Text style={styles.title}>Rede dos que presta</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.postContainer}>
                
                <View style={styles.post}>
                    <View style={styles.postHeader}>
                        <Image
                            style={styles.userAvatar}
                            source={require('../../../assets/Ney.jpg')}
                        />
                        <Text style={styles.userName}>Menino ney</Text>
                    </View>
                    <Image
                        style={styles.imgPost}
                        source={require('../../../assets/neypost.jpg')}
                    />
                    <View style={styles.postFooter}>
                        <Text style={styles.postDescription}>Saudades do que a gente não viveu ainda❤️</Text>
                    </View>
                </View>

                <View style={styles.post}>
                    <View style={styles.postHeader}>
                        <Image
                            style={styles.userAvatar}
                            source={require('../../../assets/chico.jpg')}
                        />
                        <Text style={styles.userName}>Chico Coins</Text>
                    </View>
                    <Image
                        style={styles.imgPost}
                        source={require('../../../assets/chicopost.jpg')}
                    />
                    <View style={styles.postFooter}>
                        <Text style={styles.postDescription}>Eu teeentei, não ser muleque com você😝</Text>
                    </View>
                </View>

                <View style={styles.post}>
                    <View style={styles.postHeader}>
                        <Image
                            style={styles.userAvatar}
                            source={require('../../../assets/aspect.jpg')}
                        />
                        <Text style={styles.userName}>Aspect</Text>
                    </View>
                    <Image
                        style={styles.imgPost}
                        source={require('../../../assets/aspectpost.jpg')}
                    />
                    <View style={styles.postFooter}>
                        <Text style={styles.postDescription}>Fazendo gracinha na frente do Pecas🤪</Text>
                    </View>
                </View>
            </ScrollView>
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
    postContainer: {
        paddingVertical: 10,
    },
    post: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        overflow: 'hidden',
        borderColor: colors.border,
        borderWidth: 1,
        marginVertical: 10,
        marginHorizontal: 5
    },
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: colors.secondary,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    imgPost: {
        width: '100%',
        height: 400,
        backgroundColor: colors.border
    },
    postFooter: {
        padding: 10,
    },
    postDescription: {
        fontSize: 14,
        color: colors.primary,
    }
});