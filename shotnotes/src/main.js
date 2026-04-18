'use strict';

const cs = (typeof CSInterface !== 'undefined') ? new CSInterface() : {
  evalScript: (script, cb) => { if (cb) cb('null'); },
  addEventListener: () => {}
};

function evalScript(fn, ...args) {
  return new Promise((resolve) => {
    const argStr = args.map(a => JSON.stringify(a)).join(', ');
    cs.evalScript(`${fn}(${argStr})`, (result) => {
      resolve(result === 'undefined' ? null : result);
    });
  });
}

const DEFAULT_PROJECT_INFO = { client: '', project: '', frameRate: '', resolution: '', deadline: '', frameio: '' };

let state = {
  compNotes: {}, globalNotes: [], projectInfo: { ...DEFAULT_PROJECT_INFO },
  activeComp: null, projectName: null,
  composeColor: { comp: 'orange', global: 'orange' },
  stampedTC: { comp: null, global: null },
  activeTab: 'comp', editingProjectInfo: false,
};

function makeNote(text, color, tc, compName, compId, isFrameio = false) {
  return {
    id: Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    text: text.trim(), color, tc: tc || null,
    compName: compName || null, compId: compId || null,
    isFrameio, hasMarker: false, createdAt: Date.now()
  };
}

let saveTimer = null;

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(commitSave, 800);
}

async function commitSave() {
  if (!state.projectName) return;
  const payload = JSON.stringify({
    compNotes: state.compNotes, globalNotes: state.globalNotes,
    projectInfo: state.projectInfo, savedAt: Date.now()
  });
  await evalScript('writeNotesFile', state.projectName, payload);
}

async function loadNotesForProject(projectName) {
  if (!projectName) return;
  const raw = await evalScript('readNotesFile', projectName);
  if (!raw || raw === 'null') return;
  try {
    const data = JSON.parse(raw);
    if (data.compNotes)   state.compNotes   = data.compNotes;
    if (data.globalNotes) state.globalNotes = data.globalNotes;
    if (data.projectInfo) state.projectInfo = { ...DEFAULT_PROJECT_INFO, ...data.projectInfo };
  } catch (e) { console.warn('ShotNotes: could not parse saved notes', e); }
}

let lastCompId = null;

async function pollAE() {
  const raw = await evalScript('getActiveCompInfo');
  const comp = (raw && raw !== 'null') ? JSON.parse(raw) : null;
  const tcEl    = document.getElementById('comp-tc');
  const stampEl = document.getElementById('comp-stamp-tc');
  const dot     = document.getElementById('comp-status-dot');

  if (comp) {
    tcEl.textContent = comp.currentTC;
    dot.classList.add('active');
    document.getElementById('comp-name').textContent = comp.name;
    if (!state.stampedTC.comp && stampEl) stampEl.textContent = comp.currentTC;

    if (comp.id !== lastCompId) {
      lastCompId = comp.id;
      state.activeComp = comp;
      const rawProject = await evalScript('getProjectInfo');
      if (rawProject && rawProject !== 'null') {
        const projectData = JSON.parse(rawProject);
        if (projectData.name !== state.projectName) {
          state.projectName = projectData.name;
          state.projectInfo.project    = state.projectInfo.project    || projectData.name;
          state.projectInfo.frameRate  = state.projectInfo.frameRate  || (Math.round(projectData.frameRate * 100) / 100) + ' fps';
          state.projectInfo.resolution = state.projectInfo.resolution || (projectData.width + '×' + projectData.height);
          await loadNotesForProject(state.projectName);
        }
      }
      renderCompNotes();
      renderProjectInfo();
    } else {
      state.activeComp = comp;
    }
  } else {
    tcEl.textContent = '--:--:--:--';
    dot.classList.remove('active');
    document.getElementById('comp-name').textContent = 'No active comp';
    if (!state.stampedTC.comp && stampEl) stampEl.textContent = '--:--:--:--';
    state.activeComp = null;
  }
}

