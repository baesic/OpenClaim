const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', {fatal:true});
const iterations = 600_000;
const encode = bytes => btoa(Array.from(bytes, b => String.fromCharCode(b)).join(''));
const decode = text => Uint8Array.from(atob(text), c => c.charCodeAt(0));
async function key(password, salt, usage) {
  if (typeof password !== 'string' || password.length < 12) throw new Error('비밀번호를 12자 이상 입력하세요.');
  const material = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,[usage]);
}
export async function encryptVault(value, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const bytes = encoder.encode(JSON.stringify(value));
  if (bytes.length > 1_000_000) throw new Error('보관할 내용이 너무 큽니다.');
  const ciphertext = await crypto.subtle.encrypt({name:'AES-GCM',iv},await key(password,salt,'encrypt'),bytes);
  return JSON.stringify({format:'openclaim-vault',version:1,kdf:'PBKDF2-SHA256',iterations,cipher:'AES-256-GCM',salt:encode(salt),iv:encode(iv),data:encode(new Uint8Array(ciphertext))});
}
export async function decryptVault(text, password) {
  if (text.length > 2_000_000) throw new Error('지원하는 파일 크기를 초과했습니다.');
  const file = JSON.parse(text);
  if (file.format !== 'openclaim-vault' || file.version !== 1 || file.kdf !== 'PBKDF2-SHA256' || file.iterations !== iterations || file.cipher !== 'AES-256-GCM' || ![file.salt,file.iv,file.data].every(v => typeof v === 'string')) throw new Error('지원하지 않는 보관 파일입니다.');
  const salt = decode(file.salt), iv = decode(file.iv), data = decode(file.data);
  if (salt.length !== 16 || iv.length !== 12 || data.length < 16) throw new Error('손상된 보관 파일입니다.');
  try {
    const plain = await crypto.subtle.decrypt({name:'AES-GCM',iv},await key(password,salt,'decrypt'),data);
    return JSON.parse(decoder.decode(plain));
  } catch { throw new Error('비밀번호가 다르거나 파일이 손상되었습니다.'); }
}
