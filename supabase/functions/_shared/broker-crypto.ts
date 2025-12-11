// Shared encryption/decryption utilities for broker credentials

export async function getEncryptionKey(): Promise<CryptoKey> {
  const encryptionKeyBase64 = Deno.env.get('BROKER_ENCRYPTION_KEY');
  if (!encryptionKeyBase64) {
    throw new Error('BROKER_ENCRYPTION_KEY not configured');
  }
  
  // Decode the base64 key (should be 32 bytes for AES-256)
  let keyBytes: Uint8Array;
  try {
    keyBytes = Uint8Array.from(atob(encryptionKeyBase64), c => c.charCodeAt(0));
  } catch {
    // If not valid base64, derive a key from the string using SHA-256
    const encoder = new TextEncoder();
    const keyData = encoder.encode(encryptionKeyBase64);
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
    keyBytes = new Uint8Array(hashBuffer);
  }
  
  // Ensure we have exactly 32 bytes for AES-256
  if (keyBytes.length !== 32) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(encryptionKeyBase64);
    const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
    keyBytes = new Uint8Array(hashBuffer);
  }
  
  return await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function encryptValue(plaintext: string, cryptoKey: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  // Generate a random IV (12 bytes for AES-GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    data
  );
  
  // Combine IV and encrypted data, then encode as base64
  const combined = new Uint8Array(iv.length + new Uint8Array(encryptedData).length);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedData), iv.length);
  
  return btoa(String.fromCharCode(...combined));
}

export async function decryptValue(encryptedBase64: string, cryptoKey: CryptoKey): Promise<string> {
  // Decode the base64 string
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  
  // Extract IV (first 12 bytes) and encrypted data
  const iv = combined.slice(0, 12);
  const encryptedData = combined.slice(12);
  
  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encryptedData
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decryptedData);
}

// Helper to check if a value looks encrypted (base64 format with specific length)
export function isEncrypted(value: string): boolean {
  // Encrypted values are base64 encoded and contain IV (12 bytes) + data + auth tag (16 bytes)
  // Minimum length after base64 encoding would be around 40+ characters
  if (!value || value.length < 40) return false;
  
  // Check if it's valid base64
  try {
    const decoded = atob(value);
    // Encrypted values should be at least 28 bytes (12 IV + 16 auth tag + minimal data)
    return decoded.length >= 28;
  } catch {
    return false;
  }
}
