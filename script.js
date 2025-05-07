/*
  QRCrypt Script
  - Encrypts messages into a Caesar-style cipher with random rolling keys.
  - Decrypts messages using provided key sequence.
  - Generates and displays QR codes for keys.
  - Toggles between Cipher UI and Decipher scanner UI.
*/

// ----- Constants & DOM References -----
const alphabet = "abcdefghijklmnopqrstuvwxyz";
const actionBtn = document.getElementById("actionBtn");
const modeInputs = document.querySelectorAll('input[name="mode"]');
const messageInput = document.getElementById("messageInput");
const keyInput = document.getElementById("keyInput");
const qrImage = document.getElementById("qrCodeImage");
const bottomWrapper = document.getElementById("bottomWrapper");
const readerContainer = document.getElementById("reader");

// Scanner state
let scannerInitialized = false;
let html5QrcodeScanner;

// ----- Encryption / Decryption Functions -----

/**
 * Encrypts a message using a random rolling key (1-9) per character.
 * Non-alphabetic characters are preserved and get a zero key.
 * @param {string} message
 * @returns {Object} { encrypted: string, keySequence: string }
 */
function encryptWithRandomKeys(message) {
  const clean = message.toLowerCase();
  let encrypted = "";
  let keys = [];

  for (let char of clean) {
    if (/[a-z]/.test(char)) {
      const key = Math.floor(Math.random() * 9) + 1;
      const index = alphabet.indexOf(char);
      const newIndex = (index + key) % alphabet.length;
      encrypted += alphabet[newIndex];
      keys.push(key);
    } else {
      encrypted += char;
      keys.push(0);
    }
  }

  return { encrypted, keySequence: keys.join("") };
}

/**
 * Decrypts a cipher text using the provided key sequence.
 * @param {string} encrypted - The cipher text.
 * @param {string} keySeq    - String of digit keys corresponding to each char.
 * @returns {string} Decrypted plain text.
 */
function decryptWithKeySequence(encrypted, keySeq) {
  let plain = "";

  for (let i = 0; i < encrypted.length; i++) {
    const char = encrypted[i];
    const key = Number(keySeq[i] || 0);

    if (/[a-z]/.test(char) && key > 0) {
      const index = alphabet.indexOf(char);
      const newIndex = (index - key + alphabet.length) % alphabet.length;
      plain += alphabet[newIndex];
    } else {
      plain += char;
    }
  }

  return plain;
}

// ----- QR Code Generation -----

/**
 * Generates a QR code for the given text and sets it into the image element.
 * @param {string} text
 */
function generateQrCode(text) {
  QRCode.toDataURL(text)
    .then((dataUrl) => (qrImage.src = dataUrl))
    .catch((err) => console.error("QR generation error:", err));
}

// ----- Scanner Initialization -----

/**
 * Sets up and renders the Html5QrcodeScanner UI in #reader.
 */
function initScanner() {
  if (scannerInitialized) return;

  html5QrcodeScanner = new Html5QrcodeScanner(
    "reader",
    { fps: 10, qrbox: { width: 250, height: 250 } },
    false
  );

  html5QrcodeScanner.render(onScanSuccess, onScanFailure);
  scannerInitialized = true;
}

/**
 * Clears and resets the scanner UI.
 */
function clearScanner() {
  if (!scannerInitialized) return;

  readerContainer.innerHTML = "";
  scannerInitialized = false;
}

// ----- Scan Callbacks -----

/**
 * Called when the scanner successfully decodes a QR.
 * @param {string} decodedText
 * @param {any} decodedResult
 */
function onScanSuccess(decodedText, decodedResult) {
  console.log("Decoded:", decodedText, decodedResult);
  keyInput.value = decodedText;
}

/**
 * Called on scan failure (ignored by default).
 * @param {Error} error
 */
function onScanFailure(error) {
  console.warn("Scan failure:", error);
}

// ----- UI Toggle & Event Listeners -----

/**
 * Toggles between Cipher UI and Decipher scanner UI.
 * @param {string} mode - 'cipher' or 'decipher'
 */
function toggleMode(mode) {
  if (mode === "decipher") {
    bottomWrapper.style.display = "none";
    readerContainer.style.display = "block";
    initScanner();
  } else {
    bottomWrapper.style.display = "flex";
    readerContainer.style.display = "none";
    clearScanner();
  }
}

// Listen to mode radio changes
modeInputs.forEach((input) => {
  input.addEventListener("change", () => toggleMode(input.value));
});

// Initial hide of scanner
toggleMode(Array.from(modeInputs).find((i) => i.checked).value);

// Handle Go button click
actionBtn.addEventListener("click", () => {
  const mode = Array.from(modeInputs).find((i) => i.checked).value;
  const text = messageInput.value.trim();
  const key = keyInput.value.trim();

  if (!text) return;

  if (mode === "cipher") {
    const { encrypted, keySequence } = encryptWithRandomKeys(text);
    messageInput.value = encrypted;
    keyInput.value = keySequence;
    generateQrCode(keySequence);
    document.getElementById("qrCodeImage").style.display = "flex";
  } else {
    if (!key) return;
    const decrypted = decryptWithKeySequence(text, key);
    messageInput.value = decrypted;
    generateQrCode(key);
  }
});

// Handle information button click
document.getElementById("infoToggle").addEventListener("click", function (e) {
  const infoContainer = document.getElementById("informationContainer");
  if (
    infoContainer.style.display === "none" ||
    infoContainer.style.display === ""
  ) {
    infoContainer.style.display = "block";
  } else {
    infoContainer.style.display = "none";
  }
  e.stopPropagation(); // Prevent event bubbling
});

// Close dropdown when clicking elsewhere
document.addEventListener("click", function (e) {
  const infoContainer = document.getElementById("informationContainer");
  if (
    infoContainer.style.display === "block" &&
    !e.target.closest(".info-button-container")
  ) {
    infoContainer.style.display = "none";
  }
});

// Character Counter with a warning on approach to limit
const messageCount = document.getElementById("messageCount");

function updateCounter(textElem, countElem) {
  const len = textElem.value.length;
  const limit = Number(textElem.getAttribute("maxlength")) || 4000;
  countElem.textContent = `${len} / ${limit}`;

  // toggle warning
  countElem.classList.toggle("warning", len > limit * 0.9 && len <= limit);
}

messageInput.addEventListener("input", () =>
  updateCounter(messageInput, messageCount)
);
