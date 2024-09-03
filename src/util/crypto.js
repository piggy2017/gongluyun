/*
 * @Author: 孙林 1164700321@qq.com
 * @Date: 2024-09-03 11:22:42
 * @LastEditors: 孙林
 * @LastEditTime: 2024-09-03 11:22:53
 * @Description: 
 */
import CryptoJS from 'crypto-js';

const key = CryptoJS.enc.Utf8.parse('9517538624814725');

export function encryptData(data) {
  const encrypted = CryptoJS.AES.encrypt(data, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.toString();
}

export function decryptData(encrypted) {
  const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  }).toString(CryptoJS.enc.Utf8);
  return decrypted;
}
