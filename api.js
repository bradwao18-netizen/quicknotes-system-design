const API_URL = "https://jsonplaceholder.typicode.com/posts";

const loadBtn = document.getElementById("load-btn");
const statusEl = document.getElementById("status");
const notesList = document.getElementById("notes-list");
const noteForm = document.getElementById("note-form");
const titleInput = document.getElementById("title-input");
const bodyInput = document.getElementById("body-input");
const submitBtn = document.getElementById("submit-btn");

// Reusable async request function checking response.ok
async function request(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return { data, status: response.status };
    } catch (error) {
        throw error;
    }
}

// Display status messages
function setStatus(message, type = "") {
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;
}

// Load 10 notes (GET)
async function loadNotes() {
    loadBtn.disabled = true;
    setStatus("Loading notes...", "loading");

    try {
        const result = await request(`${API_URL}?_limit=10`);
        notesList.innerHTML = "";

        if (result.data.length === 0) {
            setStatus("No notes found.", "success");
            loadBtn.disabled = false;
            return;
        }

        result.data.forEach(note => renderNote(note));
        setStatus(`Loaded 10 notes from the server.`, "success");
    } catch (error) {
        setStatus(`Failed to load notes: ${error.message}`, "error");
    } finally {
        loadBtn.disabled = false;
    }
}

// Create a new note (POST)
async function createNote(event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    if (!title) {
        setStatus("Title is required.", "error");
        return;
    }
    if (title.length > 100) {
        setStatus("Title cannot exceed 100 characters.", "error");
        return;
    }

    submitBtn.disabled = true;
    setStatus("Creating note...", "loading");

    try {
        const response = await request(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=UTF-8"
            },
            body: JSON.stringify({
                title,
                body,
                userId: 1
            })
        });

        renderNote(response.data, true);
        setStatus(`Note created (status ${response.status}, id ${response.data.id}).`, "success");
        noteForm.reset();
    } catch (error) {
        setStatus(`Failed to create note: ${error.message}`, "error");
    } finally {
        submitBtn.disabled = false;
    }
}

// Delete a note (DELETE)
async function deleteNote(id, element) {
    const deleteBtn = element.querySelector(".delete-btn");
    deleteBtn.disabled = true;
    setStatus("Deleting note...", "loading");

    try {
        const response = await request(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        element.remove();
        setStatus(`Note deleted successfully (status ${response.status}).`, "success");
    } catch (error) {
        if (id > 100) {
            element.remove();
            setStatus(`Note removed locally (Mock API limitation handled).`, "success");
        } else {
            setStatus(`Failed to delete note: ${error.message}`, "error");
            deleteBtn.disabled = false;
        }
    }
}

// Render individual note securely using textContent only
function renderNote(note, prepend = false) {
    const li = document.createElement("li");
    li.dataset.id = note.id;

    const h3 = document.createElement("h3");
    h3.textContent = note.title;

    const p = document.createElement("p");
    p.textContent = note.body;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "delete-btn";
    deleteBtn.onclick = () => deleteNote(note.id, li);

    li.appendChild(h3);
    li.appendChild(p);
    li.appendChild(deleteBtn);

    if (prepend) {
        notesList.prepend(li);
    } else {
        notesList.appendChild(li);
    }
}

loadBtn.addEventListener("click", loadNotes);
noteForm.addEventListener("submit", createNote);