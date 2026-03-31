// Data Structure
let quests = JSON.parse(localStorage.getItem('sl_quests')) || [];
let notes = JSON.parse(localStorage.getItem('sl_notes')) || [];
let level = parseInt(localStorage.getItem('sl_level')) || 0;
// Update UI on load
document.addEventListener('DOMContentLoaded', () => {
    updateLevelDisplay();
    renderQuests();
    renderNotes();
    startDeadlineChecker();
});

// Leveling System
function addExperience(amount) {
    level += amount;
    showSystemNotification("LEVEL UP!", `Player Level increased by ${amount}! Current Level: ${level}`);
    localStorage.setItem('sl_level', level);
    updateLevelDisplay();
}

function resetLevel() {
    level = 0;
    localStorage.setItem('sl_level', level);
    updateLevelDisplay();
    
    const levelEl = document.getElementById('player-level');
    levelEl.classList.add('glitch-effect');
    setTimeout(() => levelEl.classList.remove('glitch-effect'), 500);
}

function updateLevelDisplay() {
    document.getElementById('player-level').textContent = level;
}

// Modal Logic
const questModal = document.getElementById('quest-modal');
const noteModal = document.getElementById('note-modal');
const notesSidebar = document.getElementById('notes-sidebar');

document.getElementById('add-quest-btn').addEventListener('click', () => {
    questModal.classList.remove('hidden');
    document.getElementById('quest-title-input').focus();
});

document.getElementById('add-note-btn').addEventListener('click', () => {
    noteModal.classList.remove('hidden');
    document.getElementById('note-title-input').focus();
});

document.getElementById('toggle-notes-btn').addEventListener('click', () => {
    notesSidebar.classList.toggle('hidden');
});

document.getElementById('close-notes-btn').addEventListener('click', () => {
    notesSidebar.classList.add('hidden');
});

document.getElementById('cancel-quest-btn').addEventListener('click', () => {
    questModal.classList.add('hidden');
    clearQuestInputs();
});

document.getElementById('cancel-note-btn').addEventListener('click', () => {
    noteModal.classList.add('hidden');
    clearNoteInputs();
});

function clearQuestInputs() {
    document.getElementById('quest-title-input').value = '';
    const typeInput = document.getElementById('quest-type-input');
    if (typeInput) typeInput.value = 'daily';
    const startInput = document.getElementById('quest-start-date-input');
    if (startInput) startInput.value = '';
    const endInput = document.getElementById('quest-end-date-input');
    if (endInput) endInput.value = '';
}

function clearNoteInputs() {
    document.getElementById('note-title-input').value = '';
    document.getElementById('note-body-input').value = '';
}

// Quest Logic
document.getElementById('save-quest-btn').addEventListener('click', () => {
    const title = document.getElementById('quest-title-input').value.trim();
    const typeInput = document.getElementById('quest-type-input');
    const type = typeInput ? typeInput.value : 'daily';
    const startDate = document.getElementById('quest-start-date-input').value;
    const endDate = document.getElementById('quest-end-date-input').value;

    if (!title) return alert('Quest Title is required.');

    const quest = {
        id: Date.now().toString(),
        title,
        type,
        startDate,
        endDate,
        deadline: endDate, // Backward compatibility
        completed: false,
        failed: false,
        createdAt: new Date().toISOString()
    };

    quests.push(quest);
    saveQuests();
    renderQuests();
    
    questModal.classList.add('hidden');
    clearQuestInputs();
});

function completeQuest(id) {
    const quest = quests.find(q => q.id === id);
    if (!quest || quest.completed || quest.failed) return;
    
    quest.completed = true;
    let xp = 1;
    if (quest.type === 'weekly') xp = 5;
    if (quest.type === 'monthly') xp = 10;
    
    addExperience(xp);
    saveQuests();
    renderQuests();
}

