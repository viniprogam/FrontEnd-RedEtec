import axios from 'axios';

export const login = async (username, password) => {
  try {
    const response = await axios.post('https://localhost:7140/api/Usuarios/login', {
      username,
      password,
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      // Erros relacionados à resposta da API
      throw new Error(`Erro ${error.response.status}: ${error.response.data.message || 'Erro desconhecido'}`);
    } else if (error.request) {
      // Erros relacionados ao envio da requisição
      throw new Error('Erro na requisição. Verifique sua conexão.');
    } else {
      // Outros erros
      throw new Error('Erro ao fazer login: ' + error.message);
    }
  }
};
