let mediaRecorder;
let audioChunks = [];

const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const saveBtn = document.getElementById("saveBtn");
const downloadBtn = document.getElementById("downloadBtn");
const audioPlayback = document.getElementById("audioPlayback");
const descriptionInput = document.getElementById("description");
const noteList = document.getElementById("noteList");
const searchInput = document.getElementById("search");
const popup = document.getElementById("popup");

let currentBlob = null;

// Start recording
startBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  audioChunks = [];
  mediaRecorder.ondataavailable = event => audioChunks.push(event.data);

  mediaRecorder.onstop = () => {
    currentBlob = new Blob(audioChunks, { type: 'audio/webm' });
    audioPlayback.src = URL.createObjectURL(currentBlob);
    saveBtn.disabled = false;
    downloadBtn.disabled = false;
  };

  mediaRecorder.start();
  startBtn.disabled = true;
  stopBtn.disabled = false;
};

// Stop recording
stopBtn.onclick = () => {
  mediaRecorder.stop();
  startBtn.disabled = false;
  stopBtn.disabled = true;
};

// Save to localStorage
saveBtn.onclick = () => {
  if (!currentBlob) return;
  const reader = new FileReader();
  reader.onloadend = () => {
    const base64 = reader.result;
    const date = new Date().toLocaleString();
    const description = descriptionInput.value || "No description";

    const savedNotes = JSON.parse(localStorage.getItem("voiceNotes") || "[]");
    savedNotes.push({ base64, date, description });
    localStorage.setItem("voiceNotes", JSON.stringify(savedNotes));

    descriptionInput.value = "";
    saveBtn.disabled = true;
    downloadBtn.disabled = true;
    showPopup("✅ Note saved successfully!");
    loadNotes();
  };
  reader.readAsDataURL(currentBlob);
};

// Download audio
downloadBtn.onclick = () => {
  const a = document.createElement("a");
  a.href = audioPlayback.src;
  a.download = `VoiceNote-${new Date().toISOString()}.webm`;
  a.click();
};

// Load notes and apply search filter
function loadNotes() {
  noteList.innerHTML = "";
  const savedNotes = JSON.parse(localStorage.getItem("voiceNotes") || "[]");
  const searchTerm = searchInput.value.toLowerCase();

  savedNotes.forEach(note => {
    if (
      note.description.toLowerCase().includes(searchTerm) ||
      note.date.toLowerCase().includes(searchTerm)
    ) {
      const li = document.createElement("li");
      li.className = "note-item";
      li.innerHTML = `
        <strong>${note.date}</strong><br/>
        ${note.description}<br/>
        <audio controls src="${note.base64}"></audio>
      `;
      noteList.appendChild(li);
    }
  });
}

// Popup display function
function showPopup(message) {
  popup.textContent = message;
  popup.classList.add("show");
  setTimeout(() => {
    popup.classList.remove("show");
  }, 2500);
}

// Search as user types
searchInput.addEventListener("input", loadNotes);

// Initial load
loadNotes();
