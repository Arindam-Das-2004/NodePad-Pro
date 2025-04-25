
let notes = JSON.parse(localStorage.getItem('stickyNotes')) || [];
let editingIndex = null;
let currentTheme = 0;

const themes = [
  'linear-gradient(to right, #f0f0f0, #f9f9f9)',
  'linear-gradient(to right, #e3f2fd, #ffffff)',
  'linear-gradient(to right, #ffecd2, #fcb69f)',
  'linear-gradient(to right, #a1c4fd, #c2e9fb)',
  'linear-gradient(to right, #fbc2eb, #a6c1ee)',
  'linear-gradient(to right, #ff9a9e, #fad0c4)',
  'linear-gradient(to right, #d4fc79, #96e6a1)',
  'linear-gradient(to right, #84fab0, #8fd3f4)',
  'linear-gradient(to right, #fccb90, #d57eeb)',
  'linear-gradient(to right, #a18cd1, #fbc2eb)'
];

function changeTheme() {
  currentTheme = (currentTheme + 1) % themes.length;
  document.documentElement.style.setProperty('--theme-bg', themes[currentTheme]);
}

function renderNotes() {
  const wall = document.getElementById('notesWall');
  const query = document.getElementById('searchBar').value.toLowerCase();
  wall.innerHTML = '';

  const pinned = notes.filter(n => n.pin);
  const others = notes.filter(n => !n.pin);

  [...pinned, ...others].forEach((note, index) => {
    if (!note.text.toLowerCase().includes(query)) return;

    const noteDiv = document.createElement('div');
    noteDiv.className = 'note';
    if (note.pin) noteDiv.style.zIndex = 999;
    noteDiv.style.left = note.left || '20px';
    noteDiv.style.top = note.top || `${index * 250}px`;

    noteDiv.innerHTML = `
      <div class="pin-btn" onclick="togglePin(${notes.indexOf(note)})">📌</div>
      <div class="delete-btn" onclick="deleteNote(${notes.indexOf(note)})">✕</div>
      <div class="view-btn" onclick="viewNote(${notes.indexOf(note)})">👁</div>
      <div onclick="editNote(${notes.indexOf(note)})">${note.text}</div>
      <div class="date">${new Date(note.date).toLocaleString()}</div>
    `;

    noteDiv.onmousedown = function (e) {
      const wallRect = wall.getBoundingClientRect();
      const noteRect = noteDiv.getBoundingClientRect();

      let shiftX = e.clientX - noteRect.left;
      let shiftY = e.clientY - noteRect.top;

      function moveAt(clientX, clientY) {
        let newLeft = clientX - wallRect.left - shiftX;
        let newTop = clientY - wallRect.top - shiftY;

        newLeft = Math.max(0, Math.min(wallRect.width - noteRect.width, newLeft));
        newTop = Math.max(0, Math.min(wallRect.height - noteRect.height, newTop));

        noteDiv.style.left = newLeft + 'px';
        noteDiv.style.top = newTop + 'px';
      }

      function onMouseMove(e) {
        moveAt(e.clientX, e.clientY);
      }

      document.addEventListener('mousemove', onMouseMove);

      noteDiv.onmouseup = function () {
        document.removeEventListener('mousemove', onMouseMove);
        noteDiv.onmouseup = null;

        const i = notes.indexOf(note);
        notes[i].left = noteDiv.style.left;
        notes[i].top = noteDiv.style.top;
        localStorage.setItem('stickyNotes', JSON.stringify(notes));
      };
    };

    noteDiv.ondragstart = () => false;
    wall.appendChild(noteDiv);
  });
}

function saveNote() {
  const text = document.getElementById('noteText').value.trim();
  if (text) {
    const now = new Date();
    if (editingIndex !== null) {
      notes[editingIndex].text = text;
      notes[editingIndex].date = now;
      editingIndex = null;
    } else {
      notes.push({ text, date: now, pin: false, left: '20px', top: '20px' });
    }
    localStorage.setItem('stickyNotes', JSON.stringify(notes));
    document.getElementById('noteText').value = '';
    bootstrap.Modal.getInstance(document.getElementById('noteModal')).hide();
    renderNotes();
  }
}

function editNote(index) {
  editingIndex = index;
  document.getElementById('noteText').value = notes[index].text;
  new bootstrap.Modal(document.getElementById('noteModal')).show();
}

function viewNote(index) {
  editingIndex = index;
  document.getElementById('noteText').value = notes[index].text;
  new bootstrap.Modal(document.getElementById('noteModal')).show();
}

function deleteNote(index) {
  if (confirm("Delete this note?")) {
    notes.splice(index, 1);
    localStorage.setItem('stickyNotes', JSON.stringify(notes));
    renderNotes();
  }
}

function togglePin(index) {
  notes[index].pin = !notes[index].pin;
  localStorage.setItem('stickyNotes', JSON.stringify(notes));
  renderNotes();
}

renderNotes();
