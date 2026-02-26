const STORAGE_KEY = 'solicitudes_reportes_ef';
const puntosPermitidos = new Set(['10', '20', '40', '50']);
const formatosPermitidos = new Set(['Carátula', 'ESF', 'ERI', 'ORI', 'EFE']);

const form = document.getElementById('solicitudForm');
const tabla = document.getElementById('tablaSolicitudes');
const mensaje = document.getElementById('mensaje');
const exportBtn = document.getElementById('exportBtn');
const rowCount = document.getElementById('rowCount');
const descripcion = document.getElementById('descripcion');
const descCounter = document.getElementById('descCounter');
const corte = document.getElementById('corte');

function initYears() {
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= 2020; year -= 1) {
    const option = document.createElement('option');
    option.value = String(year);
    option.textContent = String(year);
    corte.appendChild(option);
  }
}

function getRows() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveRows(rows) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

function renderRows() {
  const rows = getRows();
  rowCount.textContent = `${rows.length} registro${rows.length === 1 ? '' : 's'}`;
  tabla.innerHTML = rows.map((row) => `
    <tr>
      <td>${row.titulo}</td>
      <td>${row.corte}</td>
      <td>${row.descripcion || ''}</td>
      <td>${row.puntosEntrada.join(', ')}</td>
      <td>${row.formatos.join(', ')}</td>
      <td>${row.estado}</td>
      <td>${new Date(row.fechaRegistro).toLocaleString('es-CO')}</td>
    </tr>
  `).join('');
}

function showMessage(text, ok = true) {
  mensaje.className = `mensaje ${ok ? 'ok' : 'error'}`;
  mensaje.textContent = text;
}

function updateCounter() {
  const len = descripcion.value.length;
  descCounter.textContent = `${len} / 500`;
}

function validate(payload) {
  const currentYear = new Date().getFullYear();
  if (!payload.titulo?.trim()) return 'Título es obligatorio.';
  if (!Number.isInteger(payload.corte) || payload.corte < 2020 || payload.corte > currentYear) {
    return `Corte debe estar entre 2020 y ${currentYear}.`;
  }
  if (!Array.isArray(payload.puntosEntrada) || payload.puntosEntrada.length === 0) return 'Debes seleccionar al menos un Puntos_Entrada.';
  if (!payload.puntosEntrada.every((value) => puntosPermitidos.has(value))) return 'Puntos_Entrada inválido.';
  if (!Array.isArray(payload.formatos) || payload.formatos.length === 0) return 'Debes seleccionar al menos un Formato.';
  if (!payload.formatos.every((value) => formatosPermitidos.has(value))) return 'Formato inválido.';
  if (payload.descripcion && payload.descripcion.length > 500) return 'Descripción supera 500 caracteres.';
  return null;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const payload = {
    titulo: form.titulo.value.trim(),
    corte: parseInt(form.corte.value, 10),
    descripcion: form.descripcion.value.trim(),
    puntosEntrada: [form.puntosEntrada.value],
    formatos: [form.formatos.value],
    fechaRegistro: new Date().toISOString(),
    estado: 'Pendiente'
  };

  const error = validate(payload);
  if (error) {
    showMessage(error, false);
    return;
  }

  const rows = getRows();
  rows.unshift(payload);
  saveRows(rows);
  renderRows();
  form.reset();
  updateCounter();
  showMessage('Solicitud guardada correctamente en el prototipo.');
});

descripcion.addEventListener('input', updateCounter);

exportBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(getRows(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'solicitudes_reportes_ef.json';
  a.click();
  URL.revokeObjectURL(url);
});

initYears();
updateCounter();
renderRows();