function deleteQuest(id) {
    quests = quests.filter(q => q.id !== id);
    saveQuests();
    renderQuests();
}

function saveQuests() {
    localStorage.setItem('sl_quests', JSON.stringify(quests));
}

function renderQuests() {
    const list = document.getElementById('quest-list');
    list.innerHTML = '';
    
    if (quests.length === 0) {
        list.innerHTML = '<p style="color:var(--text-muted); font-style: italic;">No active quests.</p>';
        return;
    }

    // Sort: incomplete first, then by deadline/end date
    const sortedQuests = [...quests].sort((a, b) => {
        if (a.completed === b.completed) {
            const aEnd = a.endDate || a.deadline;
            const bEnd = b.endDate || b.deadline;
            if (!aEnd) return 1;
            if (!bEnd) return -1;
            return new Date(aEnd) - new Date(bEnd);
        }
        return a.completed ? 1 : -1;
    });

    sortedQuests.forEach(quest => {
        const item = document.createElement('div');
        item.className = `quest-item ${quest.completed ? 'completed' : ''} ${quest.failed ? 'failed' : ''}`;
        
        let metaText = 'NO DEADLINE';
        const endD = quest.endDate || quest.deadline;
        
        if (quest.startDate && endD) {
            metaText = `START: ${new Date(quest.startDate).toLocaleString()} | END: ${new Date(endD).toLocaleString()}`;
        } else if (endD) {
            metaText = `DEADLINE: ${new Date(endD).toLocaleString()}`;
        } else if (quest.startDate) {
            metaText = `START: ${new Date(quest.startDate).toLocaleString()}`;
        }
        
        if (quest.failed) {
            metaText = `<span style="color: var(--warning-red)">FAILED</span>`;
        }

        item.innerHTML = `
            <div class="quest-title">${quest.title} <span style="font-size:0.75rem; color:var(--glow-red); font-family:'Orbitron', sans-serif;">[${(quest.type || 'daily').toUpperCase()}]</span></div>
            <div class="quest-meta">${metaText}</div>
            <div class="item-actions">
                ${!quest.completed && !quest.failed ? `<button class="icon-btn" onclick="completeQuest('${quest.id}')" title="Mark Complete">✓</button>` : ''}
                <button class="icon-btn delete" onclick="deleteQuest('${quest.id}')" title="Delete Quest">
                    ✕
                </button>
            </div>
        `;
        list.appendChild(item);
    });
}

// Note Logic
document.getElementById('save-note-btn').addEventListener('click', () => {
    const title = document.getElementById('note-title-input').value.trim();
    const body = document.getElementById('note-body-input').value.trim();
    const fileInput = document.getElementById('note-file-input');
    const file = fileInput && fileInput.files.length > 0 ? fileInput.files[0] : null;

    if (!title) return alert('Note Title is required.');

    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            alert('File is too large! System restricted under 2MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            saveNote(title, body, file.name, file.type, e.target.result);
        };
        reader.readAsDataURL(file);
    } else {
        saveNote(title, body, null, null, null);
    }
});

function saveNote(title, body, mediaName, mediaType, mediaData) {
    const note = {
        id: Date.now().toString(),
        title,
        body,
        mediaName,
        mediaType,
        mediaData,
        createdAt: new Date().toISOString()
    };

    notes.unshift(note);
    saveNotes();
    renderNotes();
    
    noteModal.classList.add('hidden');
    clearNoteInputs();
}

function deleteNote(id) {
    notes = notes.filter(n => n.id !== id);
    saveNotes();
    renderNotes();
}

function saveNotes() {
    localStorage.setItem('sl_notes', JSON.stringify(notes));
}