function renderCompNotes(filter = '') {
  const listEl  = document.getElementById('comp-notes-list');
  const emptyEl = document.getElementById('comp-empty');
  const compId  = state.activeComp ? state.activeComp.id : null;
  const notes   = compId ? (state.compNotes[compId] || []) : [];
  const frameioNotes = notes.filter(n => n.isFrameio && matchesFilter(n, filter));
  const userNotes    = notes.filter(n => !n.isFrameio && matchesFilter(n, filter));
  Array.from(listEl.querySelectorAll('.section-header, .note-item')).forEach(el => el.remove());
  if (frameioNotes.length === 0 && userNotes.length === 0) { emptyEl.style.display = 'block'; return; }
  emptyEl.style.display = 'none';
  if (frameioNotes.length > 0) { listEl.appendChild(makeSectionHeader('Frame.io', frameioNotes.length)); frameioNotes.forEach(n => listEl.appendChild(makeNoteEl(n, 'comp'))); }
  if (userNotes.length > 0)    { listEl.appendChild(makeSectionHeader('Notes', userNotes.length)); userNotes.forEach(n => listEl.appendChild(makeNoteEl(n, 'comp'))); }
}

function renderGlobalNotes(filter = '') {
  const listEl  = document.getElementById('global-notes-list');
  const emptyEl = document.getElementById('global-empty');
  const notes   = state.globalNotes.filter(n => matchesFilter(n, filter));
  Array.from(listEl.querySelectorAll('.section-header, .note-item')).forEach(el => el.remove());
  if (notes.length === 0) { emptyEl.style.display = 'block'; return; }
  emptyEl.style.display = 'none';
  listEl.appendChild(makeSectionHeader('Notes', notes.length));
  notes.forEach(n => listEl.appendChild(makeNoteEl(n, 'global')));
}

function renderProjectInfo() {
  const grid   = document.getElementById('pi-grid');
  const info   = state.projectInfo;
  const editing = state.editingProjectInfo;
  const fields = [
    { key: 'client', label: 'Client' }, { key: 'project', label: 'Project' },
    { key: 'frameRate', label: 'Framerate' }, { key: 'resolution', label: 'Resolution' },
    { key: 'deadline', label: 'Deadline' }, { key: 'frameio', label: 'Frame.io' }
  ];
  grid.innerHTML = fields.map(f => {
    const val = info[f.key]; const isEmpty = !val;
    if (editing) return `<div class="pi-field"><div class="pi-key">${f.label}</div><input class="pi-input" data-field="${f.key}" value="${val || ''}" placeholder="—"/></div>`;
    return `<div class="pi-field"><div class="pi-key">${f.label}</div><div class="pi-val${isEmpty ? ' empty' : ''}">${isEmpty ? 'not set' : val}</div></div>`;
  }).join('');
  if (editing) {
    grid.querySelectorAll('.pi-input').forEach(input => {
      input.addEventListener('input', (e) => { state.projectInfo[e.target.dataset.field] = e.target.value; scheduleSave(); });
    });
  }
}

function makeSectionHeader(label, count) {
  const el = document.createElement('div');
  el.className = 'section-header';
  el.innerHTML = `<span class="section-label">${label}</span><div class="section-line"></div><div class="section-count">${count}</div>`;
  return el;
}

const COLOR_LABELS = { orange: 'Issue', blue: 'Internal', red: 'Problem', green: 'Reference', grey: 'General', frameio: 'Client' };

