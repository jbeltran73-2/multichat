// Simple encryption/decryption using base64 and XOR
const ENCRYPTION_KEY = 'pildoria-secure-key-2024';

function xorEncrypt(text: string, key: string): string {
  try {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result); // Convert to base64
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

function xorDecrypt(encryptedText: string, key: string): string {
  try {
    const text = atob(encryptedText); // Convert from base64
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data. The data may be corrupted or in an invalid format.');
  }
}

export async function encrypt(text: string): Promise<string> {
  if (!text) {
    throw new Error('Cannot encrypt empty text');
  }
  
  try {
    console.log('Encrypting data...');
    const encrypted = xorEncrypt(text, ENCRYPTION_KEY);
    console.log('Data encrypted successfully');
    return encrypted;
  } catch (error) {
    console.error('Error in encrypt function:', error);
    throw new Error('Failed to encrypt data');
  }
}

export async function decrypt(encryptedText: string): Promise<string> {
  if (!encryptedText) {
    throw new Error('Cannot decrypt empty text');
  }
  
  try {
    console.log('Decrypting data...');
    const decrypted = xorDecrypt(encryptedText, ENCRYPTION_KEY);
    console.log('Data decrypted successfully');
    return decrypted;
  } catch (error) {
    console.error('Error in decrypt function:', error);
    throw new Error('Failed to decrypt data. The data may be corrupted or in an invalid format.');
  }
}