// import React, { useEffect } from "react";
// import { View, Text } from "react-native";
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import api from '../../services/api';
// import { useNavigation } from "@react-navigation/native";

// const SingInToken = () => {

//     const navigation = useNavigation();

//     useEffect(() => {
//         const singInToken = async () => {
//             const token = await AsyncStorage.getItem("token");
//             if (token) {
//                 try{
//                     const data = await api.get('/usuario/user-profile', {
//                         headers: {
//                             Authorization: `Bearer ${token}`
//                         }
//                     })
//                     console.log(data.data)
//                 }catch(e){
//                     navigation.navigate('LoginScreen');
//                     console.log(e)
//                 }
//             } else {
//                 navigation.navigate('LoginScreen');
//             }
//         }
//         singInToken()
//     }, [])

//     return(
//         <View>
//             <Text>Token</Text>
//         </View>
//     )
// }
// export default SingInToken;