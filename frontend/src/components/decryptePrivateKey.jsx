// import crypto from 'crypto'; // <--- importante
// import api from '../services/api';

// export default async function fetchAndDecryptPrivateKey(token) {
//   try {
//     const response = await api.get('/users/private-key', {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     });

//     const { privateKeyEncrypted, masterKey } = response.data;
   

//     const decryptedPrivateKey = crypto.createPrivateKey({
//       key: privateKeyEncrypted,
//       format: 'pem',
//       type: 'pkcs8',
//       passphrase: masterKey
//     });

//     if (!decryptedPrivateKey) {
//       throw new Error('Falha ao descriptografar chave privada');
//     }

//     console.log('🔓 Chave privada descriptografada com sucesso');
//     return decryptedPrivateKey;

//   } catch (err) {
//     console.error('❌ Erro ao obter/descriptografar chave privada:', err.message || err);
//     return null;
//   }
// }