function makeNoteEl(note, context) {
  const el = document.createElement('div');
  el.className = 'note-item';
  el.dataset.id = note.id;
  const color = note.isFrameio ? 'frameio' : note.color;
  const label = COLOR_LABELS[color] || color;
  let metaHtml = '';
  if (note.tc) metaHtml += `<button class="note-tc" data-tc="${note.tc}" data-comp-id="${note.compId || ''}">${note.tc}</button>`;
  if (note.compName && context === 'global') metaHtml += `<span class="note-comp">${note.compName}</span>`;
  metaHtml += `<span class="note-label ${color}">${label}</span>`;
  let extraHtml = '';
  if (note.isFrameio) extraHtml = `<div class="frameio-badge"><svg viewBox="0 0 10 10" fill="currentColor"><rect x="1" y="1" width="8" height="8" rx="1.5"/></svg>frame.io import</div>`;
  if (note.hasMarker) extraHtml += `<div class="marker-dot"></div>`;
  el.innerHTML = `
    <div class="note-stripe ${color}"></div>
    <div class="note-body">
      <div class="note-meta">${metaHtml}</div>
      <div class="note-text">${escapeHtml(note.text)}</div>
      ${extraHtml}
    </div>
    <button class="note-delete-btn" data-id="${note.id}" data-context="${context}" title="Delete">
      <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M2 2l8 8M10 2l-8 8"/></svg>
    </button>`;
  const tcBtn = el.querySelector('.note-tc');
  if (tcBtn) {
    tcBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const compId = tcBtn.dataset.compId;
      if (compId && state.activeComp && compId !== state.activeComp.id) await evalScript('jumpToCompAndTC', compId, tcBtn.dataset.tc);
      else await evalScript('jumpToTC', tcBtn.dataset.tc);
      tcBtn.style.color = '#ff8c40';
      setTimeout(() => tcBtn.style.color = '', 300);
    });
  }
  el.querySelector('.note-text').addEventListener('click', (e) => { e.currentTarget.classList.toggle('expanded'); });
  el.querySelector('.note-delete-btn').addEventListener('click', (e) => { e.stopPropagation(); deleteNote(note.id, context); });
  return el;
}

