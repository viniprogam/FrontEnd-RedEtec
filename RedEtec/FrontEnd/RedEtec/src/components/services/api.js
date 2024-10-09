import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://localhost:7140/api'
})

export const login = async (username, password) => {
  try {
    const data = await axios.post('https://localhost:7140/api/Usuario/login', {
      username,
      password,
    });

    await AsyncStorage.setItem("token", data.data.token);

    const token = await AsyncStorage.getItem("token");

    console.log("token: ", token)
  } catch (error) {
    if (error.data) {
      // Erros relacionados à resposta da API
      throw new Error(`Erro ${error.data.status}: ${error.data.data.message || 'Erro desconhecido'}`);
    } else if (error.request) {
      // Erros relacionados ao envio da requisição
      throw new Error('Erro na requisição. Verifique sua conexão.');
    } else {
      // Outros erros
      throw new Error('Erro ao fazer login: ' + error.message);
    }
  }
};
