import axios from 'axios';

const api = axios.create({
  baseURL: 'https://localhost:5000',
  transformResponse: [function (data) {
    console.log('Dados brutos da resposta:', data); // Log do JSON original
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error('Erro ao parsear resposta:', error);
      return data;
    }
  }]
});

// Interceptor para logar todas as respostas
api.interceptors.response.use(response => {
  console.log('Resposta interceptada:', {
    url: response.config.url,
    data: response.data
  });
  return response;
}, error => {
  console.error('Erro na resposta:', error);
  return Promise.reject(error);
});

export default api;