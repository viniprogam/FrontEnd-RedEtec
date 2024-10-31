// import React, { useEffect, useState, useCallback } from "react";
// import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, Alert, TouchableOpacity, Modal, Pressable } from "react-native";
// import axios from 'axios';
// import { useFocusEffect } from '@react-navigation/native';
// import Feather from 'react-native-vector-icons/Feather';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const colors = {
//     primary: '#040915',
//     secondary: '#1E2A38',
//     background: '#F4F4F4',
//     text: '#FFFFFF',
//     border: '#8A8F9E'
// };

// export default function HomeScreen() {
//     const [posts, setPosts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [nivelDeAcesso, setNivelDeAcesso] = useState(null);
//     const [userId, setUserId] = useState(null);

//     const [modalVisible, setModalVisible] = useState(false);
//     const [selectedPostId, setSelectedPostId] = useState(null);

//     /*FUNÇÃO PARA CARREGAR OS POST */
//     const fetchPosts = async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get('https://localhost:7140/api/Postagem/postagens');
//             if (response.data && Array.isArray(response.data)) {
//                 setPosts(response.data);
//             } else {
//                 console.error("Data is not an array:", response.data);
//             }
//             console.log(response.data);
//         } catch (error) {
//             console.error("Erro ao buscar postagens:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     /*FUNÇÃO PARA DELETAR POSTS*/
//     const handlerDeletePost = async () => {
//         try {
//             await axios.delete(`https://localhost:7140/api/Postagem/${selectedPostId}`);
//             fetchPosts();
//             Alert.alert("Postagem deletada com sucesso");
//             setModalVisible(false);
//         } catch (error) {
//             console.error("Erro ao deletar postagem:", error);
//         }
//     };

//     /*FUNÇÃO PARA BUSCAR DADOS DO USUÁRIO LOGADO*/
//     const userLog = async () => {
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

//             console.log(user);
    
//             if (user && user.Id_Usuario !== undefined && user.Nivel_Acesso !== undefined) {
//                 setUserId(user.Id_Usuario);
//                 setNivelDeAcesso(user.Nivel_Acesso);
//             } else {
//                 throw new Error('Dados do usuário não encontrados na resposta.');
//             }
    
//         } catch (error) {
//             console.error("Erro ao buscar usuário logado: ", error.message);
//         }
//     };
//     console.log(nivelDeAcesso)

//     /*CHAMA A FUNÇÃO DE CARREGAR POST TODA VEZ QUE A TELA HOMESCREEN É ACESSADA */
//     useFocusEffect(
//         useCallback(() => {
//             fetchPosts();
//             userLog();
//         }, []),
//     );

//     /* VIEW DE RENDERIZAÇÃO DOS POST EXIBE UM LOADING NA TELA ATE CARREGAR OS POSTS */
//     if (loading) {
//         return (
//             <View style={styles.loadingContainer}>
//                 <ActivityIndicator size="large" color={colors.primary} />
//             </View>
//         );
//     }

//     /*FUNÇÃO PARA ABRIR A CONFIRMAÇÃO DE DELETAR */
//     const openDeleteConfirmation = (postId) => {
//         setSelectedPostId(postId);
//         setModalVisible(true);
//     };

//     return (
//         <View style={styles.container}>
//             <View style={styles.headerContainer}>
//                 <View style={styles.logoContainer}>
//                     <Image
//                         source={require('../../../../assets/LogoWhite.png')}
//                         style={styles.logo}
//                         resizeMode="contain"
//                     />
//                 </View>
//                 <View style={styles.titleContainer}>
//                     <Text style={styles.title}>RedEtec</Text>
//                 </View>
//             </View>

//             <ScrollView contentContainerStyle={styles.postContainer}>
//                 {posts.map((post, index) => (
//                     <View key={index} style={styles.post}>
//                         <View style={styles.postHeader}>
//                             <Image
//                                 style={styles.userAvatar}
//                                 source={require('../../../../assets/perfil.png')} // Exibe a imagem ou um placeholder
//                             />
//                             <Text style={styles.userName}>{post.Nome_Usuario}</Text>

//                             <View style={{ flex: 1 }} />

//                             {(nivelDeAcesso === 1 || post.Id_Usuario === userId) && (
//                                 <TouchableOpacity onPress={() => openDeleteConfirmation(post.Id_Postagem)} style={styles.deleteButton}>
//                                     {/* <Text style={styles.deleteButtonText}>x</Text> */}
//                                     <Feather name="more-vertical" size={24} style={styles.deleteButtonText} />
//                                 </TouchableOpacity>
//                             )}

