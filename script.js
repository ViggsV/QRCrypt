function encryptWithRandomKeys(message) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const clean = message.toLowerCase();
    let encrypted = '';
    let keys = [];
  
    for (let char of clean) {
      if (/[a-z]/.test(char)) {
        const key = Math.floor(Math.random() * 9) + 1;
        const index = alphabet.indexOf(char);
        const newIndex = (index + key) % 26;
        encrypted += alphabet[newIndex];
        keys.push(key);
      } else {
        encrypted += char;
        keys.push(0);
      }
    }
    return { encrypted, keySequence: keys.join('') };
  }
  
  function decryptWithKeySequence(encrypted, keySeq) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    let plain = '';
  
    for (let i = 0; i < encrypted.length; i++) {
      const char = encrypted[i];
      const key = Number(keySeq[i] || 0);
      if (/[a-z]/.test(char) && key > 0) {
        const index = alphabet.indexOf(char);
        const newindex = (index - key + 26) % 26;
        plain += alphabet[newindex];
      } else {
        plain += char;
      }
    }
    return plain;
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const actionBtn = document.getElementById('actionBtn');
    const modeInputs = document.querySelectorAll('input[name="mode"]');
    const messageInput = document.getElementById('messageInput');
    const keyInput = document.getElementById('keyInput');
  
    actionBtn.addEventListener('click', () => {
      const mode = Array.from(modeInputs).find(i => i.checked).value;
      const text = messageInput.value;
      const key = keyInput.value;
  
      if (!text) return;
  
      if (mode === 'cipher') {
        const { encrypted, keySequence } = encryptWithRandomKeys(text);
        messageInput.value = encrypted;
        keyInput.value = keySequence;
      } else {
        if (!key) return;
        const decrypted = decryptWithKeySequence(text, key);
        messageInput.value = decrypted;
      }
    });
  });
  