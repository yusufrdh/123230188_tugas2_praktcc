// ===== Configuration =====
const API_BASE = `${window.location.origin}/api/v1/notes`;

// ===== DOM Elements =====
const noteForm = document.querySelector("#note-form");
const inputJudul = document.querySelector("#judul");
const inputIsi = document.querySelector("#isi");
const notesList = document.querySelector("#notes-list");
const notesCount = document.querySelector("#notes-count");
const formTitle = document.querySelector("#form-title");
const btnSubmit = document.querySelector("#btn-submit");
const btnCancel = document.querySelector("#btn-cancel");
const loadingEl = document.querySelector("#loading");
const emptyState = document.querySelector("#empty-state");
const toastContainer = document.querySelector("#toast-container");

// ===== SVG Icons =====
const icons = {
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
};

// ===== Initialize =====
document.addEventListener("DOMContentLoaded", () => {
  getNotes();
});

// ===== Toast =====
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("toast-exit");
    setTimeout(() => toast.remove(), 200);
  }, 2500);
}

// ===== Form Submit =====
noteForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const judul = inputJudul.value.trim();
  const isi = inputIsi.value.trim();
  const id = inputJudul.dataset.id || "";

  if (!judul || !isi) return;

  try {
    if (id === "") {
      await axios.post(API_BASE, { judul, isi });
      showToast("Catatan berhasil ditambahkan");
    } else {
      await axios.put(`${API_BASE}/${id}`, { judul, isi });
      showToast("Catatan berhasil diperbarui");
    }
    resetForm();
    getNotes();
  } catch (error) {
    console.error(error.response?.data || error.message);
    showToast("Gagal menyimpan catatan", "error");
  }
});

// ===== Cancel =====
btnCancel.addEventListener("click", () => resetForm());

function resetForm() {
  inputJudul.dataset.id = "";
  inputJudul.value = "";
  inputIsi.value = "";
  formTitle.textContent = "Tambah Catatan Baru";
  btnSubmit.textContent = "Simpan";
  btnCancel.style.display = "none";
}

// ===== Get All Notes =====
async function getNotes() {
  loadingEl.style.display = "flex";
  emptyState.style.display = "none";
  document.querySelectorAll(".note-card").forEach((el) => el.remove());

  try {
    const response = await axios.get(API_BASE);
    const notes = response.data?.data || [];
    loadingEl.style.display = "none";

    if (notes.length === 0) {
      emptyState.style.display = "block";
      notesCount.textContent = "0 catatan";
      return;
    }

    notesCount.textContent = `${notes.length} catatan`;
    notes.forEach((note) => notesList.appendChild(createNoteCard(note)));
  } catch (error) {
    loadingEl.style.display = "none";
    console.error(error.response?.data || error.message);
    showToast("Gagal memuat catatan. Pastikan backend berjalan.", "error");
    emptyState.style.display = "block";
    emptyState.querySelector("p").textContent = "Tidak dapat terhubung ke server";
  }
}

// ===== Create Note Card =====
function createNoteCard(note) {
  const card = document.createElement("div");
  card.className = "note-card";

  const tanggal = new Date(note.tanggal_dibuat).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  card.innerHTML = `
    <h3 class="note-title">${escapeHtml(note.judul)}</h3>
    <p class="note-content">${escapeHtml(note.isi)}</p>
    <div class="note-footer">
      <span class="note-date">${tanggal}</span>
      <div class="note-actions">
        <button class="btn-action btn-edit" title="Edit">${icons.edit} Edit</button>
        <button class="btn-action btn-delete" title="Hapus">${icons.trash} Hapus</button>
      </div>
    </div>
  `;

  // Edit
  card.querySelector(".btn-edit").addEventListener("click", () => {
    inputJudul.dataset.id = note.id;
    inputJudul.value = note.judul;
    inputIsi.value = note.isi;
    formTitle.textContent = "Edit Catatan";
    btnSubmit.textContent = "Update";
    btnCancel.style.display = "inline-flex";
    document.querySelector("#form-section").scrollIntoView({ behavior: "smooth" });
  });

  // Delete
  card.querySelector(".btn-delete").addEventListener("click", async () => {
    const confirmed = await showConfirm(`Hapus catatan "${note.judul}"?`);
    if (!confirmed) return;
    try {
      await axios.delete(`${API_BASE}/${note.id}`);
      showToast("Catatan berhasil dihapus");
      getNotes();
    } catch (error) {
      console.error(error.response?.data || error.message);
      showToast("Gagal menghapus catatan", "error");
    }
  });

  return card;
}

// ===== Custom Confirm Modal =====
function showConfirm(message) {
  return new Promise((resolve) => {
    const overlay = document.getElementById("modal-overlay");
    const msgEl = document.getElementById("modal-message");
    const btnConfirm = document.getElementById("modal-confirm");
    const btnCancel = document.getElementById("modal-cancel");

    msgEl.textContent = message;
    overlay.style.display = "flex";

    function cleanup(result) {
      overlay.style.display = "none";
      btnConfirm.removeEventListener("click", onConfirm);
      btnCancel.removeEventListener("click", onCancel);
      overlay.removeEventListener("click", onOverlay);
      resolve(result);
    }

    function onConfirm() { cleanup(true); }
    function onCancel() { cleanup(false); }
    function onOverlay(e) { if (e.target === overlay) cleanup(false); }

    btnConfirm.addEventListener("click", onConfirm);
    btnCancel.addEventListener("click", onCancel);
    overlay.addEventListener("click", onOverlay);
  });
}

// ===== Escape HTML =====
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