//                         </View>
//                         <Image
//                             style={styles.imgPost}
//                             source={{ uri: `https://localhost:7140/api/Postagem/imagem/${post.imageUrl}`}}
//                         />
//                         <View style={styles.postFooter}>
//                             <Text style={styles.postDescription}>{post.Legenda_Postagem}</Text>
//                         </View>
//                     </View>
//                 ))}
//             </ScrollView>

//                 {/* Modal de confirmação de deleção */}
//             <Modal
//                 animationType="slide"
//                 transparent={true}
//                 visible={modalVisible}
//                 onRequestClose={() => setModalVisible(false)}
//             >
//                 <View style={styles.modalOverlay}>
//                     <View style={styles.modalView}>
//                         <Text style={styles.modalText}>Deseja realmente deletar esta postagem?</Text>
//                         <View style={styles.modalButtons}>
//                             <Pressable
//                                 style={[styles.button, styles.buttonCancel]}
//                                 onPress={() => setModalVisible(false)}
//                             >
//                                 <Text style={styles.buttonText}>Cancelar</Text>
//                             </Pressable>
//                             <Pressable
//                                 style={[styles.button, styles.buttonDelete]}
//                                 onPress={handlerDeletePost}
//                             >
//                                 <Text style={styles.buttonText}>Deletar</Text>
//                             </Pressable>
//                         </View>
//                     </View>
//                 </View>
//             </Modal>

//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: colors.background,
//     },
//     headerContainer: {
//         height: 110,
//         backgroundColor: colors.secondary,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     logoContainer: {
//         position: 'absolute',
//         top: 40,
//         left: 20,
//     },
//     logo: {
//         width: 50,
//         height: 50,
//     },
//     titleContainer: {
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
//     title: {
//         marginTop: 20,
//         textAlign: 'center',
//         fontSize: 26,
//         color: colors.text,
//         fontWeight: '700',
//         fontFamily: 'Noto Serif',
//     },
//     postContainer: {
//         paddingVertical: 10,
//     },
//     post: {
//         marginBottom: 20,
//         backgroundColor: '#fff',
//         borderRadius: 10,
//         overflow: 'hidden',
//         borderColor: colors.border,
//         borderWidth: 1,
//         marginVertical: 10,
//         marginHorizontal: 5,
//     },
//     postHeader: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         padding: 10,
//         backgroundColor: colors.secondary,
//         flex: 1,
//     },
//     userAvatar: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         marginRight: 10,
//     },
//     userName: {
//         fontSize: 16,
//         fontWeight: 'bold',
//         color: colors.text,
//     },
//     optionsButton: {
//         marginLeft: 'auto',
//         padding: 10,
//     },
//     imgPost: {
//         width: '100%',
//         height: 400,
//         backgroundColor: colors.border,
//     },
//     postFooter: {
//         padding: 10,
//     },
//     postDescription: {
//         fontSize: 14,
//         color: colors.primary,
//     },
//     loadingContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//     },
//     modalOverlay: {
//         flex: 1,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     },
//     modalView: {
//         margin: 20,
//         backgroundColor: 'white',
//         borderRadius: 10,
//         padding: 35,
//         alignItems: 'center',
//         shadowColor: '#000',
//         shadowOffset: {
//             width: 0,
//             height: 2,
//         },
//         shadowOpacity: 0.25,
//         shadowRadius: 4,
//         elevation: 5,
//     },
//     modalText: {
//         marginBottom: 15,
//         textAlign: 'center',
//         fontSize: 24,
//         fontWeight: 'ultralight',
//         color: colors.primary,
//     },
//     modalButtons: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         width: '100%',
//     },
//     button: {
//         borderRadius: 5,
//         padding: 10,
//         elevation: 2,
//         marginHorizontal: 10,
//         width: '40%',
//     },
//     buttonDelete: {
//         backgroundColor: colors.primary,
//     },
//     buttonCancel: {
//         backgroundColor: colors.border,
//     },
//     buttonText: {
//         color: 'white',
//         textAlign: 'center',
//     },
//     deleteButton: {
//         padding: 2,
//         margin: 0
//     },
//     deleteButtonText: {
//         marginLeft: 'auto',
//         color: colors.text,
//         fontSize: 24,
//         fontWeight: 'bold'
//     },
// });
