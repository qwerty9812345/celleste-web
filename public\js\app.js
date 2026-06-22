const API = {
  async me() {
    const res = await fetch('/api/me');
    return res.json();
  },
  async config() {
    const res = await fetch('/api/config');
    return res.json();
  }
};

const DEMO_SKILLS = [
  { name: 'Alice', skills: { frontend: 5, backend: 4, devops: 3, soft: 5 } },
  { name: 'Bob', skills: { frontend: 3, backend: 5, devops: 4, soft: 3 } },
  { name: 'Charlie', skills: { frontend: 4, backend: 3, devops: 5, soft: 4 } },
  { name: 'Diana', skills: { frontend: 5, backend: 5, devops: 3, soft: 5 } },
  { name: 'Eve', skills: { frontend: 2, backend: 3, devops: 2, soft: 4 } },
];

const DEMO_MEMBERS = [
  { name: 'Основатель', role: 'Глава семьи', avatar: '👑' },
  { name: 'Alice', role: 'Старший разработчик', avatar: '💻' },
  { name: 'Bob', role: 'Backend-инженер', avatar: '⚙️' },
  { name: 'Charlie', role: 'DevOps', avatar: '🚀' },
  { name: 'Diana', role: 'Fullstack', avatar: '🌟' },
  { name: 'Eve', role: 'Младший разработчик', avatar: '🌱' },
];

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active-section'));
  const section = document.getElementById(id);
  if (section) section.classList.add('active-section');

  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const link = document.querySelector(`.nav-links a[href="#${id}"]`);
  if (link) link.classList.add('active');
}

function getSum(skills) {
  return skills.frontend + skills.backend + skills.devops + skills.soft;
}

function getSumClass(sum) {
  if (sum >= 100) return 'sum-high';
  if (sum >= 60) return 'sum-mid';
  return 'sum-low';
}

function renderSkillsTable(filter = 'all') {
  const tbody = document.getElementById('skillsBody');
  if (!tbody) return;

  let rows = DEMO_SKILLS;
  if (filter !== 'all') {
    const val = parseInt(filter);
    rows = DEMO_SKILLS.filter(s => {
      return s.skills.frontend === val ||
             s.skills.backend === val ||
             s.skills.devops === val ||
             s.skills.soft === val;
    });
  }

  tbody.innerHTML = rows.map(s => {
    const sum = getSum(s.skills);
    const sumClass = getSumClass(sum);
    return `<tr>
      <td><strong>${s.name}</strong></td>
      <td>${s.skills.frontend}</td>
      <td>${s.skills.backend}</td>
      <td>${s.skills.devops}</td>
      <td>${s.skills.soft}</td>
      <td class="${sumClass}">${sum}</td>
    </tr>`;
  }).join('');
}

function renderMembers(showAll = false) {
  const grid = document.getElementById('membersGrid');
  if (!grid) return;

  const list = showAll ? DEMO_MEMBERS : [DEMO_MEMBERS[0]];
  grid.innerHTML = list.map(m => `
    <div class="member-card">
      <div class="member-avatar">${m.avatar}</div>
      <div class="member-name">${m.name}</div>
      <div class="member-role">${m.role}</div>
    </div>
  `).join('');
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast') || (() => {
    const t = document.createElement('div');
    t.id = 'toast';
    t.className = 'toast';
    document.body.appendChild(t);
    return t;
  })();
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.style.display = 'block';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

function updateUI(authData) {
  const loginBtn = document.getElementById('loginBtn');
  const userInfo = document.getElementById('userInfo');
  const userName = document.getElementById('userName');
  const verifiedElements = document.querySelectorAll('.verified-only');

  if (authData.authenticated) {
    loginBtn.style.display = 'none';
    userInfo.style.display = 'flex';
    userName.textContent = authData.user.username;

    if (authData.verified) {
      verifiedElements.forEach(el => el.style.display = 'block');
      renderMembers(true);
      renderSkillsTable();
      document.querySelector('.members-note').style.display = 'none';
    } else {
      verifiedElements.forEach(el => el.style.display = 'none');
      renderMembers(false);
      showToast('У вас нет роли Celleste. Обратитесь к главе семьи.', 'error');
    }
  } else {
    loginBtn.style.display = 'inline-block';
    userInfo.style.display = 'none';
    verifiedElements.forEach(el => el.style.display = 'none');
    renderMembers(false);
  }
}

// Navigation
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const id = link.getAttribute('href').slice(1);
    showSection(id);
  });
});

// Login
document.getElementById('loginBtn').addEventListener('click', () => {
  window.location.href = '/auth/discord';
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  window.location.href = '/auth/logout';
});

// Skills filter
document.getElementById('skillFilter')?.addEventListener('change', (e) => {
  renderSkillsTable(e.target.value);
});

// Init
async function init() {
  const params = new URLSearchParams(window.location.search);
  const error = params.get('error');
  if (error === 'token_failed') showToast('Ошибка авторизации Discord', 'error');
  if (error === 'no_code') showToast('Отсутствует код авторизации', 'error');
  if (error === 'auth_failed') showToast('Ошибка при входе', 'error');

  try {
    const cfg = await API.config();
    const link = document.getElementById('discordInviteLink');
    if (link && cfg.discordInvite && cfg.discordInvite !== '#') {
      link.href = cfg.discordInvite;
    }
  } catch {}

  try {
    const data = await API.me();
    updateUI(data);
  } catch {
    updateUI({ authenticated: false });
  }

  const hash = window.location.hash.slice(1) || 'home';
  showSection(hash);
}

init();
