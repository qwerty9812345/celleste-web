const SkillsTable = (() => {
  const SKILLS = [
    { key: 'liderstvo', name: 'Лидерство', icon: '👑', cat: 'high', weight: 5 },
    { key: 'komanda', name: 'Команда', icon: '🤝', cat: 'high', weight: 5 },
    { key: 'resheniya', name: 'Решения', icon: '⚡', cat: 'high', weight: 5 },
    { key: 'result', name: 'Результат', icon: '🎯', cat: 'high', weight: 5 },
    { key: 'nastav', name: 'Наставник', icon: '📚', cat: 'high', weight: 5 },
    { key: 'client', name: 'Клиент', icon: '💎', cat: 'high', weight: 5 },
    { key: 'strateg', name: 'Стратег', icon: '🧠', cat: 'high', weight: 5 },
    { key: 'adapt', name: 'Адаптивность', icon: '🔄', cat: 'mid', weight: 4 },
    { key: 'planir', name: 'Планирование', icon: '📋', cat: 'mid', weight: 4 },
    { key: 'kommunik', name: 'Коммуникация', icon: '💬', cat: 'mid', weight: 4 },
    { key: 'analiz', name: 'Анализ', icon: '🔍', cat: 'mid', weight: 4 },
    { key: 'kreativ', name: 'Креатив', icon: '🎨', cat: 'mid', weight: 4 },
    { key: 'konflikt', name: 'Конфликты', icon: '🕊️', cat: 'mid', weight: 4 },
    { key: 'motiv', name: 'Мотивация', icon: '🔥', cat: 'mid', weight: 4 },
    { key: 'organiz', name: 'Организация', icon: '📊', cat: 'mid', weight: 4 },
    { key: 'obuch', name: 'Обучаемость', icon: '🧪', cat: 'mid', weight: 4 },
    { key: 'otvets', name: 'Ответственность', icon: '💪', cat: 'mid', weight: 4 },
    { key: 'empath', name: 'Эмпатия', icon: '❤️', cat: 'mid', weight: 4 },
    { key: 'time', name: 'Тайм-менеджмент', icon: '⏰', cat: 'low', weight: 3 },
    { key: 'public', name: 'Публичность', icon: '🎤', cat: 'low', weight: 3 },
    { key: 'tech', name: 'Техничность', icon: '🛠️', cat: 'low', weight: 3 },
    { key: 'crossf', name: 'Кросс-функц', icon: '🔗', cat: 'low', weight: 3 },
    { key: 'stress', name: 'Стресс', icon: '🧘', cat: 'low', weight: 3 },
    { key: 'deleg', name: 'Делегирование', icon: '📤', cat: 'low', weight: 3 },
    { key: 'feedback', name: 'Фидбек', icon: '💡', cat: 'low', weight: 3 }
  ];

  const CATS = {
    high: { label: 'Высокий', weight: 5 },
    mid: { label: 'Средний', weight: 4 },
    low: { label: 'Низкий', weight: 3 }
  };

  const COLORS = {
    1: '#ff4444', 2: '#ff8800', 3: '#ffbb33', 4: '#00C851', 5: '#007E33'
  };

  let employees = [];
  let catFilter = 'all';
  let searchQuery = '';
  let ratingFilter = 0;
  let canEdit = false;
  let isLoading = false;

  function catWeight(cat) { return CATS[cat] ? CATS[cat].weight : 0; }

  function getColor(val) { return COLORS[val] || 'transparent'; }

  function getSumClass(total) {
    if (total >= 400) return 'sum-green';
    if (total >= 250) return 'sum-yellow';
    return 'sum-red';
  }

  function calcSums(sk) {
    if (!sk) return { high: 0, mid: 0, low: 0, total: 0 };
    let high = 0, mid = 0, low = 0;
    SKILLS.forEach(s => {
      const v = parseInt(sk[s.key]) || 0;
      const w = catWeight(s.cat);
      if (s.cat === 'high') high += v * w;
      else if (s.cat === 'mid') mid += v * w;
      else low += v * w;
    });
    return { high, mid, low, total: high + mid + low };
  }

  function skillSum(sk, cat) {
    if (!sk) return 0;
    let sum = 0;
    SKILLS.forEach(s => {
      if (cat && s.cat !== cat) return;
      sum += (parseInt(sk[s.key]) || 0) * catWeight(s.cat);
    });
    return sum;
  }

  function avgTotal() {
    if (!employees.length) return 0;
    return Math.round(employees.reduce((a, e) => a + calcSums(e).total, 0) / employees.length);
  }

  function bestTotal() {
    if (!employees.length) return 0;
    return Math.max(...employees.map(e => calcSums(e).total));
  }

  function getRanked() {
    const sorted = [...employees].sort((a, b) => calcSums(b).total - calcSums(a).total);
    const filtered = sorted.filter(e => {
      if (searchQuery && !e.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (ratingFilter > 0) {
        const hasVal = SKILLS.some(s => (parseInt(e[s.key]) || 0) === ratingFilter);
        if (!hasVal) return false;
      }
      return true;
    });
    return filtered;
  }

  async function loadEmployees() {
    try {
      isLoading = true;
      if (document.getElementById('skillsLoading')) {
        document.getElementById('skillsLoading').style.display = 'block';
      }
      const snap = await db.collection('employees').orderBy('name').get();
      employees = [];
      snap.forEach(doc => {
        const d = doc.data();
        employees.push({ id: doc.id, ...d });
      });
    } catch (err) {
      console.error('Firestore load error:', err);
      showError('Не удалось загрузить данные. Проверьте подключение к Firebase.');
    } finally {
      isLoading = false;
      if (document.getElementById('skillsLoading')) {
        document.getElementById('skillsLoading').style.display = 'none';
      }
    }
  }

  async function saveEmployee(id, data) {
    try {
      data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('employees').doc(id).update(data);
    } catch (err) {
      console.error('Firestore save error:', err);
      showError('Ошибка сохранения');
    }
  }

  async function addEmployee(name, skills) {
    try {
      const doc = {
        name,
        ...skills,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      const ref = await db.collection('employees').add(doc);
      employees.push({ id: ref.id, ...doc });
      render();
      return true;
    } catch (err) {
      console.error('Firestore add error:', err);
      showError('Ошибка добавления сотрудника');
      return false;
    }
  }

  async function deleteEmployee(id) {
    try {
      await db.collection('employees').doc(id).delete();
      employees = employees.filter(e => e.id !== id);
      render();
    } catch (err) {
      console.error('Firestore delete error:', err);
      showError('Ошибка удаления');
    }
  }

  function showError(msg) {
    const el = document.getElementById('skillsError');
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
      setTimeout(() => { el.style.display = 'none'; }, 5000);
    }
  }

  function renderStats(ranked) {
    const container = document.getElementById('skillsStats');
    if (!container) return;
    const total = employees.length;
    const avg = avgTotal();
    const best = bestTotal();
    const max = 500;
    container.innerHTML = `
      <div class="stat-card"><span class="stat-icon">👥</span><div class="stat-val">${total}</div><div class="stat-label">Участников</div></div>
      <div class="stat-card"><span class="stat-icon">📊</span><div class="stat-val">${avg}</div><div class="stat-label">Средний балл</div></div>
      <div class="stat-card"><span class="stat-icon">🏆</span><div class="stat-val">${best}</div><div class="stat-label">Лучший результат</div></div>
      <div class="stat-card"><span class="stat-icon">🎯</span><div class="stat-val">${max}</div><div class="stat-label">Максимум</div></div>
    `;
  }

  function renderTable(ranked) {
    const wrapper = document.getElementById('skillsTableWrapper');
    if (!wrapper) return;
    if (!ranked.length) {
      wrapper.innerHTML = '<div class="empty-state">Нет участников. Нажмите "Добавить участника" чтобы начать.</div>';
      return;
    }
    const visibleSkills = catFilter === 'all' ? SKILLS : SKILLS.filter(s => s.cat === catFilter);
    let html = '<table class="skills-table"><thead><tr><th class="sticky-col">Участник</th>';
    visibleSkills.forEach(s => {
      html += `<th class="skill-header cat-${s.cat}" title="${s.name} (вес ${s.weight})">${s.icon}</th>`;
    });
    const showHigh = catFilter === 'all' || catFilter === 'high';
    const showMid = catFilter === 'all' || catFilter === 'mid';
    const showLow = catFilter === 'all' || catFilter === 'low';
    if (showHigh) html += '<th class="sum-col cat-high">Σ В</th>';
    if (showMid) html += '<th class="sum-col cat-mid">Σ С</th>';
    if (showLow) html += '<th class="sum-col cat-low">Σ Н</th>';
    html += '<th class="sum-col">Σ</th>';
    if (canEdit) html += '<th class="actions-col"></th>';
    html += '</tr></thead><tbody>';
    ranked.forEach((emp, idx) => {
      const sums = calcSums(emp);
      const rank = idx + 1;
      let rankBadge = '';
      if (ranked.length >= 3 && rank <= 3) {
        const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
        rankBadge = `<span class="rank-badge rank-${rank}">${medals[rank]}</span>`;
      }
      html += `<tr data-id="${emp.id}">
        <td class="sticky-col name-cell">${rankBadge} ${emp.name}</td>`;
      visibleSkills.forEach(s => {
        const val = parseInt(emp[s.key]) || 0;
        const color = getColor(val);
        const editable = canEdit ? 'contenteditable="true" data-key="' + s.key + '"' : '';
        html += `<td class="skill-cell" ${editable} style="${val ? 'background:' + color + ';color:#fff' : ''}" data-val="${val}">${val || ''}</td>`;
      });
      if (showHigh) html += `<td class="sum-cell cat-high ${getSumClass(sums.high)}">${sums.high}</td>`;
      if (showMid) html += `<td class="sum-cell cat-mid ${getSumClass(sums.mid)}">${sums.mid}</td>`;
      if (showLow) html += `<td class="sum-cell cat-low ${getSumClass(sums.low)}">${sums.low}</td>`;
      html += `<td class="sum-cell total ${getSumClass(sums.total)}">${sums.total}</td>`;
      if (canEdit) {
        html += `<td class="actions-col"><button class="btn-icon btn-delete" data-id="${emp.id}" title="Удалить">✕</button></td>`;
      }
      html += '</tr>';
    });
    html += '</tbody></table>';
    wrapper.innerHTML = html;
    bindTableEvents();
  }

  function bindTableEvents() {
    if (canEdit) {
      document.querySelectorAll('.skill-cell[contenteditable]').forEach(cell => {
        cell.addEventListener('blur', onCellEdit);
        cell.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') { e.preventDefault(); cell.blur(); }
          if (e.key === 'Escape') { cell.textContent = cell.dataset.val || ''; cell.blur(); }
        });
      });
      document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.id;
          const emp = employees.find(e => e.id === id);
          if (emp && confirm(`Удалить участника "${emp.name}"?`)) deleteEmployee(id);
        });
      });
    }
  }

  async function onCellEdit(e) {
    const cell = e.target;
    const val = parseInt(cell.textContent.trim());
    const valid = !isNaN(val) && val >= 0 && val <= 5;
    if (!valid) {
      cell.textContent = cell.dataset.val || '';
      return;
    }
    const key = cell.dataset.key;
    const tr = cell.closest('tr');
    const id = tr.dataset.id;
    if (!id || !key) return;
    cell.dataset.val = val;
    const update = { [key]: val || 0 };
    await saveEmployee(id, update);
    const emp = employees.find(e => e.id === id);
    if (emp) {
      emp[key] = val || 0;
      updateRow(id);
    }
  }

  function updateRow(id) {
    const ranked = getRanked();
    renderStats(ranked);
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    const sums = calcSums(emp);
    const tr = document.querySelector(`tr[data-id="${id}"]`);
    if (!tr) { renderTable(ranked); return; }
    SKILLS.forEach(s => {
      const val = parseInt(emp[s.key]) || 0;
      const color = getColor(val);
      const cell = tr.querySelector(`[data-key="${s.key}"]`);
      if (cell) {
        cell.textContent = val || '';
        cell.dataset.val = val;
        cell.style.background = val ? color : 'transparent';
        cell.style.color = val ? '#fff' : '';
      }
    });
    ['high', 'mid', 'low'].forEach(cat => {
      const cell = tr.querySelector(`.sum-cell.cat-${cat}`);
      if (cell) {
        cell.textContent = sums[cat];
        cell.className = `sum-cell cat-${cat} ${getSumClass(sums[cat])}`;
      }
    });
    const totalCell = tr.querySelector('.sum-cell.total');
    if (totalCell) {
      totalCell.textContent = sums.total;
      totalCell.className = `sum-cell total ${getSumClass(sums.total)}`;
    }
    reorderRows();
  }

  function reorderRows() {
    const ranked = getRanked();
    const tbody = document.querySelector('.skills-table tbody');
    if (!tbody) return;
    const rows = {};
    document.querySelectorAll('.skills-table tbody tr').forEach(tr => {
      rows[tr.dataset.id] = tr;
    });
    ranked.forEach((emp, idx) => {
      const tr = rows[emp.id];
      if (!tr) return;
      const rank = idx + 1;
      let badge = tr.querySelector('.rank-badge');
      const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };
      if (ranked.length >= 3 && rank <= 3) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = `rank-badge rank-${rank}`;
          tr.querySelector('.name-cell').insertBefore(badge, tr.querySelector('.name-cell').firstChild);
        }
        badge.textContent = medals[rank];
        badge.className = `rank-badge rank-${rank}`;
      } else if (badge) {
        badge.remove();
      }
      tbody.appendChild(tr);
    });
  }

  function render() {
    if (!document.getElementById('skillsTableWrapper')) return;
    const ranked = getRanked();
    renderStats(ranked);
    renderTable(ranked);
  }

  function showAddModal() {
    const modal = document.getElementById('addModal');
    if (!modal) return;
    const form = document.getElementById('addForm');
    if (!form) return;
    let html = '<div class="form-group"><label>Имя участника</label><input type="text" id="addName" class="form-input" placeholder="Введите имя" required></div>';
    html += '<div class="skills-grid">';
    SKILLS.forEach(s => {
      html += `<div class="skill-input-group">
        <label>${s.icon} ${s.name}</label>
        <select class="skill-select" data-key="${s.key}">
          <option value="0">-</option>
          ${[1,2,3,4,5].map(v => `<option value="${v}" ${v === 3 ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
      </div>`;
    });
    html += '</div>';
    html += '<div class="form-actions"><button id="addSubmitBtn" class="btn btn-primary">Добавить</button><button class="btn btn-outline modal-close-btn" type="button">Отмена</button></div>';
    form.innerHTML = html;
    modal.style.display = 'flex';

    document.getElementById('addSubmitBtn').onclick = async () => {
      const name = document.getElementById('addName').value.trim();
      if (!name) { showError('Введите имя'); return; }
      const skills = {};
      document.querySelectorAll('.skill-select').forEach(sel => {
        skills[sel.dataset.key] = parseInt(sel.value);
      });
      document.getElementById('addSubmitBtn').disabled = true;
      await addEmployee(name, skills);
      modal.style.display = 'none';
    };
    modal.querySelector('.modal-close')?.addEventListener('click', () => { modal.style.display = 'none'; });
    modal.querySelector('.modal-close-btn')?.addEventListener('click', () => { modal.style.display = 'none'; });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
  }

  function showCsvModal() {
    const modal = document.getElementById('csvModal');
    if (!modal) return;
    modal.style.display = 'flex';
    const textarea = document.getElementById('csvInput');
    const preview = document.getElementById('csvPreview');
    const importBtn = document.getElementById('csvImportBtnModal');
    if (textarea) textarea.value = '';
    if (preview) preview.innerHTML = '';
    if (importBtn) importBtn.style.display = 'none';

    if (textarea) {
      textarea.oninput = () => {
        const lines = textarea.value.trim().split('\n');
        if (lines.length < 2) { if (preview) preview.innerHTML = ''; if (importBtn) importBtn.style.display = 'none'; return; }
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const nameIdx = headers.indexOf('name');
        if (nameIdx === -1) { if (preview) preview.innerHTML = '<div class="error">Первый столбец должен быть "name"</div>'; return; }
        const data = [];
        for (let i = 1; i < lines.length; i++) {
          const vals = lines[i].split(',').map(v => v.trim());
          if (vals.length < 2) continue;
          const entry = { name: vals[nameIdx] };
          let valid = true;
          headers.forEach((h, idx) => {
            if (idx === nameIdx) return;
            const sk = SKILLS.find(s => s.key === h || s.name.toLowerCase() === h);
            if (sk) {
              const v = parseInt(vals[idx]);
              entry[sk.key] = (v >= 0 && v <= 5) ? v : 0;
            }
          });
          data.push(entry);
        }
        if (preview) {
          preview.innerHTML = '<h4>Предпросмотр (' + data.length + ' участников):</h4>';
          data.forEach(d => {
            preview.innerHTML += '<div class="csv-preview-item">' + d.name + ' — навыков: ' + SKILLS.filter(s => d[s.key] > 0).length + '</div>';
          });
        }
        if (importBtn) {
          importBtn.style.display = 'inline-block';
          importBtn.onclick = async () => {
            importBtn.disabled = true;
            for (const d of data) {
              const skills = {};
              SKILLS.forEach(s => { skills[s.key] = d[s.key] || 0; });
              await addEmployee(d.name, skills);
            }
            modal.style.display = 'none';
            importBtn.disabled = false;
          };
        }
      };
    }
    modal.querySelector('.modal-close')?.addEventListener('click', () => { modal.style.display = 'none'; });
    modal.querySelector('.modal-close-btn')?.addEventListener('click', () => { modal.style.display = 'none'; });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
  }

  function init(options) {
    canEdit = options.canEdit || false;

    document.getElementById('addEmployeeBtn')?.addEventListener('click', showAddModal);
    document.getElementById('csvImportBtn')?.addEventListener('click', () => showCsvModal());

    document.querySelectorAll('.cat-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        catFilter = btn.dataset.cat;
        render();
      });
    });

    document.getElementById('skillsSearch')?.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      render();
    });

    document.getElementById('ratingFilter')?.addEventListener('change', (e) => {
      ratingFilter = parseInt(e.target.value);
      render();
    });

    firebaseAuth().then(() => loadEmployees()).then(() => render());
  }

  return { init };
})();
