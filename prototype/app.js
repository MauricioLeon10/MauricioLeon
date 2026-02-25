const KEY = 'solicitudes_reportes_ef';
const puntosOK = new Set(['10','20','40','50']);
const formatosOK = new Set(['Carátula','ESF','ERI','ORI','EFE']);

const form = document.getElementById('solicitudForm');
const tabla = document.getElementById('tablaSolicitudes');
const msg = document.getElementById('mensaje');

function getRows(){ return JSON.parse(localStorage.getItem(KEY) || '[]'); }
function saveRows(rows){ localStorage.setItem(KEY, JSON.stringify(rows)); }

function render(){
  const rows = getRows();
  tabla.innerHTML = rows.map(r => `
    <tr>
      <td>${r.titulo}</td><td>${r.corte}</td><td>${r.descripcion||''}</td>
      <td>${r.puntosEntrada}</td><td>${r.formatos}</td><td>${new Date(r.fecha).toLocaleString('es-CO')}</td>
    </tr>
  `).join('');
}

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const data = {
    titulo: document.getElementById('titulo').value.trim(),
    corte: Number(document.getElementById('corte').value),
    descripcion: document.getElementById('descripcion').value.trim(),
    puntosEntrada: document.getElementById('puntosEntrada').value,
    formatos: document.getElementById('formatos').value,
    fecha: new Date().toISOString()
  };
  const year = new Date().getFullYear();
  if(!data.titulo) return msg.textContent='Título es obligatorio';
  if(data.corte < 2020 || data.corte > year) return msg.textContent=`Corte debe estar entre 2020 y ${year}`;
  if(!puntosOK.has(data.puntosEntrada)) return msg.textContent='Puntos inválido';
  if(!formatosOK.has(data.formatos)) return msg.textContent='Formato inválido';
  if(data.descripcion.length > 500) return msg.textContent='Descripción supera 500 caracteres';

  const rows = getRows();
  rows.unshift(data);
  saveRows(rows);
  render();
  form.reset();
  msg.textContent='Guardado correctamente';
});

document.getElementById('exportBtn').addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(getRows(), null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'solicitudes_reportes_ef.json';
  a.click();
  URL.revokeObjectURL(url);
});

render();