function matchesFilter(note, filter) {
  if (!filter) return true;
  const f = filter.toLowerCase();
  return (note.text && note.text.toLowerCase().includes(f)) || (note.tc && note.tc.includes(f)) || (note.compName && note.compName.toLowerCase().includes(f));
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function addCompNote(withMarker = false) {
  const input  = document.getElementById('comp-note-input');
  const text   = input.value.trim();
  if (!text && !withMarker) return;
  const compId   = state.activeComp ? state.activeComp.id : null;
  const compName = state.activeComp ? state.activeComp.name : null;
  const tc       = state.stampedTC.comp || (state.activeComp ? state.activeComp.currentTC : null);
  const color    = state.composeColor.comp;
  if (withMarker && tc) await evalScript('addMarkerAtTC', tc, text || 'ShotNotes marker');
  if (!text) return;
  const note = makeNote(text, color, tc, compName, compId);
  note.hasMarker = withMarker && !!tc;
  if (!compId) { state.globalNotes.unshift(note); renderGlobalNotes(); }
  else { if (!state.compNotes[compId]) state.compNotes[compId] = []; state.compNotes[compId].unshift(note); renderCompNotes(); }
  input.value = '';
  state.stampedTC.comp = null;
  const stampEl = document.getElementById('comp-stamp-tc');
  if (stampEl && state.activeComp) stampEl.textContent = state.activeComp.currentTC;
  scheduleSave();
}

function addGlobalNote() {
  const input = document.getElementById('global-note-input');
  const text  = input.value.trim();
  if (!text) return;
  const tc = state.stampedTC.global;
  const color = state.composeColor.global;
  const compId   = state.activeComp ? state.activeComp.id : null;
  const compName = state.activeComp ? state.activeComp.name : null;
  const note = makeNote(text, color, tc, compName, compId);
  state.globalNotes.unshift(note);
  input.value = '';
  state.stampedTC.global = null;
  renderGlobalNotes();
  scheduleSave();
}

function deleteNote(id, context) {
  if (context === 'comp') {
    const compId = state.activeComp ? state.activeComp.id : null;
    if (!compId || !state.compNotes[compId]) return;
    state.compNotes[compId] = state.compNotes[compId].filter(n => n.id !== id);
    renderCompNotes();
  } else {
    state.globalNotes = state.globalNotes.filter(n => n.id !== id);
    renderGlobalNotes();
  }
  scheduleSave();
}

function parseFrameioCSV(text) {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  const header  = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
  const tcIdx   = header.findIndex(h => h.includes('timecode') || h.includes('time'));
  const textIdx = header.findIndex(h => h.includes('comment') || h.includes('note') || h.includes('text'));
  if (textIdx === -1) return [];
  const notes = [];
  for (let i = 1; i < lines.length; i++) {
    const cols  = lines[i].match(/(".*?"|[^,]+)(?=,|$)/g) || [];
    const clean = cols.map(c => c.replace(/^"|"$/g, '').trim());
    const text  = clean[textIdx];
    const tc    = tcIdx >= 0 ? clean[tcIdx] : null;
    if (text) notes.push({ text, tc: tc || null });
  }
  return notes;
}

function importFrameioNotes(csvText) {
  const parsed = parseFrameioCSV(csvText);
  if (!parsed.length) { alert('No comments found in this CSV.'); return; }
  const compId   = state.activeComp ? state.activeComp.id : 'global';
  const compName = state.activeComp ? state.activeComp.name : null;
  const newNotes = parsed.map(p => makeNote(p.text, 'blue', p.tc, compName, compId === 'global' ? null : compId, true));
  if (compId === 'global') { state.globalNotes = [...newNotes, ...state.globalNotes]; renderGlobalNotes(); }
  else { if (!state.compNotes[compId]) state.compNotes[compId] = []; state.compNotes[compId] = [...newNotes, ...state.compNotes[compId]]; renderCompNotes(); }
  scheduleSave();
}

function wireEvents() {
  document.querySelectorAll('.tab').forEach(btn => {
    btn.addEventListener('mousedown', (e) => { e.preventDefault(); e.stopPropagation();
      state.activeTab = btn.dataset.tab;
      document.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active'); if (btn.dataset.tab === 'project') renderProjectInfo();
    });
  });
  document.querySelectorAll('#tab-comp .color-dot').forEach(dot => {
    dot.addEventListener('click', () => { document.querySelectorAll('#tab-comp .color-dot').forEach(d => d.classList.remove('selected')); dot.classList.add('selected'); state.composeColor.comp = dot.dataset.color; });
  });
  document.querySelectorAll('#tab-global .color-dot').forEach(dot => {
    dot.addEventListener('click', () => { document.querySelectorAll('#tab-global .color-dot').forEach(d => d.classList.remove('selected')); dot.classList.add('selected'); state.composeColor.global = dot.dataset.color; });
  });
  document.getElementById('comp-tc-stamp').addEventListener('click', () => {
    if (!state.activeComp) return;
    state.stampedTC.comp = state.activeComp.currentTC;
    document.getElementById('comp-stamp-tc').textContent = state.activeComp.currentTC;
  });
  document.getElementById('comp-add-btn').addEventListener('click', () => addCompNote(false));
  document.getElementById('comp-note-input').addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addCompNote(false); });
  document.getElementById('comp-marker-only-btn').addEventListener('click', () => addCompNote(true));
  document.getElementById('global-add-btn').addEventListener('click', addGlobalNote);
  document.getElementById('global-note-input').addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) addGlobalNote(); });
  document.getElementById('comp-search').addEventListener('input', (e) => { renderCompNotes(e.target.value); });
  document.getElementById('global-search').addEventListener('input', (e) => { renderGlobalNotes(e.target.value); });
  document.getElementById('pi-edit-btn').addEventListener('click', () => { state.editingProjectInfo = !state.editingProjectInfo; renderProjectInfo(); if (!state.editingProjectInfo) scheduleSave(); });
  document.getElementById('btn-import-frameio').addEventListener('click', () => { document.getElementById('frameio-file-input').click(); });
  document.getElementById('frameio-file-input').addEventListener('change', (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { importFrameioNotes(ev.target.result); e.target.value = ''; };
    reader.readAsText(file);
  });
}

async function init() {
  wireEvents();
  renderProjectInfo();
  await pollAE();
  setInterval(pollAE, 2500);
}

document.addEventListener('DOMContentLoaded', init);
