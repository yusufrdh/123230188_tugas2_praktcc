// ===== Configuration =====
// GANTI URL DIBAWAH DENGAN URL CLOUD RUN BACKEND SETELAH DEPLOY
const API_BASE = "https://be-tugas3-tcc-188-720084965883.us-central1.run.app/api/v1/notes";

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
const btnScrollForm = document.querySelector("#btn-scroll-form");

// ===== Initialize =====
document.addEventListener("DOMContentLoaded", () => {
  getNotes();
});

// Scroll to form when "Buat Catatan" button is clicked
btnScrollForm.addEventListener("click", () => {
  document.querySelector("#form-section").scrollIntoView({ behavior: "smooth" });
  inputJudul.focus();
});

// ===== Form Submit =====
noteForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = noteForm.dataset.editId || "";
  const judul = inputJudul.value.trim();
  const isi = inputIsi.value.trim();

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
    showToast("Terjadi kesalahan");
  }
});

// ===== Cancel Edit =====
btnCancel.addEventListener("click", () => {
  resetForm();
});

// ===== Reset Form =====
function resetForm() {
  noteForm.reset();
  noteForm.dataset.editId = "";
  formTitle.textContent = "Tambah Catatan Baru";
  btnSubmit.textContent = "Simpan";
  btnCancel.style.display = "none";
}

// ===== Get Notes =====
async function getNotes() {
  loadingEl.style.display = "block";
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
    notes.forEach((note) => renderNote(note));
  } catch (error) {
    loadingEl.style.display = "none";
    emptyState.style.display = "block";
    notesCount.textContent = "0 catatan";
  }
}

// ===== Render Note Card =====
function renderNote(note) {
  const card = document.createElement("div");
  card.className = "note-card";

  const date = new Date(note.tanggal_dibuat).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  card.innerHTML = `
    <h3 class="note-title">${note.judul}</h3>
    <p class="note-content">${note.isi}</p>
    <div class="note-footer">
      <span class="note-date">${date}</span>
      <div class="note-actions">
        <button class="btn-edit" data-id="${note.id}">Edit</button>
        <button class="btn-delete" data-id="${note.id}">Hapus</button>
      </div>
    </div>
  `;

  // Edit handler
  card.querySelector(".btn-edit").addEventListener("click", () => {
    noteForm.dataset.editId = note.id;
    inputJudul.value = note.judul;
    inputIsi.value = note.isi;
    formTitle.textContent = "Edit Catatan";
    btnSubmit.textContent = "Perbarui";
    btnCancel.style.display = "inline-flex";
    document.querySelector("#form-section").scrollIntoView({ behavior: "smooth" });
    inputJudul.focus();
  });

  // Delete handler
  card.querySelector(".btn-delete").addEventListener("click", async () => {
    const confirmed = await showConfirm(`Hapus catatan "${note.judul}"?`);
    if (!confirmed) return;
    try {
      await axios.delete(`${API_BASE}/${note.id}`);
      showToast("Catatan berhasil dihapus");
      getNotes();
    } catch (error) {
      showToast("Gagal menghapus catatan");
    }
  });

  notesList.appendChild(card);
}

// ===== Toast =====
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ===== Custom Confirm Modal =====
function showConfirm(message) {
  return new Promise((resolve) => {
    const overlay = document.querySelector("#modal-overlay");
    const msgEl = document.querySelector("#modal-message");
    const btnConfirm = document.querySelector("#modal-confirm");
    const btnCancel = document.querySelector("#modal-cancel");

    msgEl.textContent = message;
    overlay.style.display = "flex";

    function cleanup() {
      overlay.style.display = "none";
      btnConfirm.removeEventListener("click", onConfirm);
      btnCancel.removeEventListener("click", onCancel);
    }

    function onConfirm() {
      cleanup();
      resolve(true);
    }

    function onCancel() {
      cleanup();
      resolve(false);
    }

    btnConfirm.addEventListener("click", onConfirm);
    btnCancel.addEventListener("click", onCancel);
  });
}
