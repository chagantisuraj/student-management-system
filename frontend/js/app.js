const API_BASE = '/students';

let isEditMode = false;
let deleteTargetId = null;
let allStudents = [];

document.addEventListener('DOMContentLoaded', () => {
  loadStudents();
});

async function loadStudents() {
  showLoader(true);
  try {
    const response = await fetch(API_BASE);
    const result = await response.json();

    if (result.success) {
      allStudents = result.data;
      renderTable(allStudents);
      updateCount(allStudents.length);
    } else {
      showToast('Failed to load students.', 'error');
    }
  } catch (error) {
    console.error('Load error:', error);
    showToast('Cannot connect to server. Is the backend running?', 'error');
  } finally {
    showLoader(false);
  }
}

async function handleSubmit() {
  clearErrors();

  const id = document.getElementById('studentId').value;
  const name = document.getElementById('studentName').value.trim();
  const rollNumber = document.getElementById('rollNumber').value.trim().toUpperCase();
  const branch = document.getElementById('branch').value;

  let hasError = false;

  if (!name || name.length < 2) {
    showFieldError('nameError', 'studentName', 'Name must be at least 2 characters.');
    hasError = true;
  }
  if (!rollNumber || rollNumber.length < 2) {
    showFieldError('rollError', 'rollNumber', 'Roll number is required.');
    hasError = true;
  }
  if (!branch) {
    showFieldError('branchError', 'branch', 'Please select a branch.');
    hasError = true;
  }

  if (hasError) return;

  const studentData = { name, roll_number: rollNumber, branch };
  setButtonLoading(true);

  try {
    let response, result;

    if (isEditMode) {
      response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
    } else {
      response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
    }

    result = await response.json();

    if (result.success) {
      showToast(result.message, 'success');
      resetForm();
      loadStudents();
    } else {
      showToast(result.message || 'Something went wrong.', 'error');
    }
  } catch (error) {
    console.error('Submit error:', error);
    showToast('Server error. Please try again.', 'error');
  } finally {
    setButtonLoading(false);
  }
}

function editStudent(id, name, rollNumber, branch) {
  isEditMode = true;

  document.getElementById('studentId').value = id;
  document.getElementById('studentName').value = name;
  document.getElementById('rollNumber').value = rollNumber;
  document.getElementById('branch').value = branch;

  document.getElementById('formTitle').textContent = 'Edit Student';
  document.getElementById('formSubtitle').textContent = `Editing: ${name}`;
  document.querySelector('#submitBtn .btn-text').textContent = 'Update Student';
  document.getElementById('cancelBtn').classList.remove('hidden');

  document.querySelector('.form-panel').style.borderColor = 'var(--accent)';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelEdit() {
  resetForm();
}

function showDeleteModal(id, name) {
  deleteTargetId = id;
  document.getElementById('deleteModalMsg').textContent =
    `Are you sure you want to delete "${name}"? This cannot be undone.`;
  document.getElementById('deleteModal').classList.remove('hidden');
}

async function confirmDelete() {
  if (!deleteTargetId) return;

  const idToDelete = deleteTargetId;
  closeDeleteModal();

  try {
    const response = await fetch(`${API_BASE}/${idToDelete}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (result.success) {
      showToast(result.message, 'success');
      loadStudents();
    } else {
      showToast(result.message || 'Delete failed.', 'error');
    }
  } catch (error) {
    console.error('Delete error:', error);
    showToast('Server error while deleting.', 'error');
  }
}

function closeDeleteModal() {
  deleteTargetId = null;
  document.getElementById('deleteModal').classList.add('hidden');
}

document.getElementById('deleteModal').addEventListener('click', function (e) {
  if (e.target === this) closeDeleteModal();
});

function renderTable(students) {
  const tbody = document.getElementById('tableBody');
  const tableWrap = document.getElementById('tableWrap');
  const emptyState = document.getElementById('emptyState');

  if (students.length === 0) {
    tableWrap.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  tableWrap.classList.remove('hidden');
  emptyState.classList.add('hidden');

  tbody.innerHTML = students.map((student, index) => {
    const date = formatDate(student.created_at);

    const safeName = escapeHTML(student.name);
    const safeRoll = escapeHTML(student.roll_number);
    const safeBranch = escapeHTML(student.branch);

    return `
      <tr class="row-new">
        <td>${index + 1}</td>
        <td><strong>${safeName}</strong></td>
        <td><span class="roll-badge">${safeRoll}</span></td>
        <td><span class="branch-tag">${safeBranch}</span></td>
        <td><span class="date-text">${date}</span></td>
        <td>
          <div class="action-cell">
            <button
              class="btn-edit"
              onclick="editStudent(
                ${student.id},
                '${safeName.replace(/'/g, "\\'")}',
                '${safeRoll}',
                '${safeBranch.replace(/'/g, "\\'")}'
              )"
            >Edit</button>
            <button
              class="btn-delete"
              onclick="showDeleteModal(${student.id}, '${safeName.replace(/'/g, "\\'")}')"
            >Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterTable() {
  const query = document.getElementById('searchInput').value.toLowerCase().trim();

  if (!query) {
    renderTable(allStudents);
    return;
  }

  const filtered = allStudents.filter(s =>
    s.name.toLowerCase().includes(query) ||
    s.roll_number.toLowerCase().includes(query) ||
    s.branch.toLowerCase().includes(query)
  );

  renderTable(filtered);
}

function resetForm() {
  isEditMode = false;

  document.getElementById('studentId').value = '';
  document.getElementById('studentName').value = '';
  document.getElementById('rollNumber').value = '';
  document.getElementById('branch').value = '';

  clearErrors();

  document.getElementById('formTitle').textContent = 'Add Student';
  document.getElementById('formSubtitle').textContent = 'Fill in the details below';
  document.querySelector('#submitBtn .btn-text').textContent = 'Add Student';
  document.getElementById('cancelBtn').classList.add('hidden');
  document.querySelector('.form-panel').style.borderColor = '';
}

function showLoader(show) {
  const loader = document.getElementById('tableLoader');
  if (show) {
    loader.classList.remove('hidden');
  } else {
    loader.classList.add('hidden');
  }
}

function updateCount(count) {
  document.getElementById('totalCount').textContent = count;
}

function showFieldError(errorId, inputId, message) {
  document.getElementById(errorId).textContent = message;
  document.getElementById(inputId).classList.add('error');
}

function clearErrors() {
  ['nameError', 'rollError', 'branchError'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
  ['studentName', 'rollNumber', 'branch'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('error');
  });
}

function setButtonLoading(loading) {
  const btn = document.getElementById('submitBtn');
  const btnText = btn.querySelector('.btn-text');
  const loader = btn.querySelector('.btn-loader');

  btn.disabled = loading;
  if (loading) {
    btnText.classList.add('hidden');
    loader.classList.remove('hidden');
  } else {
    btnText.classList.remove('hidden');
    loader.classList.add('hidden');
  }
}

let toastTimer = null;
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const icons = { success: '✓', error: '✕', info: 'ℹ' };

  toast.textContent = `${icons[type] || ''} ${message}`;
  toast.className = `toast ${type} show`;

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

function formatDate(isoString) {
  if (!isoString) return '—';
  const date = new Date(isoString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const active = document.activeElement;
    if (
      active &&
      (active.id === 'studentName' ||
        active.id === 'rollNumber' ||
        active.id === 'branch')
    ) {
      handleSubmit();
    }
  }
});