function renderNotes() {
    const list = document.getElementById('note-list');
    list.innerHTML = '';
    
    if (notes.length === 0) {
        list.innerHTML = '<p style="color:var(--text-muted); font-style: italic;">No system notes found.</p>';
        return;
    }

    notes.forEach(note => {
        const item = document.createElement('div');
        item.className = 'note-item';
        
        const date = new Date(note.createdAt);
        
        let mediaHtml = '';
        if (note.mediaName) {
            if (note.mediaType && note.mediaType.startsWith('image/')) {
                mediaHtml = `<img src="${note.mediaData}" style="max-width: 100%; margin-top: 10px; border-radius: 4px; border: 1px solid var(--border-color);" alt="${note.mediaName}">`;
            } else {
                mediaHtml = `<div style="margin-top: 10px; padding: 10px; background: rgba(0,0,0,0.5); border: 1px dashed var(--glow-red); border-radius: 4px;">
                    <a href="${note.mediaData}" download="${note.mediaName}" style="color: var(--glow-red); text-decoration: none; font-weight: bold;">📄 EXTRACT: ${note.mediaName}</a>
                </div>`;
            }
        }

        item.innerHTML = `
            <div class="quest-title">${note.title}</div>
            <p style="font-size: 0.9rem; margin: 0.5rem 0; color: var(--text-main); white-space: pre-wrap;">${note.body}</p>
            ${mediaHtml}
            <div class="quest-meta" style="margin-top: 10px;">RECORDED: ${date.toLocaleDateString()}</div>
            <div class="item-actions">
                <button class="icon-btn delete" onclick="deleteNote('${note.id}')" title="Delete Note">
                    ✕
                </button>
            </div>
        `;
        list.appendChild(item);
    });
}

// Notification System (Deadlines)
let notifiedQuests = new Set(); // Keep track of quests we've already notified for in this session

function startDeadlineChecker() {
    setInterval(checkDeadlines, 60000); // Check every minute
    setTimeout(checkDeadlines, 2000); // Initial check after 2 seconds
}

function checkDeadlines() {
    const now = new Date();
    quests.forEach(quest => {
        const endD = quest.endDate || quest.deadline;
        if (quest.completed || quest.failed || !endD) return;
        
        const deadlineDate = new Date(endD);
        const diffMs = deadlineDate - now;
        const diffMins = Math.floor(diffMs / 60000);
        
        // Notify if deadline is within 60 minutes and we haven't notified yet for this session
        if (diffMins > 0 && diffMins <= 60 && !notifiedQuests.has(quest.id)) {
            showSystemNotification("QUEST DEADLINE APPROACHING", `Quest '${quest.title}' expires in ${diffMins} minutes!`);
            notifiedQuests.add(quest.id);
        } else if (diffMins <= 0) {
            quest.failed = true;
            saveQuests();
            resetLevel();
            renderQuests();
            showSystemNotification("PENALTY PHASE", `Quest '${quest.title}' failed! Streak reset to 0.`);
        }
    });
}

function showSystemNotification(title, message) {
    const notif = document.getElementById('system-notification');
    const msgEl = document.getElementById('notification-message');
    const titleEl = document.querySelector('#system-notification h4');
    
    titleEl.textContent = title;
    msgEl.textContent = message;
    
    notif.classList.remove('hidden');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        notif.classList.add('hidden');
    }, 5000);
}

// Stopwatch Logic
let swTimer = null;
let swSeconds = 0;

function formatTime(sec) {
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

const swTimeEl = document.getElementById('stopwatch-time');
if (swTimeEl) {
    document.getElementById('sw-start-btn').addEventListener('click', () => {
        if (swTimer) return;
        swTimer = setInterval(() => {
            swSeconds++;
            swTimeEl.textContent = formatTime(swSeconds);
        }, 1000);
    });

    document.getElementById('sw-pause-btn').addEventListener('click', () => {
        clearInterval(swTimer);
        swTimer = null;
    });

    document.getElementById('sw-reset-btn').addEventListener('click', () => {
        clearInterval(swTimer);
        swTimer = null;
        swSeconds = 0;
        swTimeEl.textContent = "00:00:00";
    });
}
