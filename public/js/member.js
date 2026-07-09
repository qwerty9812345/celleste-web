(function () {

  /* ===== Navigation ===== */
  var pages = document.querySelectorAll('.page');
  var navLinks = document.querySelectorAll('.nav-link');
  var navToggle = document.getElementById('navToggle');
  var navList = document.getElementById('navLinks');

  function showPage(hash) {
    var target = hash.replace('#', '') || 'home';
    var pageId = 'page-' + target;

    pages.forEach(function (p) {
      p.classList.toggle('active', p.id === pageId);
    });

    navLinks.forEach(function (link) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + target);
    });

    if (navList) navList.classList.remove('open');
  }

  function handleNavClick(e) {
    e.preventDefault();
    var href = this.getAttribute('href');
    window.location.hash = href;
    showPage(href);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navLinks.forEach(function (link) {
    link.addEventListener('click', handleNavClick);
  });

  window.addEventListener('hashchange', function () {
    showPage(window.location.hash || '#home');
  });

  if (!window.location.hash) {
    window.location.hash = '#home';
  }
  showPage(window.location.hash);

  if (navToggle) {
    navToggle.addEventListener('click', function () {
      navList.classList.toggle('open');
    });
  }

  /* ===== Logo click -> page refresh ===== */
  var familyLogoLink = document.getElementById('familyLogoLink');
  if (familyLogoLink) {
    familyLogoLink.addEventListener('click', function (e) {
      e.preventDefault();
      window.location.reload();
    });
  }

  document.addEventListener('click', function (e) {
    if (navList && navList.classList.contains('open')) {
      if (!e.target.closest('.navbar')) {
        navList.classList.remove('open');
      }
    }
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 600 && navList) {
      navList.classList.remove('open');
    }
  });

  /* ===== Auth ===== */
  var DEMO_MEMBERS = [
    { name: 'Основатель', role: 'Глава семьи', avatar: '👑' },
    { name: 'Alice', role: 'Старший разработчик', avatar: '💻' },
    { name: 'Bob', role: 'Backend-инженер', avatar: '⚙️' },
    { name: 'Charlie', role: 'DevOps', avatar: '🚀' },
    { name: 'Diana', role: 'Fullstack', avatar: '🌟' },
    { name: 'Eve', role: 'Младший разработчик', avatar: '🌱' }
  ];

  document.getElementById('loginBtn').addEventListener('click', function () {
    window.location.href = '/auth/discord';
  });

  document.getElementById('logoutBtn').addEventListener('click', function () {
    window.location.href = '/auth/logout';
  });

  function showToast(message, type) {
    type = type || 'success';
    var toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = 'toast ' + type;
    toast.style.display = 'block';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () { toast.style.display = 'none'; }, 4000);
  }

  function updateUI(authData) {
    var loginBtn = document.getElementById('loginBtn');
    var userInfo = document.getElementById('userInfo');
    var userName = document.getElementById('userName');
    var verifiedElements = document.querySelectorAll('.verified-only');
    var unverifiedElements = document.querySelectorAll('.unverified-only');
    var familyLogoIcon = document.getElementById('familyLogoIcon');
    var familyBadge = document.getElementById('familyBadge');

    function showVerified() {
      verifiedElements.forEach(function (el) { el.style.display = ''; });
      unverifiedElements.forEach(function (el) { el.style.display = 'none'; });
      if (familyLogoIcon) familyLogoIcon.classList.add('verified');
      if (familyBadge) familyBadge.style.display = 'inline-block';
      var vb = document.querySelector('.verification-blocked');
      if (vb) vb.style.display = 'none';
    }

    function hideVerified() {
      verifiedElements.forEach(function (el) { el.style.display = 'none'; });
      unverifiedElements.forEach(function (el) { el.style.display = 'block'; });
      if (familyLogoIcon) familyLogoIcon.classList.remove('verified');
      if (familyBadge) familyBadge.style.display = 'none';
      var vb = document.querySelector('.verification-blocked');
      if (vb) vb.style.display = 'none';
    }

    if (authData.authenticated) {
      loginBtn.style.display = 'none';
      userInfo.style.display = 'flex';
      userName.textContent = authData.user.username;
      initAvatarSystem(authData);

      if (authData.verified) {
        showVerified();

        fetch('/api/save-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }).catch(function () {});

        // Load project data from Firestore for all verified users
        loadProjectData();
        loadSection1Data();
        loadSection2Data();
        loadPostulateData();
        loadGrammPosts();
        setupGrammForm();
        setupGrammFilters();
        setupGrammScrollObserver();
        setupConfirmModal();
        setupGrammTabs();
        setupGrammFab();
        setupGrammProfileScroll();
        setupGrammAuthorClicks();

        // Show admin edit button for projects if user is admin
        var adminEditBtn = document.getElementById('adminEditBtn');
        if (adminEditBtn && authData.isAdmin) {
          adminEditBtn.style.display = 'inline-flex';
          adminEditBtn.onclick = toggleProjectEdit;
          var adminSaveBtn = document.getElementById('adminSaveBtn');
          if (adminSaveBtn) adminSaveBtn.onclick = saveProjectEdit;
        }

        // Show admin edit button for section 1 if user is admin
        var adminEditBtn1 = document.getElementById('adminEditBtn1');
        if (adminEditBtn1 && authData.isAdmin) {
          adminEditBtn1.style.display = 'inline-flex';
          adminEditBtn1.onclick = toggleSection1Edit;
          var adminSaveBtn1 = document.getElementById('adminSaveBtn1');
          if (adminSaveBtn1) adminSaveBtn1.onclick = saveSection1Edit;
        }

        // Show admin edit button for section 2 if user is admin
        var adminEditBtn2 = document.getElementById('adminEditBtn2');
        if (adminEditBtn2 && authData.isAdmin) {
          adminEditBtn2.style.display = 'inline-flex';
          adminEditBtn2.onclick = toggleSection2Edit;
          var adminSaveBtn2 = document.getElementById('adminSaveBtn2');
          if (adminSaveBtn2) adminSaveBtn2.onclick = saveSection2Edit;
        }

        // Show admin edit button for postulates if user is admin
        var adminEditBtnPostulates = document.getElementById('adminEditBtnPostulates');
        if (adminEditBtnPostulates && authData.isAdmin) {
          adminEditBtnPostulates.style.display = 'inline-flex';
          adminEditBtnPostulates.onclick = togglePostulateEdit;
          var adminSaveBtnPostulates = document.getElementById('adminSaveBtnPostulates');
          if (adminSaveBtnPostulates) adminSaveBtnPostulates.onclick = savePostulateEdit;
        }
      } else {
        hideVerified();
        document.querySelector('.verification-blocked').style.display = 'block';
      }
    } else {
      loginBtn.style.display = 'inline-flex';
      userInfo.style.display = 'none';
      hideVerified();
    }
  }

  /* ===== Init ===== */
  async function init() {
    var params = new URLSearchParams(window.location.search);
    var error = params.get('error');
    if (error === 'token_failed') showToast('Ошибка авторизации Discord', 'error');
    if (error === 'no_code') showToast('Отсутствует код авторизации', 'error');
    if (error === 'auth_failed') showToast('Ошибка при входе', 'error');

    try {
      var data = await fetch('/api/me').then(function (r) { return r.json(); });
      updateUI(data);
    } catch (e) {
      updateUI({ authenticated: false });
    }

    firebaseAuth();
  }

  init();

  /* ===== Particles ===== */
  var particlesStarted = false;

  function initParticles() {
    var canvas = document.getElementById('particlesCanvas');
    if (!canvas || particlesStarted) return;
    particlesStarted = true;

    var ctx = canvas.getContext('2d');
    var particles = [];
    var mouse = { x: 0, y: 0 };

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    canvas.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', function () {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        pulse: Math.random() * Math.PI * 2
      };
    }

    for (var i = 0; i < 80; i++) {
      particles.push(createParticle());
    }

    var connectionDist = 120;
    var mouseConnectionDist = 200;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.pulse += 0.008;
        p.x += p.vx + Math.sin(p.pulse * 0.5) * 0.05;
        p.y += p.vy + Math.cos(p.pulse * 0.7) * 0.05;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        var pulseAlpha = p.alpha + Math.sin(p.pulse) * 0.1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(139, 92, 246, ' + Math.max(0, pulseAlpha) + ')';
        ctx.fill();

        for (var j = i + 1; j < particles.length; j++) {
          var p2 = particles[j];
          var dx = p.x - p2.x;
          var dy = p.y - p2.y;
          var dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDist) {
            var alpha = (1 - dist / connectionDist) * 0.12;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = 'rgba(139, 92, 246, ' + alpha + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        var dmx = p.x - mouse.x;
        var dmy = p.y - mouse.y;
        var distToMouse = Math.sqrt(dmx * dmx + dmy * dmy);

        if (distToMouse < mouseConnectionDist) {
          var mAlpha = (1 - distToMouse / mouseConnectionDist) * 0.2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = 'rgba(139, 92, 246, ' + mAlpha + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      requestAnimationFrame(animate);
    }

    animate();
  }

  initParticles();

  /* ===== Postulate card mouse tracking ===== */
  var postulateCards = document.querySelectorAll('.postulate-card');
  postulateCards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');
    });
  });

  /* ===== About card mouse tracking ===== */
  var aboutCards = document.querySelectorAll('.about-card');
  aboutCards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });

  /* ===== Contact card mouse tracking ===== */
  var contactCards = document.querySelectorAll('.contact-card');
  contactCards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--cx', x + '%');
      card.style.setProperty('--cy', y + '%');
    });
  });

  /* ===== Admin project edit ===== */
  function toggleProjectEdit() {
    var cards = document.querySelectorAll('#page-projects .project-card');
    var isEditing = document.getElementById('adminEditBtn').textContent.includes('Редактировать');
    cards.forEach(function(card) {
      card.contentEditable = isEditing;
      if (isEditing) {
        card.style.outline = '2px dashed rgba(139,92,246,0.4)';
        card.style.borderRadius = '12px';
        card.style.padding = '12px';
      } else {
        card.style.outline = 'none';
      }
    });
    document.getElementById('adminEditBtn').style.display = 'none';
    document.getElementById('adminSaveBtn').style.display = 'inline-flex';
  }

  function saveProjectEdit() {
    var cards = document.querySelectorAll('#page-projects .project-card');
    cards.forEach(function(card) {
      card.contentEditable = false;
      card.style.outline = 'none';
    });
    document.getElementById('adminEditBtn').style.display = 'inline-flex';
    document.getElementById('adminSaveBtn').style.display = 'none';

    if (typeof db !== 'undefined') {
      var cardsData = [];
      document.querySelectorAll('#page-projects .project-card').forEach(function(card) {
        cardsData.push(card.outerHTML);
      });
      db.collection('project_data').doc('main').set({
        cards: cardsData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(function() {
        showToast('Изменения сохранены', 'success');
      }).catch(function(err) {
        showToast('Ошибка сохранения: ' + err.message, 'error');
      });
    } else {
      showToast('Изменения сохранены локально', 'success');
    }
  }

  function loadProjectData() {
    if (typeof db === 'undefined') return;
    db.collection('project_data').doc('main').get().then(function(doc) {
      if (doc.exists) {
        var data = doc.data();
        if (data.cards && data.cards.length > 0) {
          var container = document.querySelector('#page-projects .project-section');
          if (container) {
            container.innerHTML = data.cards.join('\n');
          }
        }
      }
    }).catch(function(err) {
      console.warn('Failed to load project data:', err);
    });
  }

  /* ===== Admin section 1 edit ===== */
  function toggleSection1Edit() {
    var cards = document.querySelectorAll('#page-section1 .project-card');
    var isEditing = document.getElementById('adminEditBtn1').textContent.includes('Редактировать');
    cards.forEach(function(card) {
      card.contentEditable = isEditing;
      if (isEditing) {
        card.style.outline = '2px dashed rgba(139,92,246,0.4)';
        card.style.borderRadius = '12px';
        card.style.padding = '12px';
      } else {
        card.style.outline = 'none';
      }
    });
    document.getElementById('adminEditBtn1').style.display = 'none';
    document.getElementById('adminSaveBtn1').style.display = 'inline-flex';
  }

  function saveSection1Edit() {
    var cards = document.querySelectorAll('#page-section1 .project-card');
    cards.forEach(function(card) {
      card.contentEditable = false;
      card.style.outline = 'none';
    });
    document.getElementById('adminEditBtn1').style.display = 'inline-flex';
    document.getElementById('adminSaveBtn1').style.display = 'none';

    if (typeof db !== 'undefined') {
      var cardsData = [];
      document.querySelectorAll('#page-section1 .project-card').forEach(function(card) {
        cardsData.push(card.outerHTML);
      });
      db.collection('project_data').doc('section1').set({
        cards: cardsData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(function() {
        showToast('Изменения сохранены', 'success');
      }).catch(function(err) {
        showToast('Ошибка сохранения: ' + err.message, 'error');
      });
    } else {
      showToast('Изменения сохранены локально', 'success');
    }
  }

  function loadSection1Data() {
    if (typeof db === 'undefined') return;
    db.collection('project_data').doc('section1').get().then(function(doc) {
      if (doc.exists) {
        var data = doc.data();
        if (data.cards && data.cards.length > 0) {
          var container = document.querySelector('#section1Cards');
          if (container) {
            container.innerHTML = data.cards.join('\n');
          }
        }
      }
    }).catch(function(err) {
      console.warn('Failed to load section1 data:', err);
    });
  }

  /* ===== Section 2 (Matrix) Edit ===== */
  function toggleSection2Edit() {
    var cards = document.querySelectorAll('#page-section2 .matrix-card');
    var isEditing = document.getElementById('adminEditBtn2').textContent.includes('Редактировать');
    cards.forEach(function(card) {
      card.contentEditable = isEditing;
      if (isEditing) {
        card.style.outline = '2px dashed rgba(139,92,246,0.4)';
        card.style.borderRadius = '12px';
        card.style.padding = '12px';
      } else {
        card.style.outline = 'none';
      }
    });
    document.getElementById('adminEditBtn2').style.display = 'none';
    document.getElementById('adminSaveBtn2').style.display = 'inline-flex';
  }

  function saveSection2Edit() {
    var cards = document.querySelectorAll('#page-section2 .matrix-card');
    cards.forEach(function(card) {
      card.contentEditable = false;
      card.style.outline = 'none';
    });
    document.getElementById('adminEditBtn2').style.display = 'inline-flex';
    document.getElementById('adminSaveBtn2').style.display = 'none';

    if (typeof db !== 'undefined') {
      var cardsData = [];
      document.querySelectorAll('#page-section2 .matrix-card').forEach(function(card) {
        cardsData.push(card.outerHTML);
      });
      db.collection('project_data').doc('section2').set({
        cards: cardsData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(function() {
        showToast('Изменения сохранены', 'success');
      }).catch(function(err) {
        showToast('Ошибка сохранения: ' + err.message, 'error');
      });
    } else {
      showToast('Изменения сохранены локально', 'success');
    }
  }

  function loadSection2Data() {
    if (typeof db === 'undefined') return;
    db.collection('project_data').doc('section2').get().then(function(doc) {
      if (doc.exists) {
        var data = doc.data();
        if (data.cards && data.cards.length > 0) {
          var container = document.querySelector('#section2Cards');
          if (container) {
            container.innerHTML = data.cards.join('\n');
          }
        }
      }
    }).catch(function(err) {
      console.warn('Failed to load section2 data:', err);
    });
  }

  /* ===== Postulates Edit ===== */
  function togglePostulateEdit() {
    var cards = document.querySelectorAll('#page-postulates .postulate-card');
    var isEditing = document.getElementById('adminEditBtnPostulates').textContent.includes('Редактировать');
    cards.forEach(function(card) {
      card.contentEditable = isEditing;
      if (isEditing) {
        card.style.outline = '2px dashed rgba(139,92,246,0.4)';
        card.style.borderRadius = '12px';
        card.style.padding = '12px';
      } else {
        card.style.outline = 'none';
      }
    });
    document.getElementById('adminEditBtnPostulates').style.display = 'none';
    document.getElementById('adminSaveBtnPostulates').style.display = 'inline-flex';
  }

  function savePostulateEdit() {
    var cards = document.querySelectorAll('#page-postulates .postulate-card');
    cards.forEach(function(card) {
      card.contentEditable = false;
      card.style.outline = 'none';
    });
    document.getElementById('adminEditBtnPostulates').style.display = 'inline-flex';
    document.getElementById('adminSaveBtnPostulates').style.display = 'none';

    if (typeof db !== 'undefined') {
      var cardsData = [];
      document.querySelectorAll('#page-postulates .postulate-card').forEach(function(card) {
        cardsData.push(card.outerHTML);
      });
      db.collection('project_data').doc('postulates').set({
        cards: cardsData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(function() {
        showToast('Изменения сохранены', 'success');
      }).catch(function(err) {
        showToast('Ошибка сохранения: ' + err.message, 'error');
      });
    } else {
      showToast('Изменения сохранены локально', 'success');
    }
  }

  function loadPostulateData() {
    if (typeof db === 'undefined') return;
    db.collection('project_data').doc('postulates').get().then(function(doc) {
      if (doc.exists) {
        var data = doc.data();
        if (data.cards && data.cards.length > 0) {
          var container = document.querySelector('#postulateCards');
          if (container) {
            container.innerHTML = data.cards.join('\n');
          }
        }
      }
    }).catch(function(err) {
      console.warn('Failed to load postulates data:', err);
    });
  }

  /* ===== Avatar System ===== */
  var AVATARS = [
    { id: 'skull',  gradient: ['#6d28d9','#4c1d95'], icon: 'fa-skull',  label: 'Череп' },
    { id: 'ghost',  gradient: ['#6366f1','#4338ca'], icon: 'fa-ghost',  label: 'Призрак' },
    { id: 'crown',  gradient: ['#f59e0b','#d97706'], icon: 'fa-crown',  label: 'Корона' },
    { id: 'shield', gradient: ['#3b82f6','#1d4ed8'], icon: 'fa-shield', label: 'Щит' },
    { id: 'dog',    gradient: ['#64748b','#334155'], icon: 'fa-dog',    label: 'Волк' },
    { id: 'fire',   gradient: ['#ef4444','#b91c1c'], icon: 'fa-fire',   label: 'Пламя' },
    { id: 'fist',   gradient: ['#dc2626','#7f1d1d'], icon: 'fa-fist-raised', label: 'Кулак' },
    { id: 'eye',    gradient: ['#8b5cf6','#a21caf'], icon: 'fa-eye',    label: 'Око' }
  ];
  var currentUserId = null;
  var avatarCache = {};
  var avatarByName = {};

  function initAvatarSystem(authData) {
    if (!authData.authenticated || !authData.user) return;
    currentUserId = authData.user.id;
    loadUserAvatar(currentUserId);
    loadAvatarCache();
    setupAvatarPicker();
  }

  function renderAvatar(presetId) {
    var img = document.getElementById('navAvatar');
    var icon = document.getElementById('navAvatarIcon');
    if (!img || !icon) return;
    var av = null;
    for (var i = 0; i < AVATARS.length; i++) {
      if (AVATARS[i].id === presetId) { av = AVATARS[i]; break; }
    }
    if (av) {
      img.style.display = 'none';
      icon.style.display = 'flex';
      icon.style.background = 'linear-gradient(135deg, ' + av.gradient[0] + ', ' + av.gradient[1] + ')';
      icon.innerHTML = '<i class="fas ' + av.icon + '"></i>';
    }
  }

  function loadUserAvatar(userId) {
    if (typeof db === 'undefined') return;
    db.collection('user_avatars').doc(userId).get().then(function(doc) {
      var img = document.getElementById('navAvatar');
      var icon = document.getElementById('navAvatarIcon');
      if (!img || !icon) return;
      var avatarData = null;
      if (doc.exists) {
        avatarData = doc.data();
        if (avatarData.type === 'custom' && avatarData.avatarUrl) {
          icon.style.display = 'none';
          img.src = avatarData.avatarUrl;
          img.style.display = 'block';
          img.className = 'nav-avatar nav-avatar-img';
        } else if (avatarData.type === 'preset' && avatarData.presetId) {
          renderAvatar(avatarData.presetId);
        } else {
          icon.style.display = 'flex';
          icon.style.background = 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.05))';
          icon.innerHTML = '<i class="fas fa-user"></i>';
          img.style.display = 'none';
        }
        if (avatarData.displayName) {
          var nameEl = document.getElementById('userName');
          if (nameEl) nameEl.textContent = avatarData.displayName;
        }
      } else {
        icon.style.display = 'flex';
        icon.style.background = 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.05))';
        icon.innerHTML = '<i class="fas fa-user"></i>';
        img.style.display = 'none';
      }
      // Update composer avatar with the data we just loaded (bypasses cache)
      renderComposerAvatar(avatarData);
    }).catch(function() {});
  }

  function renderComposerAvatar(data) {
    var avatarEl = document.getElementById('grammAvatar');
    var nameEl = document.getElementById('grammAuthorName');
    if (!avatarEl) return;
    var displayName = (document.getElementById('userName') || {}).textContent || '';
    if (nameEl) nameEl.textContent = displayName;

    if (data && data.type === 'preset' && data.presetId) {
      for (var i = 0; i < AVATARS.length; i++) {
        if (AVATARS[i].id === data.presetId) {
          avatarEl.style.background = 'linear-gradient(135deg, ' + AVATARS[i].gradient[0] + ', ' + AVATARS[i].gradient[1] + ')';
          avatarEl.innerHTML = '<i class="fas ' + AVATARS[i].icon + '" style="font-size:13px"></i>';
          return;
        }
      }
    } else if (data && data.type === 'custom' && data.avatarUrl) {
      avatarEl.style.background = 'none';
      avatarEl.style.padding = '0';
      avatarEl.innerHTML = '<img src="' + data.avatarUrl + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%">';
      return;
    }
    avatarEl.style.background = 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.05))';
    avatarEl.style.padding = '';
    avatarEl.innerHTML = displayName ? (displayName[0] || '?').toUpperCase() : '?';
  }

  function loadAvatarCache() {
    if (typeof db === 'undefined') return;
    db.collection('user_avatars').get().then(function(snapshot) {
      avatarByName = {};
      snapshot.forEach(function(doc) {
        var data = doc.data();
        avatarCache[doc.id] = data;
        if (data.displayName) {
          avatarByName[data.displayName.toLowerCase()] = doc.id;
        }
      });
      renderGrammPosts();
    }).catch(function() {});
  }

  function getAvatarHtml(userId, authorName, size) {
    var data = avatarCache[userId];
    if (!data && authorName) {
      var key = authorName.toLowerCase().trim();
      var foundId = avatarByName[key];
      if (foundId) {
        data = avatarCache[foundId];
        userId = foundId;
      }
    }
    var sz = size || 0;
    var w = sz ? 'width:' + sz + 'px;height:' + sz + 'px;' : '';
    var fs = sz ? 'font-size:' + Math.round(sz * 0.4) + 'px;' : 'font-size:11px';
    var baseStyle = w + fs;
    if (!data) return '<span class="gramm-post-avatar" style="background:linear-gradient(135deg,rgba(139,92,246,0.2),rgba(139,92,246,0.05));color:#c4b5fd;' + baseStyle + '">' + escapeHtml((authorName || '?')[0].toUpperCase()) + '</span>';
    if (data.type === 'custom' && data.avatarUrl) {
      var extra = sz ? 'width:' + sz + 'px;height:' + sz + 'px;' : '';
      if (extra) return '<img class="gramm-post-avatar gramm-post-avatar-img" src="' + data.avatarUrl + '" alt="" style="' + extra + '">';
      return '<img class="gramm-post-avatar gramm-post-avatar-img" src="' + data.avatarUrl + '" alt="">';
    }
    if (data.type === 'preset' && data.presetId) {
      for (var i = 0; i < AVATARS.length; i++) {
        if (AVATARS[i].id === data.presetId) {
          return '<span class="gramm-post-avatar" style="background:linear-gradient(135deg,' + AVATARS[i].gradient[0] + ',' + AVATARS[i].gradient[1] + ');color:rgba(255,255,255,0.85);' + baseStyle + '"><i class="fas ' + AVATARS[i].icon + '"></i></span>';
        }
      }
    }
    return '<span class="gramm-post-avatar" style="background:linear-gradient(135deg,rgba(139,92,246,0.2),rgba(139,92,246,0.05));color:#c4b5fd;' + baseStyle + '">?</span>';
  }

  function getDisplayName(userId, authorName) {
    var data = avatarCache[userId];
    if (!data && authorName) {
      var key = authorName.toLowerCase().trim();
      var foundId = avatarByName[key];
      if (foundId) data = avatarCache[foundId];
    }
    if (data && data.displayName) return data.displayName;
    return null;
  }

  function refreshComposerAvatar() {
    if (!currentUserId) return;
    renderComposerAvatar(avatarCache[currentUserId] || null);
  }

  function setupAvatarPicker() {
    var wrap = document.getElementById('navAvatarWrap');
    var nameEl = document.getElementById('userName');
    var trigger = function() { showAvatarPicker(); };
    if (wrap) wrap.onclick = trigger;
    if (nameEl) nameEl.onclick = trigger;

    var closeBtn = document.getElementById('avatarModalClose');
    if (closeBtn) closeBtn.onclick = hideAvatarPicker;

    var overlay = document.getElementById('avatarModal');
    if (overlay) overlay.onclick = function(e) { if (e.target === overlay) hideAvatarPicker(); };

    // Display name input
    var nameInput = document.getElementById('avatarDisplayName');
    if (nameInput) {
      nameInput.onchange = function() {
        var val = nameInput.value.trim();
        if (!val || !currentUserId || typeof db === 'undefined') return;
        db.collection('user_avatars').doc(currentUserId).update({
          displayName: val
        }).then(function() {
          var nameEl = document.getElementById('userName');
          if (nameEl) nameEl.textContent = val;
          refreshComposerAvatar();
          if (avatarCache[currentUserId]) avatarCache[currentUserId].displayName = val;
          showToast('Имя обновлено', 'success');
        }).catch(function(err) {
          // doc might not exist yet — merge
          db.collection('user_avatars').doc(currentUserId).set({
            displayName: val
          }, { merge: true }).then(function() {
            var nameEl = document.getElementById('userName');
            if (nameEl) nameEl.textContent = val;
            refreshComposerAvatar();
            if (avatarCache[currentUserId]) avatarCache[currentUserId].displayName = val;
            showToast('Имя обновлено', 'success');
          }).catch(function(err2) {
            showToast('Ошибка: ' + err2.message, 'error');
          });
        });
      };
    }

    // Upload custom
    var uploadBtn = document.getElementById('avatarUploadBtn');
    var fileInput = document.getElementById('avatarFileInput');
    if (uploadBtn && fileInput) {
      uploadBtn.onclick = function() { fileInput.click(); };
      fileInput.onchange = function(e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function(ev) {
          saveCustomAvatar(ev.target.result);
        };
        reader.readAsDataURL(file);
      };
    }
  }

  function showAvatarPicker() {
    var grid = document.getElementById('avatarGrid');
    if (!grid) return;
    // Pre-fill display name
    var nameInput = document.getElementById('avatarDisplayName');
    if (nameInput) {
      var currentName = (document.getElementById('userName') || {}).textContent || '';
      nameInput.value = currentName;
    }
    if (!grid.children.length) {
      AVATARS.forEach(function(av) {
        var btn = document.createElement('button');
        btn.className = 'modal-avatar-option';
        btn.dataset.presetId = av.id;
        btn.style.background = 'linear-gradient(135deg, ' + av.gradient[0] + ', ' + av.gradient[1] + ')';
        btn.innerHTML = '<i class="fas ' + av.icon + '"></i>';
        btn.title = av.label;
        btn.onclick = function() {
          savePresetAvatar(av.id);
          grid.querySelectorAll('.modal-avatar-option').forEach(function(b) { b.classList.remove('selected'); });
          btn.classList.add('selected');
        };
        grid.appendChild(btn);
      });
    }
    var modal = document.getElementById('avatarModal');
    if (modal) modal.style.display = 'flex';
  }

  function hideAvatarPicker() {
    var modal = document.getElementById('avatarModal');
    if (modal) modal.style.display = 'none';
  }

  function savePresetAvatar(presetId) {
    if (!currentUserId || typeof db === 'undefined') return;
    db.collection('user_avatars').doc(currentUserId).set({
      type: 'preset',
      presetId: presetId
    }, { merge: true }).then(function() {
      renderAvatar(presetId);
      // Also save name if input has a value
      var nameInput = document.getElementById('avatarDisplayName');
      if (nameInput && nameInput.value.trim()) {
        var val = nameInput.value.trim();
        db.collection('user_avatars').doc(currentUserId).update({
          displayName: val
        }).catch(function() {});
        var nameEl = document.getElementById('userName');
        if (nameEl) nameEl.textContent = val;
        // cache will be updated on next render, composer refreshes below
      }
      // Update cache and composer
      if (avatarCache[currentUserId]) {
        avatarCache[currentUserId].type = 'preset';
        avatarCache[currentUserId].presetId = presetId;
      } else {
        avatarCache[currentUserId] = { type: 'preset', presetId: presetId };
      }
      renderAvatar(presetId);
      refreshComposerAvatar();
      hideAvatarPicker();
      showToast('Аватар сохранён', 'success');
    }).catch(function(err) {
      showToast('Ошибка: ' + err.message, 'error');
    });
  }

  function saveCustomAvatar(dataUrl) {
    if (!currentUserId || typeof db === 'undefined') return;
    var obj = { type: 'custom', avatarUrl: dataUrl };
    var nameInput = document.getElementById('avatarDisplayName');
    if (nameInput && nameInput.value.trim()) {
      obj.displayName = nameInput.value.trim();
    }
    db.collection('user_avatars').doc(currentUserId).set(obj, { merge: true }).then(function() {
      var img = document.getElementById('navAvatar');
      var icon = document.getElementById('navAvatarIcon');
      if (img && icon) {
        icon.style.display = 'none';
        img.src = dataUrl;
        img.style.display = 'block';
        img.className = 'nav-avatar nav-avatar-img';
      }
      if (obj.displayName) {
        var nameEl = document.getElementById('userName');
        if (nameEl) nameEl.textContent = obj.displayName;
      }
      // Update cache and composer
      if (avatarCache[currentUserId]) {
        avatarCache[currentUserId].type = 'custom';
        avatarCache[currentUserId].avatarUrl = dataUrl;
        if (obj.displayName) avatarCache[currentUserId].displayName = obj.displayName;
      }
      refreshComposerAvatar();
      hideAvatarPicker();
      showToast('Аватар сохранён', 'success');
    }).catch(function(err) {
      showToast('Ошибка: ' + err.message, 'error');
    });
  }

  /* ===== Cellestegramm ===== */
  var grammPosts = [];
  var grammListener = null;
  var grammDisplayCount = 10;
  var grammFilterUser = 'all';
  var grammObserver = null;
  var grammProfileObserver = null;
  var pendingDeleteId = null;
  var grammFileData = null;
  var currentPostId = null;

  function loadGrammPosts() {
    if (typeof db === 'undefined') { console.warn('[Gramm] db is undefined'); return; }
    if (grammListener) grammListener();
    grammListener = db.collection('gramm_posts').orderBy('createdAt', 'desc').limit(50).onSnapshot(function(snapshot) {
      grammPosts = [];
      snapshot.forEach(function(doc) {
        var data = doc.data();
        data._id = doc.id;
        grammPosts.push(data);
      });
      console.log('[Gramm] loaded ' + grammPosts.length + ' posts');
      try {
        renderGrammPosts();
        console.log('[Gramm] renderGrammPosts OK');
      } catch (e) { console.error('[Gramm] render error:', e); }
      renderGrammProfile();
    }, function(err) {
      console.error('[Gramm] Firestore error:', err);
    });
  }

  function getYoutubeEmbed(url) {
    if (!url) return null;
    var match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (match) return 'https://www.youtube.com/embed/' + match[1] + '?rel=0';
    return null;
  }

  function isVideoUrl(url) {
    if (!url) return false;
    if (url.startsWith('data:video/')) return true;
    var ext = url.split('?')[0].toLowerCase();
    if (ext.endsWith('.mp4') || ext.endsWith('.webm') || ext.endsWith('.ogg') || ext.endsWith('.mov') || ext.endsWith('.gif')) return true;
    return false;
  }

  function getFilteredPosts() {
    if (grammFilterUser === 'all') return grammPosts;
    return grammPosts.filter(function(post) {
      var displayName = post.author;
      var cached = getDisplayName(post.authorId, post.author);
      if (cached) displayName = cached;
      return displayName === grammFilterUser;
    });
  }

  function timeAgo(date) {
    if (!date) return '';
    var now = new Date();
    var diff = Math.floor((now - date) / 1000);
    if (diff < 10) return 'только что';
    if (diff < 60) return Math.floor(diff) + ' сек. назад';
    diff = Math.floor(diff / 60);
    if (diff < 60) return diff + ' мин. назад';
    diff = Math.floor(diff / 60);
    if (diff < 24) return diff + ' ч. назад';
    diff = Math.floor(diff / 24);
    if (diff < 7) return diff + ' дн. назад';
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  }

  function appendPost(post, grid) {
    console.log('[Gramm] appendPost', post._id, post.imageUrl ? post.imageUrl.substring(0, 50) : 'no image');
    var currentUser = (document.getElementById('userName') || {}).textContent || '';
    var youtubeEmbed = getYoutubeEmbed(post.imageUrl);
    var isVideo = isVideoUrl(post.imageUrl);
    var displayName = post.author;
    var cached = getDisplayName(post.authorId, post.author);
    if (cached) displayName = cached;
    var isOwn = (post.authorId && post.authorId === currentUserId) || (!post.authorId && post.author === currentUser);
    var tAgo = timeAgo(post.createdAt ? post.createdAt.toDate() : null);
    var avatarHtml = getAvatarHtml(post.authorId, post.author, 32);
    var likeCount = post.likeCount || 0;
    var liked = currentUserId && post.likedBy && post.likedBy.indexOf(currentUserId) !== -1;
    var saved = currentUserId && post.savedBy && post.savedBy.indexOf(currentUserId) !== -1;
    var commentCount = post.commentCount || 0;

    var card = document.createElement('div');
    card.className = 'gramm-post';
    card._postData = post;

    // === HEADER ===
    var header = document.createElement('div');
    header.className = 'gramm-post-header';
    header.innerHTML = '<div class="gramm-post-header-left">' + avatarHtml + '<span class="gramm-post-header-name gramm-post-author-clickable" data-author="' + escapeHtml(displayName) + '">' + escapeHtml(displayName) + '</span></div>';
    if (isOwn && post._id) {
      var moreBtn = document.createElement('button');
      moreBtn.className = 'gramm-post-more-btn';
      moreBtn.innerHTML = '<i class="fas fa-ellipsis-h"></i>';
      moreBtn.onclick = function(e) { e.stopPropagation(); pendingDeleteId = post._id; showConfirmModal(); };
      header.appendChild(moreBtn);
    }
    card.appendChild(header);

    // === MEDIA ===
    var mediaDiv = document.createElement('div');
    if (youtubeEmbed) {
      mediaDiv.className = 'gramm-post-img-wrap yt';
      mediaDiv.innerHTML = '<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;background:rgba(0,0,0,0.2)"><iframe src="' + youtubeEmbed + '" frameborder="0" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%"></iframe></div>';
    } else if (isVideo) {
      mediaDiv.className = 'gramm-post-img-wrap video';
      var vid = document.createElement('video');
      vid.className = 'gramm-post-img';
      vid.src = post.imageUrl;
      vid.controls = true;
      vid.playsInline = true;
      vid.preload = 'metadata';
      mediaDiv.appendChild(vid);
    } else if (post.imageUrl) {
      mediaDiv.className = 'gramm-post-img-wrap';
      var img = document.createElement('img');
      img.className = 'gramm-post-img';
      img.src = post.imageUrl;
      img.alt = '';
      img.loading = 'lazy';
      mediaDiv.appendChild(img);
    }
    if (mediaDiv.children.length) card.appendChild(mediaDiv);

    // === ACTION BAR ===
    var actDiv = document.createElement('div');
    actDiv.className = 'gramm-post-actions';

    var likeBtn = document.createElement('button');
    likeBtn.className = 'gramm-post-action' + (liked ? ' liked' : '');
    likeBtn.innerHTML = '<i class="' + (liked ? 'fas' : 'far') + ' fa-heart"></i>';
    likeBtn.onclick = function(e) { e.stopPropagation(); handleGrammLike(post._id, post, likeBtn, null); };
    actDiv.appendChild(likeBtn);

    var commentBtn = document.createElement('button');
    commentBtn.className = 'gramm-post-action';
    commentBtn.innerHTML = '<i class="far fa-comment"></i>';
    commentBtn.onclick = function(e) { e.stopPropagation(); openPostModal(post._id, post, currentUserId); };
    actDiv.appendChild(commentBtn);

    // Share button
    var shareBtn = document.createElement('button');
    shareBtn.className = 'gramm-post-action';
    shareBtn.innerHTML = '<i class="far fa-paper-plane"></i>';
    shareBtn.onclick = function(e) { e.stopPropagation(); sharePost(post); };
    actDiv.appendChild(shareBtn);

    // Save/Bookmark (right side)
    var rightActs = document.createElement('div');
    rightActs.className = 'gramm-post-actions-right';
    var saveBtn = document.createElement('button');
    saveBtn.className = 'gramm-post-action' + (saved ? ' saved' : '');
    saveBtn.innerHTML = '<i class="' + (saved ? 'fas' : 'far') + ' fa-bookmark"></i>';
    saveBtn.onclick = function(e) { e.stopPropagation(); handleGrammSave(post._id, post, saveBtn); };
    rightActs.appendChild(saveBtn);
    actDiv.appendChild(rightActs);
    card.appendChild(actDiv);

    // === LIKES ===
    var likesDiv = document.createElement('div');
    likesDiv.className = 'gramm-post-likes';
    if (likeCount > 0) {
      likesDiv.textContent = likeCount + (likeCount === 1 ? ' отметка «Нравится»' : ' отметок «Нравится»');
    }
    card.appendChild(likesDiv);

    // === CAPTION ===
    if (post.caption) {
      var capDiv = document.createElement('div');
      capDiv.className = 'gramm-post-caption';
      capDiv.innerHTML = '<span class="gramm-post-caption-name gramm-post-author-clickable" data-author="' + escapeHtml(displayName) + '">' + escapeHtml(displayName) + '</span> ' + escapeHtml(post.caption);
      card.appendChild(capDiv);
    }

    // Comments preview
    if (commentCount > 0) {
      var commentsPreview = document.createElement('div');
      commentsPreview.className = 'gramm-post-caption';
      commentsPreview.style.cssText = 'color:rgba(255,255,255,0.2);font-size:13px;cursor:pointer;padding:0 14px';
      commentsPreview.textContent = 'Посмотреть все комментарии (' + commentCount + ')';
      commentsPreview.onclick = function(e) { e.stopPropagation(); openPostModal(post._id, post, currentUserId); };
      card.appendChild(commentsPreview);
    }

    // === TIME ===
    var timeDiv = document.createElement('div');
    timeDiv.className = 'gramm-post-time';
    timeDiv.textContent = tAgo;
    card.appendChild(timeDiv);

    // Double-tap to like
    card.ondblclick = function(e) {
      e.preventDefault();
      if (liked) return;
      handleGrammLike(post._id, post, likeBtn, null);
      liked = true;
      likeBtn.classList.add('liked');
      likeBtn.innerHTML = '<i class="fas fa-heart"></i>';
      var popup = document.createElement('div');
      popup.className = 'gramm-like-popup show';
      popup.innerHTML = '<i class="fas fa-heart" style="color:#fff"></i>';
      this.appendChild(popup);
      setTimeout(function() { if (popup.parentNode) popup.parentNode.removeChild(popup); }, 600);
    };

    // Click to open modal
    card.onclick = function(e) {
      if (e.detail > 1) return;
      openPostModal(post._id, post, currentUserId);
    };

    grid.appendChild(card);
  }

  function sharePost(post) {
    if (navigator.share) {
      navigator.share({
        title: post.caption || 'Публикация',
        text: post.caption || 'Посмотри эту публикацию',
        url: window.location.href
      }).catch(function() {});
    } else {
      showToast('Скопировано в буфер', 'success');
    }
  }

  function handleGrammSave(postId, postData, btn) {
    if (!currentUserId) { showToast('Войдите, чтобы сохранять', 'error'); return; }
    if (typeof db === 'undefined') return;
    var saved = postData.savedBy && postData.savedBy.indexOf(currentUserId) !== -1;
    var update = saved ? {
      savedBy: firebase.firestore.FieldValue.arrayRemove(currentUserId)
    } : {
      savedBy: firebase.firestore.FieldValue.arrayUnion(currentUserId)
    };
    db.collection('gramm_posts').doc(postId).update(update).then(function() {
      if (saved) {
        if (postData.savedBy) postData.savedBy = postData.savedBy.filter(function(id) { return id !== currentUserId; });
        btn.classList.remove('saved');
        btn.innerHTML = '<i class="far fa-bookmark"></i>';
        showToast('Удалено из сохранённых', 'success');
      } else {
        if (!postData.savedBy) postData.savedBy = [];
        postData.savedBy.push(currentUserId);
        btn.classList.add('saved');
        btn.innerHTML = '<i class="fas fa-bookmark"></i>';
        showToast('Сохранено', 'success');
      }
    }).catch(function(err) { showToast('Ошибка: ' + err.message, 'error'); });
  }

  function handleGrammLike(postId, postData, btn, countEl) {
    if (!currentUserId) { showToast('Войдите, чтобы ставить лайки', 'error'); return; }
    if (typeof db === 'undefined') return;
    var liked = postData.likedBy && postData.likedBy.indexOf(currentUserId) !== -1;
    var update = liked ? {
      likedBy: firebase.firestore.FieldValue.arrayRemove(currentUserId),
      likeCount: firebase.firestore.FieldValue.increment(-1)
    } : {
      likedBy: firebase.firestore.FieldValue.arrayUnion(currentUserId),
      likeCount: firebase.firestore.FieldValue.increment(1)
    };
    db.collection('gramm_posts').doc(postId).update(update).catch(function() {});
    if (liked) {
      btn.classList.remove('liked');
    } else {
      btn.classList.add('liked');
    }
    var icon = btn.querySelector('i');
    if (icon) icon.className = (liked ? 'far' : 'fas') + ' fa-heart';
    var newCount = (postData.likeCount || 0) + (liked ? -1 : 1);
    countEl.textContent = newCount;
    postData.likeCount = newCount;
    if (liked && postData.likedBy) {
      postData.likedBy = postData.likedBy.filter(function(id) { return id !== currentUserId; });
    } else if (!liked) {
      if (!postData.likedBy) postData.likedBy = [];
      postData.likedBy.push(currentUserId);
    }
  }

  function renderGrammPosts() {
    var grid = document.getElementById('grammGrid');
    if (!grid) { console.warn('[Gramm] #grammGrid not found'); return; }
    console.log('[Gramm] renderGrammPosts: filtered=' + getFilteredPosts().length + ' total=' + grammPosts.length);
    grid.innerHTML = '';
    var filtered = getFilteredPosts();
    if (filtered.length === 0) {
      grid.innerHTML = '<div class="gramm-empty"><i class="fas fa-camera"></i>Пока нет публикаций</div>';
      return;
    }
    var postsToShow = filtered.slice(0, grammDisplayCount);
    postsToShow.forEach(function(post) { appendPost(post, grid); });
    if (filtered.length > grammDisplayCount) {
      var lm = document.createElement('div');
      lm.className = 'gramm-load-more';
      lm.innerHTML = '<button class="gramm-load-more-btn" id="grammLoadMoreBtn">Загрузить ещё</button>';
      grid.appendChild(lm);
      document.getElementById('grammLoadMoreBtn').onclick = function() { grammDisplayCount += 10; renderGrammPosts(); };
    }
    // Author name click handler is via delegation on grammBody (setup once)
  }

  var grammMyGridPosts = [];

  function renderGrammProfile() {
    var grid = document.getElementById('grammProfileGrid');
    if (!grid) return;
    var avatarEl = document.getElementById('grammProfileAvatar');
    var nameEl = document.getElementById('grammProfileName');
    var countEl = document.getElementById('grammProfileCount');
    var editBtn = document.getElementById('grammProfileEditBtn');
    var userName = document.getElementById('userName').textContent || '—';
    if (avatarEl) {
      avatarEl.innerHTML = getAvatarHtml(currentUserId, userName, 80);
    }
    if (nameEl) nameEl.textContent = userName;
    var myPosts = grammPosts.filter(function(p) {
      return p.authorId === currentUserId || (!p.authorId && p.author === (document.getElementById('userName').textContent || ''));
    });
    grammMyGridPosts = myPosts;
    if (countEl) countEl.textContent = myPosts.length;
    grid.innerHTML = '';
    if (myPosts.length === 0) {
      grid.innerHTML = '<div class="gramm-empty"><i class="fas fa-camera"></i>Ваших публикаций пока нет</div>';
    } else {
      myPosts.forEach(function(post) { appendPost(post, grid); });
    }
    if (editBtn) {
      editBtn.onclick = function() {
        // Edit bio
        var currentBio = document.getElementById('grammMyBio').textContent || '';
        var newBio = prompt('Введите информацию о себе:', currentBio);
        if (newBio === null) return;
        if (currentUserId) {
          db.collection('gramm_profiles').doc(currentUserId).set({ bio: newBio }, { merge: true }).then(function() {
            document.getElementById('grammMyBio').textContent = newBio;
            document.getElementById('grammMyBio').style.display = newBio ? 'block' : 'none';
            showToast('Информация обновлена', 'success');
          }).catch(function(err) { showToast('Ошибка: ' + err.message, 'error'); });
        }
      };
    }
    renderGrammHighlights();
    setupGrammVkTabs();
  }

  function showGrammFeed() {
    document.getElementById('grammFeedView').style.display = 'block';
    document.getElementById('grammUserView').style.display = 'none';
    document.getElementById('grammProfileView').style.display = 'none';
    document.getElementById('grammExploreView').style.display = 'none';
    document.getElementById('grammNotifsView').style.display = 'none';
    document.getElementById('grammCreateView').style.display = 'none';
    document.getElementById('grammReelsView').style.display = 'none';
    document.getElementById('grammSettingsView').style.display = 'none';
    grammFilterUser = 'all';
    grammDisplayCount = 10;
    renderGrammPosts();
  }

  function setupGrammVkTabs() {
    // User profile tabs (IG-style)
    document.querySelectorAll('.gramm-ig-tab[data-uvtab]').forEach(function(tab) {
      tab.onclick = function() {
        document.querySelectorAll('.gramm-ig-tab[data-uvtab]').forEach(function(t) { t.classList.remove('active'); });
        this.classList.add('active');
        var view = this.getAttribute('data-uvtab');
        var grid = document.getElementById('grammUserGrid');
        if (!grid) return;
        if (view === 'saved') {
          grid.className = 'gramm-feed gramm-ig-photo-grid';
          loadSavedPosts(grid);
          return;
        }
        grid.className = 'gramm-feed' + (view === 'photos' ? ' gramm-ig-photo-grid' : '');
        grid.innerHTML = '';
        if (view === 'posts') {
          grammUserGridPosts.forEach(function(p) { appendPost(p, grid); });
        } else if (view === 'photos') {
          var photoPosts = grammUserGridPosts.filter(function(p) { return p.imageUrl && !isVideoUrl(p.imageUrl) && !getYoutubeEmbed(p.imageUrl); });
          if (photoPosts.length === 0) {
            grid.innerHTML = '<div class="gramm-empty"><i class="fas fa-camera"></i>Нет фотографий</div>';
          } else {
            photoPosts.forEach(function(p) {
              var el = document.createElement('div');
              el.className = 'gramm-photo-grid-item';
              el.innerHTML = '<img src="' + p.imageUrl + '" alt="">';
              el.onclick = function() { openPostModal(p._id, p, currentUserId); };
              grid.appendChild(el);
            });
          }
        }
      };
    });
    // My profile tabs (IG-style)
    document.querySelectorAll('.gramm-ig-tab[data-mptab]').forEach(function(tab) {
      tab.onclick = function() {
        document.querySelectorAll('.gramm-ig-tab[data-mptab]').forEach(function(t) { t.classList.remove('active'); });
        this.classList.add('active');
        var view = this.getAttribute('data-mptab');
        var grid = document.getElementById('grammProfileGrid');
        if (!grid) return;
        if (view === 'saved') {
          grid.className = 'gramm-feed gramm-ig-photo-grid';
          loadSavedPosts(grid);
          return;
        }
        grid.className = 'gramm-feed' + (view === 'photos' ? ' gramm-ig-photo-grid' : '');
        grid.innerHTML = '';
        if (view === 'posts') {
          grammMyGridPosts.forEach(function(p) { appendPost(p, grid); });
        } else if (view === 'photos') {
          var photoPosts = grammMyGridPosts.filter(function(p) { return p.imageUrl && !isVideoUrl(p.imageUrl) && !getYoutubeEmbed(p.imageUrl); });
          if (photoPosts.length === 0) {
            grid.innerHTML = '<div class="gramm-empty"><i class="fas fa-camera"></i>Нет фотографий</div>';
          } else {
            photoPosts.forEach(function(p) {
              var el = document.createElement('div');
              el.className = 'gramm-photo-grid-item';
              el.innerHTML = '<img src="' + p.imageUrl + '" alt="">';
              el.onclick = function() { openPostModal(p._id, p, currentUserId); };
              grid.appendChild(el);
            });
          }
        }
      };
    });
  }

  var grammUserGridPosts = [];

  function renderGrammUserProfile(authorId, authorName) {
    document.getElementById('grammFeedView').style.display = 'none';
    document.getElementById('grammUserView').style.display = 'block';
    document.getElementById('grammProfileView').style.display = 'none';
    document.getElementById('grammExploreView').style.display = 'none';
    document.getElementById('grammNotifsView').style.display = 'none';
    document.getElementById('grammCreateView').style.display = 'none';
    document.getElementById('grammReelsView').style.display = 'none';
    document.getElementById('grammSettingsView').style.display = 'none';
    var avatarEl = document.getElementById('grammUserAvatar');
    var nameEl = document.getElementById('grammUserProfileName');
    var countEl = document.getElementById('grammUserProfileCount');
    var grid = document.getElementById('grammUserGrid');
    if (!grid) return;
    var userPosts = grammPosts.filter(function(p) {
      return (authorId && p.authorId === authorId) || (!p.authorId && p.author === authorName);
    });
    grammUserGridPosts = userPosts;
    if (avatarEl) {
      avatarEl.innerHTML = getAvatarHtml(authorId, authorName, 80);
    }
    if (nameEl) nameEl.textContent = getDisplayName(authorId, authorName) || authorName;
    if (countEl) countEl.textContent = userPosts.length;
    grid.innerHTML = '';
    if (userPosts.length === 0) {
      grid.innerHTML = '<div class="gramm-empty"><i class="fas fa-camera"></i>Нет публикаций</div>';
    } else {
      userPosts.forEach(function(post) { appendPost(post, grid); });
    }
    setupGrammVkTabs();
  }

  function setupGrammAuthorClicks() {
    document.getElementById('grammBody').addEventListener('click', function(e) {
      var el = e.target.closest('.gramm-post-author-clickable');
      if (el) {
        e.stopPropagation();
        var author = el.getAttribute('data-author');
        if (author) renderGrammUserProfile(null, author);
      }
    });
  }

  function setupGrammFilters() {}

  function setupGrammScrollObserver() {
    var sentinel = document.getElementById('grammSentinel');
    if (!sentinel) return;
    if (grammObserver) grammObserver.disconnect();
    grammObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var filtered = getFilteredPosts();
          if (filtered.length > grammDisplayCount) {
            grammDisplayCount += 10;
            renderGrammPosts();
          }
        }
      });
    }, { rootMargin: '200px' });
    grammObserver.observe(sentinel);
  }

  function setupGrammProfileScroll() {
    var sentinel = document.getElementById('grammProfileSentinel');
    if (!sentinel) return;
    if (grammProfileObserver) grammProfileObserver.disconnect();
    grammProfileObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var myPosts = grammPosts.filter(function(p) {
            return p.authorId === currentUserId || (!p.authorId && p.author === (document.getElementById('userName').textContent || ''));
          });
          if (myPosts.length > 10) {
            grammDisplayCount += 10;
            renderGrammProfile();
          }
        }
      });
    }, { rootMargin: '200px' });
    grammProfileObserver.observe(sentinel);
  }

  function openPostModal(postId, postData, uid) {
    currentPostId = postId;
    var modal = document.getElementById('postModal');
    if (!modal) return;
    var mediaEl = document.getElementById('postModalMedia');
    var avatarEl = document.getElementById('postModalAvatar');
    var nameEl = document.getElementById('postModalName');
    var timeEl = document.getElementById('postModalTime');
    var captionEl = document.getElementById('postModalCaption');
    var likeBtn = document.getElementById('postModalLike');
    var likeCount = document.getElementById('postModalLikeCount');

    var displayName = postData.author;
    var cached = getDisplayName(postData.authorId, postData.author);
    if (cached) displayName = cached;
    var tAgo = timeAgo(postData.createdAt ? postData.createdAt.toDate() : null);

    // Media
    var youtubeEmbed = getYoutubeEmbed(postData.imageUrl);
    var isVideo = isVideoUrl(postData.imageUrl);
    mediaEl.innerHTML = '';
    if (youtubeEmbed) {
      var iframe = document.createElement('iframe');
      iframe.src = youtubeEmbed;
      iframe.frameBorder = '0';
      iframe.allowFullscreen = true;
      mediaEl.appendChild(iframe);
    } else if (isVideo) {
      var vid = document.createElement('video');
      vid.src = postData.imageUrl;
      vid.controls = true;
      vid.playsInline = true;
      vid.preload = 'metadata';
      mediaEl.appendChild(vid);
    } else if (postData.imageUrl) {
      var img = document.createElement('img');
      img.src = postData.imageUrl;
      img.alt = '';
      img.style.cursor = 'zoom-in';
      img.onclick = function(e) { e.stopPropagation(); openPhotoExpand(postData.imageUrl); };
      mediaEl.appendChild(img);
    }

    // Avatar
    avatarEl.innerHTML = getAvatarHtml(postData.authorId, displayName, 30);

    nameEl.innerHTML = '<span class="gramm-post-author-clickable" data-author="' + escapeHtml(displayName) + '">' + escapeHtml(displayName) + '</span>';
    timeEl.textContent = tAgo;
    captionEl.textContent = postData.caption || '';
    var count = postData.likeCount || 0;
    likeCount.textContent = count;
    var liked = uid && postData.likedBy && postData.likedBy.indexOf(uid) !== -1;
    likeBtn.className = 'post-modal-like' + (liked ? ' liked' : '');
    var icon = likeBtn.querySelector('i');
    if (icon) icon.className = (liked ? 'fas' : 'far') + ' fa-heart';
    likeBtn.onclick = function() {
      handleGrammLikeModal(postId, postData);
    };

    // Build liked-by list
    var likedByEl = document.getElementById('postModalLikedBy');
    if (likedByEl && postData.likedBy && postData.likedBy.length > 0) {
      var html = '<i class="fas fa-heart" style="color:#ef4444;font-size:10px;margin-right:4px"></i>';
      postData.likedBy.forEach(function(id) {
        var cached = getDisplayName(id, null);
        var name = cached || id.substring(0, 8);
        html += '<span class="likedby-avatar">' + getAvatarHtml(id, name, 18) + '</span>';
      });
      likedByEl.innerHTML = html;
      likedByEl.style.display = 'flex';
    } else if (likedByEl) {
      likedByEl.style.display = 'none';
    }

    // Load comments
    setupPostModalComments(postId, uid);

    modal.style.display = 'flex';
  }

  function handleGrammLikeModal(postId, postData) {
    if (!currentUserId) { showToast('Войдите, чтобы ставить лайки', 'error'); return; }
    if (typeof db === 'undefined') return;
    var liked = postData.likedBy && postData.likedBy.indexOf(currentUserId) !== -1;
    var update = liked ? {
      likedBy: firebase.firestore.FieldValue.arrayRemove(currentUserId),
      likeCount: firebase.firestore.FieldValue.increment(-1)
    } : {
      likedBy: firebase.firestore.FieldValue.arrayUnion(currentUserId),
      likeCount: firebase.firestore.FieldValue.increment(1)
    };
    db.collection('gramm_posts').doc(postId).update(update).catch(function() {});
    var likeBtn = document.getElementById('postModalLike');
    var countEl = document.getElementById('postModalLikeCount');
    var newCount = (postData.likeCount || 0) + (liked ? -1 : 1);
    countEl.textContent = newCount;
    if (liked) {
      likeBtn.classList.remove('liked');
    } else {
      likeBtn.classList.add('liked');
    }
    var icon = likeBtn.querySelector('i');
    if (icon) icon.className = (liked ? 'far' : 'fas') + ' fa-heart';
    postData.likeCount = newCount;
    if (liked && postData.likedBy) {
      postData.likedBy = postData.likedBy.filter(function(id) { return id !== currentUserId; });
    } else if (!liked) {
      if (!postData.likedBy) postData.likedBy = [];
      postData.likedBy.push(currentUserId);
    }
    // Update liked-by display
    var likedByEl = document.getElementById('postModalLikedBy');
    if (likedByEl) {
      if (postData.likedBy && postData.likedBy.length > 0) {
        var html = '<i class="fas fa-heart" style="color:#ef4444;font-size:10px;margin-right:4px"></i>';
        postData.likedBy.forEach(function(id) {
          var cached = getDisplayName(id, null);
          var name = cached || id.substring(0, 8);
          html += '<span class="likedby-avatar">' + getAvatarHtml(id, name, 18) + '</span>';
        });
        likedByEl.innerHTML = html;
        likedByEl.style.display = 'flex';
      } else {
        likedByEl.style.display = 'none';
      }
    }
  }

  var grammCommentListener = null;

  var pmFileData = null;
  var pmReplyingTo = null;

  function openPhotoExpand(url) {
    var overlay = document.getElementById('pmPhotoExpand');
    var img = document.getElementById('pmPhotoExpandImg');
    if (!overlay || !img) return;
    img.src = url;
    overlay.style.display = 'flex';
  }

  document.getElementById('pmPhotoExpand').addEventListener('click', function(e) {
    if (e.target === this || e.target.id === 'pmPhotoClose') {
      this.style.display = 'none';
    }
  });

  function toggleCommentReaction(postId, commentId, emoji, commentData) {
    if (!currentUserId) { showToast('Войдите, чтобы ставить реакции', 'error'); return; }
    if (typeof db === 'undefined') return;
    var reactions = commentData.reactions || {};
    var usersKey = emoji + '_users';
    var users = reactions[usersKey] || [];
    var idx = users.indexOf(currentUserId);
    if (idx !== -1) {
      users.splice(idx, 1);
      reactions[emoji] = Math.max(0, (reactions[emoji] || 1) - 1);
    } else {
      users.push(currentUserId);
      reactions[emoji] = (reactions[emoji] || 0) + 1;
    }
    reactions[usersKey] = users;
    db.collection('gramm_posts').doc(postId).collection('comments').doc(commentId).update({
      reactions: reactions
    }).catch(function(err) { console.warn('[Gramm] reaction error:', err); });
  }

  function setupPostModalComments(postId, uid) {
    var list = document.getElementById('postModalCommentsList');
    var input = document.getElementById('postModalCommentInput');
    var sendBtn = document.getElementById('postModalCommentSend');
    if (!list) return;
    list.innerHTML = '<div style="color:rgba(255,255,255,0.15);font-size:12px;padding:8px 0">Загрузка...</div>';
    if (grammCommentListener) grammCommentListener();
    grammCommentListener = db.collection('gramm_posts').doc(postId).collection('comments').orderBy('createdAt', 'asc').onSnapshot(function(snap) {
      list.innerHTML = '';
      if (snap.empty) {
        list.innerHTML = '<div style="color:rgba(255,255,255,0.12);font-size:12px;padding:8px 0">Пока нет комментариев</div>';
        return;
      }
      var reactionEmojis = [{e:'👍',l:'👍'},{e:'❤️',l:'❤️'},{e:'😂',l:'😂'},{e:'🔥',l:'🔥'},{e:'😮',l:'😮'}];
      snap.forEach(function(doc) {
        var c = doc.data();
        var ct = timeAgo(c.createdAt ? c.createdAt.toDate() : null);
        var cAvatar = getAvatarHtml(c.authorId, c.author, 24);
        var cName = c.author;
        var cCached = getDisplayName(c.authorId, c.author);
        if (cCached) cName = cCached;
        var isOwn = c.authorId && c.authorId === currentUserId;
        var div = document.createElement('div');
        div.className = 'post-modal-comment';
        var textHtml = escapeHtml(c.text || '');
        if (c.replyTo) textHtml = '<span style="color:rgba(139,92,246,0.4);font-size:12px">@' + escapeHtml(c.replyTo) + '</span> ' + textHtml;
        if (c.imageUrl) textHtml += '<img src="' + c.imageUrl + '" class="pm-comment-img" alt="">';
        var origText = escapeHtml(c.text || '').substring(0, 120);
        var quoteHtml = '';
        if (c.replyTo && origText) {
          quoteHtml = '<span class="pm-comment-reply-quote">' + origText + (c.text && c.text.length > 120 ? '…' : '') + '</span>';
        }
        div.innerHTML = '<span class="post-modal-comment-avatar">' + cAvatar + '</span><div class="post-modal-comment-body"><span class="post-modal-comment-author">' + escapeHtml(cName) + '</span><span class="post-modal-comment-time">' + ct + '</span><div class="post-modal-comment-text">' + quoteHtml + textHtml + '</div></div>';
        // Action row (hover)
        var actionRow = document.createElement('div');
        actionRow.className = 'pm-comment-actions';
        // Reactions
        var reactionsDiv = document.createElement('div');
        reactionsDiv.className = 'pm-comment-reactions';
        var cReactions = c.reactions || {};
        reactionEmojis.forEach(function(re) {
          var rb = document.createElement('button');
          rb.textContent = re.l;
          var count = cReactions[re.e] || 0;
          var hasReacted = currentUserId && cReactions[re.e + '_users'] && cReactions[re.e + '_users'].indexOf(currentUserId) !== -1;
          if (count > 0) rb.textContent = re.l + ' ' + count;
          if (hasReacted) rb.classList.add('pm-reacted');
          rb.onclick = function(e) { e.stopPropagation(); toggleCommentReaction(postId, doc.id, re.e, c); };
          reactionsDiv.appendChild(rb);
        });
        actionRow.appendChild(reactionsDiv);
        // Reply button
        var replyBtn = document.createElement('button');
        replyBtn.className = 'pm-comment-reply-btn';
        replyBtn.textContent = 'Ответить';
        replyBtn.onclick = function(e) {
          e.stopPropagation();
          pmReplyingTo = { id: doc.id, author: cName };
          cid = pmReplyingTo.id; // store for quote lookup
          var badge = document.getElementById('pmReplyBadge');
          var wrap = document.getElementById('postModalCommentInputWrap');
          if (badge) { badge.style.display = 'flex'; badge.querySelector('span').textContent = 'Ответ @' + cName; }
          if (wrap) wrap.style.borderTop = 'none';
          document.getElementById('postModalCommentInput').focus();
        };
        actionRow.appendChild(replyBtn);
        div.querySelector('.post-modal-comment-body').appendChild(actionRow);
        // Delete
        if (isOwn && doc.id) {
          var del = document.createElement('button');
          del.className = 'post-modal-comment-del';
          del.innerHTML = '<i class="fas fa-trash-alt"></i>';
          del.title = 'Удалить комментарий';
          del.onclick = function(e) {
            e.stopPropagation();
            var delId = doc.id;
            showConfirmModal('Удалить комментарий?', function() {
              db.collection('gramm_posts').doc(postId).collection('comments').doc(delId).delete().then(function() {
                db.collection('gramm_posts').doc(postId).update({
                  commentCount: firebase.firestore.FieldValue.increment(-1)
                }).catch(function() {});
                hideConfirmModal();
              }).catch(function(err) {
                hideConfirmModal();
                showToast('Ошибка: ' + err.message, 'error');
              });
            });
          };
          div.appendChild(del);
        }
        list.appendChild(div);
      });
    });

    // Emoji picker
    var emojiBtn = document.getElementById('pmEmojiBtn');
    var emojiPicker = document.getElementById('pmEmojiPicker');
    if (emojiBtn && emojiPicker) {
      var emojis = ['😀','😁','😂','🤣','😊','😍','🥰','😎','🤩','😢','😭','😤','🤔','🙄','👍','❤️','🔥','💯','🎉','🙏','✨','💀','😈','👀','💪','🤝','🫡','🙌'];
      emojiPicker.innerHTML = emojis.map(function(e) { return '<button type="button" data-e="' + e + '">' + e + '</button>'; }).join('');
      emojiBtn.onclick = function(e) { e.stopPropagation(); emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'grid' : 'none'; };
      emojiPicker.onclick = function(e) {
        var btn = e.target.closest('button[data-e]');
        if (btn) { input.value += btn.getAttribute('data-e'); input.focus(); }
      };
      document.addEventListener('click', function(e) {
        if (!e.target.closest('#pmEmojiBtn') && !e.target.closest('#pmEmojiPicker')) { emojiPicker.style.display = 'none'; }
      });
    }

    // Comment photo attach
    var attachBtn = document.getElementById('pmAttachBtn');
    var fileInput = document.getElementById('pmFileInput');
    if (attachBtn && fileInput) {
      attachBtn.onclick = function() { fileInput.click(); };
      fileInput.onchange = function(e) {
        var file = e.target.files[0];
        if (!file) return;
        resizeCommentImage(file);
      };
    }

    // Comment paste
    input.addEventListener('paste', function(e) {
      var items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          var file = items[i].getAsFile();
          if (file) { resizeCommentImage(file); break; }
        }
      }
    });

    function resizeCommentImage(file) {
      var reader = new FileReader();
      reader.onload = function(ev) {
        var img = new Image();
        img.onload = function() {
          var MAX = 800;
          var w = img.width, h = img.height;
          if (w > MAX || h > MAX) {
            var ratio = Math.min(MAX / w, MAX / h);
            w = Math.round(w * ratio); h = Math.round(h * ratio);
          }
          var c = document.createElement('canvas');
          c.width = w; c.height = h;
          c.getContext('2d').drawImage(img, 0, 0, w, h);
          pmFileData = c.toDataURL('image/jpeg', 0.7);
          var preview = document.getElementById('pmCommentPreview');
          var container = document.getElementById('pmCommentPreviewContainer');
          if (preview && container) {
            container.innerHTML = '<img src="' + pmFileData + '" alt="">';
            preview.style.display = 'flex';
          }
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }

    var previewRemove = document.getElementById('pmCommentPreviewRemove');
    if (previewRemove) {
      previewRemove.onclick = function() {
        pmFileData = null;
        var preview = document.getElementById('pmCommentPreview');
        if (preview) preview.style.display = 'none';
        fileInput.value = '';
      };
    }

    // Reply cancel
    var replyCancel = document.getElementById('pmReplyCancel');
    if (replyCancel) {
      replyCancel.onclick = function() {
        pmReplyingTo = null;
        var badge = document.getElementById('pmReplyBadge');
        if (badge) badge.style.display = 'none';
      };
    }
    // Ensure badge starts hidden
    var replyBadge = document.getElementById('pmReplyBadge');
    if (replyBadge) replyBadge.style.display = 'none';

    // Send comment
    if (sendBtn) {
      sendBtn.onclick = function() {
        var text = input.value.trim();
        if (!text && !pmFileData) return;
        var author = document.getElementById('userName').textContent || 'Аноним';
        var commentData = {
          text: text || '',
          author: author,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        if (pmReplyingTo) {
          commentData.replyTo = pmReplyingTo.author;
          commentData.replyToId = pmReplyingTo.id;
        }
        if (pmFileData) commentData.imageUrl = pmFileData;
        if (currentUserId) commentData.authorId = currentUserId;
        db.collection('gramm_posts').doc(postId).collection('comments').add(commentData).then(function() {
          input.value = '';
          pmFileData = null;
          pmReplyingTo = null;
          var preview = document.getElementById('pmCommentPreview');
          if (preview) preview.style.display = 'none';
          var badge = document.getElementById('pmReplyBadge');
          if (badge) badge.style.display = 'none';
          fileInput.value = '';
          db.collection('gramm_posts').doc(postId).update({
            commentCount: firebase.firestore.FieldValue.increment(1)
          }).catch(function() {});
        }).catch(function(err) {
          showToast('Ошибка: ' + err.message, 'error');
        });
      };
      input.onkeydown = function(e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendBtn.click(); }
      };
    }
  }

  function setupGrammTabs() {
    var tabs = document.querySelectorAll('.gramm-tab');
    console.log('[Gramm] tabs found:', tabs.length);
    tabs.forEach(function(tab, i) {
      console.log('[Gramm] tab', i, tab.getAttribute('data-tab'), tab.style.display, getComputedStyle(tab).display);
      tab.style.display = '';
      tab.onclick = function() {
        tabs.forEach(function(t) { t.classList.remove('active'); });
        this.classList.add('active');
        var tabName = this.getAttribute('data-tab');
        document.getElementById('grammFeedView').style.display = tabName === 'feed' ? 'block' : 'none';
        document.getElementById('grammUserView').style.display = 'none';
        document.getElementById('grammProfileView').style.display = tabName === 'profile' ? 'block' : 'none';
        if (tabName === 'profile') renderGrammProfile();
      };
    });
  }

  function setupGrammFab() {
    var fab = document.getElementById('grammFab');
    if (!fab) return;
    fab.onclick = function() {
      document.querySelectorAll('.gramm-view').forEach(function(v) { v.style.display = 'none'; });
      document.getElementById('grammCreateView').style.display = 'block';
    };
  }

  // Profile back buttons
  var grammUserBack = document.getElementById('grammUserBack');
  if (grammUserBack) {
    grammUserBack.onclick = function() { showGrammFeed(); };
  }
  var grammMyBack = document.getElementById('grammMyBack');
  if (grammMyBack) {
    grammMyBack.onclick = function() { showGrammFeed(); };
  }

  // Post modal author click delegation
  document.getElementById('postModal').addEventListener('click', function(e) {
    var el = e.target.closest('.gramm-post-author-clickable');
    if (el) {
      e.stopPropagation();
      hidePostModal();
      var author = el.getAttribute('data-author');
      if (author) renderGrammUserProfile(null, author);
    }
  });

  var confirmCallback = null;

  function showConfirmModal(text, cb) {
    var modal = document.getElementById('confirmModal');
    var textEl = document.getElementById('confirmText');
    if (textEl) textEl.innerHTML = text || 'Вы уверены?<br>Это действие нельзя отменить.';
    confirmCallback = cb || null;
    if (modal) modal.style.display = 'flex';
  }

  function hideConfirmModal() {
    var modal = document.getElementById('confirmModal');
    if (modal) modal.style.display = 'none';
    pendingDeleteId = null;
  }

  function setupConfirmModal() {
    var cancel = document.getElementById('confirmCancel');
    var ok = document.getElementById('confirmOk');
    if (cancel) cancel.onclick = hideConfirmModal;
    if (ok) {
      ok.onclick = function() {
        if (confirmCallback) {
          var cb = confirmCallback;
          confirmCallback = null;
          cb();
          return;
        }
        if (!pendingDeleteId) { hideConfirmModal(); return; }
        db.collection('gramm_posts').doc(pendingDeleteId).delete().then(function() {
          hideConfirmModal();
          showToast('Удалено', 'success');
        }).catch(function(err) {
          hideConfirmModal();
          showToast('Ошибка: ' + err.message, 'error');
        });
      };
    }
    var overlay = document.getElementById('confirmModal');
    if (overlay) overlay.onclick = function(e) { if (e.target === overlay) hideConfirmModal(); };
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  function getInitials(name) {
    var parts = (name || '?').split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  }

  function resizeAndPreview(file) {
    var reader = new FileReader();
    reader.onload = function(ev) {
      var img = new Image();
      img.onload = function() {
        var MAX = 1600;
        var w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          var ratio = Math.min(MAX / w, MAX / h);
          w = Math.round(w * ratio); h = Math.round(h * ratio);
        }
        var c = document.createElement('canvas');
        c.width = w; c.height = h;
        var ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        grammFileData = c.toDataURL('image/jpeg', 0.75);
        showPreview(grammFileData);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function setupGrammForm() {
    var btn = document.getElementById('grammPostBtn');
    var createShareBtn = document.getElementById('grammCreateShare');

    var authorEl = document.getElementById('userName');
    if (authorEl) {
      var name = authorEl.textContent;
      var avatarEl = document.getElementById('grammAvatar');
      if (avatarEl) avatarEl.textContent = getInitials(name);
    }

    var attachBtn = document.getElementById('grammAttachBtn');
    var fileInput = document.getElementById('grammFileInput');
    if (attachBtn && fileInput) {
      attachBtn.onclick = function() { fileInput.click(); };
      fileInput.onchange = function(e) {
        var file = e.target.files[0];
        if (!file) return;
        resizeAndPreview(file);
      };
    }

    document.addEventListener('paste', function(e) {
      var items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          var file = items[i].getAsFile();
          if (file) { resizeAndPreview(file); break; }
        }
      }
    });

    var urlBtn = document.getElementById('grammUrlBtn');
    var urlRow = document.getElementById('grammUrlRow');
    if (urlBtn && urlRow) {
      urlBtn.onclick = function() {
        var shown = urlRow.style.display !== 'none';
        urlRow.style.display = shown ? 'none' : 'block';
        if (!shown) document.getElementById('grammImageUrl').focus();
      };
    }

    var removeBtn = document.getElementById('grammPreviewRemove');
    if (removeBtn) {
      removeBtn.onclick = function() { clearAttachment(); };
    }

    function doPost() {
      var imgUrl = document.getElementById('grammImageUrl').value.trim();
      var caption = document.getElementById('grammCaption').value.trim();
      var imageUrl = grammFileData || imgUrl;
      if (!imageUrl) { showToast('Добавьте фото или ссылку', 'error'); return; }
      if (typeof db === 'undefined') { showToast('База данных недоступна', 'error'); return; }
      var authorEl = document.getElementById('userName');
      var author = authorEl ? authorEl.textContent : 'Аноним';
      var postData = {
        imageUrl: imageUrl,
        caption: caption,
        author: author,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      if (currentUserId) postData.authorId = currentUserId;
      db.collection('gramm_posts').add(postData).then(function() {
        clearAttachment();
        document.getElementById('grammImageUrl').value = '';
        document.getElementById('grammCaption').value = '';
        document.getElementById('grammUrlRow').style.display = 'none';
        showToast('Опубликовано!', 'success');
        // Switch to feed
        switchGrammTab('feed');
      }).catch(function(err) {
        showToast('Ошибка: ' + err.message, 'error');
      });
    }

    if (btn) btn.onclick = doPost;
    if (createShareBtn) createShareBtn.onclick = doPost;
  }
  }

  function showPreview(dataUrl) {
    var container = document.getElementById('grammPreviewContainer');
    var preview = document.getElementById('grammPreview');
    if (!container || !preview) return;
    var isVideo = dataUrl.startsWith('data:video/');
    if (isVideo) {
      container.innerHTML = '<video src="' + dataUrl + '" controls playsinline style="width:100%;max-height:240px;display:block;background:rgba(0,0,0,0.2)"></video>';
    } else {
      container.innerHTML = '<img src="' + dataUrl + '" alt="" style="width:100%;max-height:240px;object-fit:contain;display:block;background:rgba(0,0,0,0.2)">';
    }
    preview.style.display = 'block';
  }

  function clearAttachment() {
    grammFileData = null;
    var preview = document.getElementById('grammPreview');
    if (preview) preview.style.display = 'none';
    var fileInput = document.getElementById('grammFileInput');
    if (fileInput) fileInput.value = '';
  }

  function hidePostModal() {
    document.getElementById('postModal').style.display = 'none';
  }

  // Post modal close
  document.addEventListener('click', function(e) {
    var modal = document.getElementById('postModal');
    if (modal && modal.style.display === 'flex' && e.target === modal) {
      hidePostModal();
    }
  });
  var postModalClose = document.getElementById('postModalClose');
  if (postModalClose) {
    postModalClose.onclick = hidePostModal;
  }

  // ===== Banner upload =====
  function loadBanner(userId, coverImgEl, coverEl) {
    if (!userId || typeof db === 'undefined') return;
    db.collection('gramm_profiles').doc(userId).get().then(function(doc) {
      if (doc.exists && doc.data().bannerUrl) {
        coverImgEl.src = doc.data().bannerUrl;
        coverImgEl.style.display = 'block';
        if (coverEl) coverEl.classList.add('has-banner');
      }
    }).catch(function() {});
  }

  function setupBannerUpload() {
    var btn = document.getElementById('grammBannerBtn');
    if (!btn) return;
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);
    btn.onclick = function() { input.click(); };
    input.onchange = function(e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        var img = new Image();
        img.onload = function() {
          var MAX = 1200;
          var w = img.width, h = img.height;
          if (w > MAX || h > MAX) {
            var ratio = Math.min(MAX / w, MAX / h);
            w = Math.round(w * ratio); h = Math.round(h * ratio);
          }
          var c = document.createElement('canvas');
          c.width = w; c.height = h;
          c.getContext('2d').drawImage(img, 0, 0, w, h);
          var dataUrl = c.toDataURL('image/jpeg', 0.8);
          if (!currentUserId) { showToast('Ошибка авторизации', 'error'); return; }
          db.collection('gramm_profiles').doc(currentUserId).set({ bannerUrl: dataUrl }, { merge: true }).then(function() {
            var imgEl = document.getElementById('grammMyCoverImg');
            var coverEl = document.getElementById('grammMyCover');
            if (imgEl) { imgEl.src = dataUrl; imgEl.style.display = 'block'; }
            if (coverEl) coverEl.classList.add('has-banner');
            showToast('Обложка обновлена', 'success');
          }).catch(function(err) {
            showToast('Ошибка: ' + err.message, 'error');
          });
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };
  }

  // ===== TikTok-style Comment Sheet =====
  var ttsPostData = null;
  var ttsPostId = null;
  var ttsListener = null;
  var ttsFileData = null;
  var ttsReplyingTo = null;
  var ttsReactionEmojis = [{e:'👍',l:'👍'},{e:'❤️',l:'❤️'},{e:'😂',l:'😂'},{e:'🔥',l:'🔥'},{e:'😮',l:'😮'}];

  function openCommentSheet(postData) {
    ttsPostData = postData;
    ttsPostId = postData._id;
    var overlay = document.getElementById('ttsOverlay');
    var sheet = document.getElementById('ttsSheet');
    if (!overlay || !sheet) return;

    // Populate header
    var displayName = postData.author;
    var cached = getDisplayName(postData.authorId, postData.author);
    if (cached) displayName = cached;
    document.getElementById('ttsAuthor').textContent = displayName;
    document.getElementById('ttsCaption').textContent = postData.caption || '';
    var mediaImg = document.getElementById('ttsMediaImg');
    if (postData.imageUrl && !isVideoUrl(postData.imageUrl) && !getYoutubeEmbed(postData.imageUrl)) {
      mediaImg.src = postData.imageUrl;
      mediaImg.style.display = 'block';
    } else {
      mediaImg.style.display = 'none';
    }

    document.getElementById('ttsInput').value = '';
    ttsFileData = null;
    ttsReplyingTo = null;
    document.getElementById('ttsReplyBadge').style.display = 'none';
    document.getElementById('ttsPreview').style.display = 'none';

    overlay.classList.add('open');
    sheet.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Start comment listener
    setupTtsComments(ttsPostId);
  }

  function closeCommentSheet() {
    var overlay = document.getElementById('ttsOverlay');
    var sheet = document.getElementById('ttsSheet');
    if (overlay) overlay.classList.remove('open');
    if (sheet) sheet.classList.remove('open');
    document.body.style.overflow = '';
    if (ttsListener) { ttsListener(); ttsListener = null; }
    ttsPostData = null;
    ttsPostId = null;
    ttsFileData = null;
    ttsReplyingTo = null;
  }

  function setupTtsComments(postId) {
    var body = document.getElementById('ttsBody');
    if (!body) return;
    if (ttsListener) ttsListener();
    body.innerHTML = '<div class="tts-empty" id="ttsEmpty"><i class="far fa-comment-dots"></i>Загрузка...</div>';
    ttsListener = db.collection('gramm_posts').doc(postId).collection('comments').orderBy('createdAt', 'asc').onSnapshot(function(snap) {
      body.innerHTML = '';
      if (snap.empty) {
        body.innerHTML = '<div class="tts-empty"><i class="far fa-comment-dots"></i>Нет комментариев</div>';
        return;
      }
      snap.forEach(function(doc) {
        var c = doc.data();
        var ct = timeAgo(c.createdAt ? c.createdAt.toDate() : null);
        var cAvatar = getAvatarHtml(c.authorId, c.author, 28);
        var cName = c.author;
        var cCached = getDisplayName(c.authorId, c.author);
        if (cCached) cName = cCached;
        var isOwn = c.authorId && c.authorId === currentUserId;
        var div = document.createElement('div');
        div.className = 'tts-comment';
        var textHtml = escapeHtml(c.text || '');
        var origText = escapeHtml(c.text || '').substring(0, 120);
        var quoteHtml = '';
        if (c.replyTo && origText) {
          quoteHtml = '<span class="pm-comment-reply-quote">' + origText + (c.text && c.text.length > 120 ? '…' : '') + '</span>';
        }
        if (c.replyTo) textHtml = '<span style="color:rgba(139,92,246,0.4);font-size:12px">@' + escapeHtml(c.replyTo) + '</span> ' + textHtml;
        if (c.imageUrl) textHtml += '<img src="' + c.imageUrl + '" class="tts-comment-img" alt="">';
        div.innerHTML = '<span class="tts-comment-avatar">' + cAvatar + '</span><div class="tts-comment-body"><span class="tts-comment-author">' + escapeHtml(cName) + '</span><span class="tts-comment-time">' + ct + '</span><div class="tts-comment-text">' + quoteHtml + textHtml + '</div></div>';
        // Actions
        var actionRow = document.createElement('div');
        actionRow.className = 'pm-comment-actions';
        var reactionsDiv = document.createElement('div');
        reactionsDiv.className = 'pm-comment-reactions';
        var cReactions = c.reactions || {};
        ttsReactionEmojis.forEach(function(re) {
          var rb = document.createElement('button');
          rb.textContent = re.l;
          var count = cReactions[re.e] || 0;
          var hasReacted = currentUserId && cReactions[re.e + '_users'] && cReactions[re.e + '_users'].indexOf(currentUserId) !== -1;
          if (count > 0) rb.textContent = re.l + ' ' + count;
          if (hasReacted) rb.classList.add('pm-reacted');
          rb.onclick = function(e) { e.stopPropagation(); toggleCommentReaction(postId, doc.id, re.e, c); };
          reactionsDiv.appendChild(rb);
        });
        actionRow.appendChild(reactionsDiv);
        var replyBtn = document.createElement('button');
        replyBtn.className = 'pm-comment-reply-btn';
        replyBtn.textContent = 'Ответить';
        replyBtn.onclick = function(e) {
          e.stopPropagation();
          ttsReplyingTo = { id: doc.id, author: cName };
          var badge = document.getElementById('ttsReplyBadge');
          if (badge) { badge.style.display = 'flex'; document.getElementById('ttsReplyLabel').textContent = 'Ответ @' + cName; }
          document.getElementById('ttsInput').focus();
        };
        actionRow.appendChild(replyBtn);
        div.querySelector('.tts-comment-body').appendChild(actionRow);
        // Delete
        if (isOwn && doc.id) {
          var del = document.createElement('button');
          del.className = 'tts-comment-del';
          del.innerHTML = '<i class="fas fa-trash-alt"></i>';
          del.onclick = function(e) {
            e.stopPropagation();
            showConfirmModal('Удалить комментарий?', function() {
              db.collection('gramm_posts').doc(postId).collection('comments').doc(doc.id).delete().then(function() {
                db.collection('gramm_posts').doc(postId).update({
                  commentCount: firebase.firestore.FieldValue.increment(-1)
                }).catch(function() {});
                hideConfirmModal();
              }).catch(function(err) {
                hideConfirmModal();
                showToast('Ошибка: ' + err.message, 'error');
              });
            });
          };
          div.appendChild(del);
        }
        body.appendChild(div);
      });
    });
  }

  function setupTtsInput() {
    var overlay = document.getElementById('ttsOverlay');
    var sheet = document.getElementById('ttsSheet');
    var closeBtn = document.getElementById('ttsClose');
    if (overlay) overlay.onclick = closeCommentSheet;
    if (closeBtn) closeBtn.onclick = closeCommentSheet;

    var input = document.getElementById('ttsInput');
    var sendBtn = document.getElementById('ttsSendBtn');
    if (!input || !sendBtn) return;

    // Emoji picker
    var emojiBtn = document.getElementById('ttsEmojiBtn');
    var emojiPicker = document.getElementById('ttsEmojiPicker');
    if (emojiBtn && emojiPicker) {
      var emojis = ['😀','😁','😂','🤣','😊','😍','🥰','😎','🤩','😢','😭','😤','🤔','🙄','👍','❤️','🔥','💯','🎉','🙏','✨','💀','😈','👀','💪','🤝','🫡','🙌'];
      emojiPicker.innerHTML = emojis.map(function(e) { return '<button type="button" data-e="' + e + '">' + e + '</button>'; }).join('');
      emojiBtn.onclick = function(e) { e.stopPropagation(); emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'grid' : 'none'; };
      emojiPicker.onclick = function(e) {
        var btn = e.target.closest('button[data-e]');
        if (btn) { input.value += btn.getAttribute('data-e'); input.focus(); }
      };
      document.addEventListener('click', function(e) {
        if (!e.target.closest('#ttsEmojiBtn') && !e.target.closest('#ttsEmojiPicker')) { emojiPicker.style.display = 'none'; }
      });
    }

    // Photo attach
    var attachBtn = document.getElementById('ttsAttachBtn');
    var fileInput = document.getElementById('ttsFileInput');
    if (attachBtn && fileInput) {
      attachBtn.onclick = function() { fileInput.click(); };
      fileInput.onchange = function(e) {
        var file = e.target.files[0];
        if (!file) return;
        resizeTtsImage(file);
      };
    }

    // Paste
    input.addEventListener('paste', function(e) {
      var items = e.clipboardData && e.clipboardData.items;
      if (!items) return;
      for (var i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          var file = items[i].getAsFile();
          if (file) { resizeTtsImage(file); break; }
        }
      }
    });

    function resizeTtsImage(file) {
      var reader = new FileReader();
      reader.onload = function(ev) {
        var img = new Image();
        img.onload = function() {
          var MAX = 800;
          var w = img.width, h = img.height;
          if (w > MAX || h > MAX) {
            var ratio = Math.min(MAX / w, MAX / h);
            w = Math.round(w * ratio); h = Math.round(h * ratio);
          }
          var c = document.createElement('canvas');
          c.width = w; c.height = h;
          c.getContext('2d').drawImage(img, 0, 0, w, h);
          ttsFileData = c.toDataURL('image/jpeg', 0.7);
          var preview = document.getElementById('ttsPreview');
          var container = document.getElementById('ttsPreviewContainer');
          if (preview && container) {
            container.innerHTML = '<img src="' + ttsFileData + '" alt="">';
            preview.style.display = 'flex';
          }
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }

    var previewRemove = document.getElementById('ttsPreviewRemove');
    if (previewRemove) {
      previewRemove.onclick = function() {
        ttsFileData = null;
        var preview = document.getElementById('ttsPreview');
        if (preview) preview.style.display = 'none';
        fileInput.value = '';
      };
    }

    // Reply cancel
    var replyCancel = document.getElementById('ttsReplyCancel');
    if (replyCancel) {
      replyCancel.onclick = function() {
        ttsReplyingTo = null;
        var badge = document.getElementById('ttsReplyBadge');
        if (badge) badge.style.display = 'none';
      };
    }

    // Send
    sendBtn.onclick = function() {
      var text = input.value.trim();
      if (!text && !ttsFileData) return;
      var pid = ttsPostId;
      if (!pid) return;
      var author = document.getElementById('userName').textContent || 'Аноним';
      var commentData = {
        text: text || '',
        author: author,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      if (ttsReplyingTo) {
        commentData.replyTo = ttsReplyingTo.author;
        commentData.replyToId = ttsReplyingTo.id;
      }
      if (ttsFileData) commentData.imageUrl = ttsFileData;
      if (currentUserId) commentData.authorId = currentUserId;
      db.collection('gramm_posts').doc(pid).collection('comments').add(commentData).then(function() {
        input.value = '';
        ttsFileData = null;
        ttsReplyingTo = null;
        var preview = document.getElementById('ttsPreview');
        if (preview) preview.style.display = 'none';
        var badge = document.getElementById('ttsReplyBadge');
        if (badge) badge.style.display = 'none';
        fileInput.value = '';
        db.collection('gramm_posts').doc(pid).update({
          commentCount: firebase.firestore.FieldValue.increment(1)
        }).catch(function() {});
      }).catch(function(err) {
        showToast('Ошибка: ' + err.message, 'error');
      });
    };

    input.onkeydown = function(e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendBtn.click(); }
    };
  }

  // ===== Stories =====
  function renderGrammStories() {
    var container = document.getElementById('grammStories');
    if (!container) return;
    container.innerHTML = '';
    // "Your story" add button
    var addStory = document.createElement('div');
    addStory.className = 'gramm-story';
    addStory.innerHTML = '<div class="gramm-story-ring"><div class="gramm-story-ring-inner"><div class="gramm-story-add"><i class="fas fa-plus"></i></div></div></div><span class="gramm-story-name">Вы</span>';
    addStory.onclick = function() { document.querySelectorAll('.gramm-view').forEach(function(v) { v.style.display = 'none'; }); document.getElementById('grammCreateView').style.display = 'block'; };
    container.appendChild(addStory);
    // Recent posters as stories
    var seen = {};
    grammPosts.slice().reverse().forEach(function(p) {
      var uid = p.authorId || p.author;
      if (seen[uid]) return;
      seen[uid] = true;
      if (Object.keys(seen).length > 10) return;
      var name = p.author;
      var cached = getDisplayName(p.authorId, p.author);
      if (cached) name = cached;
      var avatar = getAvatarHtml(p.authorId, p.author, 54);
      var s = document.createElement('div');
      s.className = 'gramm-story';
      s.setAttribute('data-author', p.author);
      s.innerHTML = '<div class="gramm-story-ring"><div class="gramm-story-ring-inner">' + avatar + '</div></div><span class="gramm-story-name">' + escapeHtml(name) + '</span>';
      s.onclick = function() { renderGrammUserProfile(p.authorId, p.author); };
      container.appendChild(s);
    });
  }

  function renderGrammHighlights() {
    var container = document.getElementById('grammMyHighlights');
    if (!container) return;
    container.innerHTML = '';
    var myPosts = grammPosts.filter(function(p) {
      return (p.authorId === currentUserId || (!p.authorId && p.author === (document.getElementById('userName').textContent || ''))) && p.imageUrl;
    });
    // Show highlights as rings for latest posts (max 6)
    myPosts.slice(-6).reverse().forEach(function(p) {
      var ring = document.createElement('div');
      ring.className = 'gramm-ig-highlight-circle';
      var imgHtml = '<img src="' + p.imageUrl + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%">';
      ring.innerHTML = '<div class="gramm-ig-highlight-ring">' + imgHtml + '</div><span class="gramm-ig-highlight-label">' + (p.caption ? p.caption.substring(0, 12) : 'Пост') + '</span>';
      ring.onclick = function() { openPostModal(p._id, p, currentUserId); };
      container.appendChild(ring);
    });
  }

  // ===== Bio =====
  function loadBio(userId, bioEl) {
    if (!userId || typeof db === 'undefined') return;
    db.collection('gramm_profiles').doc(userId).get().then(function(doc) {
      if (doc.exists && doc.data().bio) {
        bioEl.textContent = doc.data().bio;
        bioEl.style.display = 'block';
      }
    }).catch(function() {});
  }

  function setupBioEdit() {
    // Bio editing is now handled in renderGrammProfile
  }

  // Override renderGrammPosts to also render stories
  var origRenderPosts = renderGrammPosts;
  renderGrammPosts = function() {
    origRenderPosts();
    renderGrammStories();
  };

  // Update profile renders to load bio
  var origRenderProfile = renderGrammProfile;
  renderGrammProfile = function() {
    origRenderProfile();
    if (currentUserId) loadBio(currentUserId, document.getElementById('grammMyBio'));
  };
  var origRenderUserProfile = renderGrammUserProfile;
  renderGrammUserProfile = function(authorId, authorName) {
    origRenderUserProfile(authorId, authorName);
    var uid = authorId || null;
    if (uid) {
      loadBio(uid, document.getElementById('grammUserBio'));
    } else {
      // Look up by name
      var found = null;
      for (var key in avatarByName) {
        if (key === (authorName || '').toLowerCase().trim()) {
          found = avatarByName[key];
          break;
        }
      }
      if (found) loadBio(found, document.getElementById('grammUserBio'));
    }
  };

  // ===== Follow System =====
  var grammFollowing = {};

  function loadFollows() {
    if (!currentUserId || typeof db === 'undefined') return;
    db.collection('gramm_profiles').doc(currentUserId).get().then(function(doc) {
      if (doc.exists && doc.data().following) {
        doc.data().following.forEach(function(id) { grammFollowing[id] = true; });
      }
    }).catch(function() {});
  }

  function toggleFollow(targetId, targetName, btn) {
    if (!currentUserId) { showToast('Войдите, чтобы подписываться', 'error'); return; }
    if (targetId === currentUserId) return;
    if (typeof db === 'undefined') return;
    var isFollowing = grammFollowing[targetId];
    var userRef = db.collection('gramm_profiles').doc(currentUserId);
    var targetRef = db.collection('gramm_profiles').doc(targetId);
    if (isFollowing) {
      userRef.update({ following: firebase.firestore.FieldValue.arrayRemove(targetId) }).catch(function() {});
      targetRef.update({ followers: firebase.firestore.FieldValue.arrayRemove(currentUserId) }).catch(function() {});
      delete grammFollowing[targetId];
      if (btn) { btn.textContent = 'Подписаться'; btn.classList.remove('following'); }
      showToast('Отписан', 'success');
    } else {
      userRef.update({ following: firebase.firestore.FieldValue.arrayUnion(targetId) }).catch(function() {});
      targetRef.update({ followers: firebase.firestore.FieldValue.arrayUnion(currentUserId) }).catch(function() {});
      grammFollowing[targetId] = true;
      if (btn) { btn.textContent = 'Подписки'; btn.classList.add('following'); }
      addNotif(targetId, 'follow', currentUserId, document.getElementById('userName').textContent || 'Аноним', null);
      showToast('Подписан', 'success');
    }
  }

  function getFollowCount(userId, field, cb) {
    if (typeof db === 'undefined') { cb(0); return; }
    db.collection('gramm_profiles').doc(userId).get().then(function(doc) {
      if (doc.exists && doc.data()[field]) cb(doc.data()[field].length);
      else cb(0);
    }).catch(function() { cb(0); });
  }

  // ===== Notifications =====
  function addNotif(targetUserId, type, actorId, actorName, postId) {
    if (typeof db === 'undefined') return;
    if (targetUserId === actorId) return;
    db.collection('gramm_notifications').doc(targetUserId).collection('items').add({
      type: type,
      actorId: actorId,
      actorName: actorName,
      postId: postId || null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      read: false
    }).catch(function() {});
  }

  function loadNotifs() {
    var list = document.getElementById('grammNotifsList');
    if (!list || typeof db === 'undefined') return;
    list.innerHTML = '<div style="text-align:center;padding:40px 0;color:rgba(255,255,255,0.08)"><i class="fas fa-spinner fa-spin" style="font-size:28px;display:block;margin-bottom:10px"></i></div>';
    if (!currentUserId) { list.innerHTML = ''; return; }
    db.collection('gramm_notifications').doc(currentUserId).collection('items').orderBy('createdAt', 'desc').limit(50).onSnapshot(function(snap) {
      list.innerHTML = '';
      if (snap.empty) {
        list.innerHTML = '<div style="text-align:center;padding:40px 0;color:rgba(255,255,255,0.08)"><i class="far fa-bell" style="font-size:32px;display:block;margin-bottom:10px"></i>Нет уведомлений</div>';
        return;
      }
      var unreadCount = 0;
      snap.forEach(function(doc) {
        var n = doc.data();
        if (!n.read) unreadCount++;
        var div = document.createElement('div');
        div.className = 'gramm-notif' + (n.read ? '' : ' unread');
        var iconHtml = '';
        var textHtml = '';
        if (n.type === 'like') { iconHtml = '<div class="gramm-notif-icon" style="background:rgba(239,68,68,0.08);color:#ef4444"><i class="fas fa-heart"></i></div>'; textHtml = '<strong>' + escapeHtml(n.actorName) + '</strong> оценил(а) вашу публикацию'; }
        else if (n.type === 'comment') { iconHtml = '<div class="gramm-notif-icon" style="background:rgba(139,92,246,0.08);color:#8b5cf6"><i class="fas fa-comment"></i></div>'; textHtml = '<strong>' + escapeHtml(n.actorName) + '</strong> оставил(а) комментарий'; }
        else if (n.type === 'follow') { iconHtml = '<div class="gramm-notif-icon" style="background:rgba(52,211,153,0.08);color:#34d399"><i class="fas fa-user-plus"></i></div>'; textHtml = '<strong>' + escapeHtml(n.actorName) + '</strong> подписался(ась) на вас'; }
        else { iconHtml = '<div class="gramm-notif-icon"><i class="fas fa-bell"></i></div>'; textHtml = escapeHtml(n.actorName); }
        var t = timeAgo(n.createdAt ? n.createdAt.toDate() : null);
        div.innerHTML = iconHtml + '<div class="gramm-notif-body"><div class="gramm-notif-text">' + textHtml + '</div><div class="gramm-notif-time">' + t + '</div></div>';
        if (!n.read) {
          div.style.cursor = 'pointer';
          div.onclick = function() {
            db.collection('gramm_notifications').doc(currentUserId).collection('items').doc(doc.id).update({ read: true }).catch(function() {});
            div.classList.remove('unread');
            checkNotifBadge();
          };
        }
        list.appendChild(div);
      });
      if (unreadCount > 0) document.getElementById('notifDot').style.display = 'inline';
      else document.getElementById('notifDot').style.display = 'none';
    });
  }

  function checkNotifBadge() {
    if (!currentUserId || typeof db === 'undefined') return;
    db.collection('gramm_notifications').doc(currentUserId).collection('items').where('read', '==', false).get().then(function(snap) {
      if (snap.size > 0) document.getElementById('notifDot').style.display = 'inline';
      else document.getElementById('notifDot').style.display = 'none';
    }).catch(function() {});
  }

  // ===== Stories Viewer =====
  var storiesList = [];
  var storiesIndex = 0;
  var storiesTimer = null;

  function openStoriesViewer(posts, startIndex) {
    storiesList = posts;
    storiesIndex = startIndex || 0;
    var viewer = document.getElementById('storiesViewer');
    if (!viewer) return;
    viewer.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    showStory();
  }

  function showStory() {
    if (storiesIndex < 0 || storiesIndex >= storiesList.length) { closeStoriesViewer(); return; }
    var post = storiesList[storiesIndex];
    if (!post) { closeStoriesViewer(); return; }
    var name = post.author;
    var cached = getDisplayName(post.authorId, post.author);
    if (cached) name = cached;
    var tAgo = timeAgo(post.createdAt ? post.createdAt.toDate() : null);
    document.getElementById('storiesViewerAvatar').innerHTML = getAvatarHtml(post.authorId, post.author, 32);
    document.getElementById('storiesViewerName').textContent = name;
    document.getElementById('storiesViewerTime').textContent = tAgo;
    document.getElementById('storiesCaption').textContent = post.caption || '';
    document.getElementById('storiesReplyInput').value = '';
    // Progress
    var progress = document.getElementById('storiesProgress');
    progress.innerHTML = '';
    for (var i = 0; i < Math.min(storiesList.length, 20); i++) {
      var bar = document.createElement('div');
      bar.className = 'stories-progress-bar';
      bar.style.cssText = 'height:100%;background:rgba(255,255,255,0.15);border-radius:2px;flex:1';
      if (i < storiesIndex) bar.style.background = '#8b5cf6';
      else if (i === storiesIndex) { bar.id = 'storiesCurrentBar'; bar.style.background = 'rgba(255,255,255,0.15)'; bar.style.position = 'relative'; bar.innerHTML = '<div class="stories-progress-bar" style="position:absolute;top:0;left:0;height:100%;background:#8b5cf6;width:0%"></div>'; }
      progress.appendChild(bar);
    }
    // Media
    var mediaEl = document.getElementById('storiesMedia');
    mediaEl.innerHTML = '';
    var youtubeEmbed = getYoutubeEmbed(post.imageUrl);
    var isVideo = isVideoUrl(post.imageUrl);
    if (youtubeEmbed) {
      mediaEl.innerHTML = '<iframe src="' + youtubeEmbed + '" frameborder="0" allowfullscreen style="width:100%;height:100%"></iframe>';
    } else if (isVideo) {
      var vid = document.createElement('video');
      vid.src = post.imageUrl; vid.controls = false; vid.playsInline = true;
      vid.autoplay = true; vid.muted = false; vid.loop = false;
      vid.style.cssText = 'width:100%;height:100%;object-fit:contain';
      vid.onended = function() { nextStory(); };
      mediaEl.appendChild(vid);
    } else if (post.imageUrl) {
      var img = document.createElement('img');
      img.src = post.imageUrl; img.alt = '';
      img.style.cssText = 'width:100%;height:100%;object-fit:contain';
      mediaEl.appendChild(img);
      // Auto advance
      if (storiesTimer) clearTimeout(storiesTimer);
      storiesTimer = setTimeout(function() { nextStory(); }, 4000);
    }
  }

  function nextStory() {
    if (storiesTimer) clearTimeout(storiesTimer);
    storiesIndex++;
    showStory();
  }

  function prevStory() {
    if (storiesTimer) clearTimeout(storiesTimer);
    storiesIndex--;
    showStory();
  }

  function closeStoriesViewer() {
    if (storiesTimer) clearTimeout(storiesTimer);
    document.getElementById('storiesViewer').style.display = 'none';
    document.body.style.overflow = '';
    storiesList = [];
  }

  // Story click handler (click story ring → open viewer with that user's posts)
  document.getElementById('grammStories').addEventListener('click', function(e) {
    var storyEl = e.target.closest('.gramm-story');
    if (!storyEl) return;
    var name = storyEl.getAttribute('data-author');
    if (!name) return;
    var userPosts = grammPosts.filter(function(p) { return p.author === name; });
    if (userPosts.length > 0) openStoriesViewer(userPosts, 0);
  });

  // ===== Explore & Search =====
  function renderExplore() {
    var grid = document.getElementById('grammExploreGrid');
    if (!grid) return;
    grid.innerHTML = '';
    var shuffled = grammPosts.slice().sort(function() { return 0.5 - Math.random(); }).slice(0, 30);
    if (shuffled.length === 0) {
      grid.innerHTML = '<div class="gramm-empty"><i class="fas fa-compass"></i>Пока нет публикаций</div>';
      return;
    }
    shuffled.forEach(function(p) {
      if (!p.imageUrl || isVideoUrl(p.imageUrl) || getYoutubeEmbed(p.imageUrl)) return;
      var el = document.createElement('div');
      el.className = 'gramm-photo-grid-item';
      el.innerHTML = '<img src="' + p.imageUrl + '" alt="">';
      el.onclick = function() { openPostModal(p._id, p, currentUserId); };
      grid.appendChild(el);
    });
  }

  function setupSearch() {
    var input = document.getElementById('grammSearchInput');
    if (!input) return;
    var grid = document.getElementById('grammExploreGrid');
    input.oninput = function() {
      var q = this.value.trim().toLowerCase();
      if (!q) { renderExplore(); return; }
      // Search users by name
      var results = [];
      var seen = {};
      grammPosts.forEach(function(p) {
        var name = (p.author || '').toLowerCase();
        if (name.indexOf(q) !== -1 && !seen[name]) {
          seen[name] = true;
          results.push({ authorId: p.authorId, author: p.author });
        }
      });
      grid.innerHTML = '';
      if (results.length === 0) {
        grid.innerHTML = '<div class="gramm-empty" style="padding:30px 0;font-size:13px">Пользователи не найдены</div>';
        return;
      }
      var list = document.createElement('div');
      list.className = 'gramm-search-results';
      results.forEach(function(u) {
        var displayName = getDisplayName(u.authorId, u.author) || u.author;
        var avatarHtml = getAvatarHtml(u.authorId, u.author, 40);
        var div = document.createElement('div');
        div.className = 'gramm-search-user';
        div.innerHTML = '<div class="gramm-search-user-avatar">' + avatarHtml + '</div><div class="gramm-search-user-name">' + escapeHtml(displayName) + '<small> @' + escapeHtml(u.author) + '</small></div>';
        if (u.authorId && u.authorId !== currentUserId) {
          var fBtn = document.createElement('button');
          fBtn.className = 'gramm-follow-btn' + (grammFollowing[u.authorId] ? ' following' : '');
          fBtn.textContent = grammFollowing[u.authorId] ? 'Подписки' : 'Подписаться';
          fBtn.onclick = function(e) { e.stopPropagation(); toggleFollow(u.authorId, u.author, fBtn); };
          div.appendChild(fBtn);
        }
        div.onclick = function() { renderGrammUserProfile(u.authorId, u.author); };
        list.appendChild(div);
      });
      grid.appendChild(list);
    };
  }

  // ===== Tab switching for explore/notifs =====
  function showGrammExplore() {
    document.getElementById('grammFeedView').style.display = 'none';
    document.getElementById('grammExploreView').style.display = 'block';
    document.getElementById('grammNotifsView').style.display = 'none';
    document.getElementById('grammUserView').style.display = 'none';
    document.getElementById('grammProfileView').style.display = 'none';
    document.getElementById('grammCreateView').style.display = 'none';
    document.getElementById('grammReelsView').style.display = 'none';
    document.getElementById('grammSettingsView').style.display = 'none';
    renderExplore();
  }

  function showGrammNotifs() {
    document.getElementById('grammFeedView').style.display = 'none';
    document.getElementById('grammExploreView').style.display = 'none';
    document.getElementById('grammNotifsView').style.display = 'block';
    document.getElementById('grammUserView').style.display = 'none';
    document.getElementById('grammProfileView').style.display = 'none';
    document.getElementById('grammCreateView').style.display = 'none';
    document.getElementById('grammReelsView').style.display = 'none';
    document.getElementById('grammSettingsView').style.display = 'none';
    loadNotifs();
  }

  // Override showGrammFeed to hide explore/notifs
  var origShowFeed = showGrammFeed;
  showGrammFeed = function() {
    origShowFeed();
    document.getElementById('grammExploreView').style.display = 'none';
    document.getElementById('grammNotifsView').style.display = 'none';
    document.getElementById('grammCreateView').style.display = 'none';
    document.getElementById('grammReelsView').style.display = 'none';
    document.getElementById('grammSettingsView').style.display = 'none';
  };

  // Bottom navigation tab switching
  function switchGrammTab(tab) {
    document.querySelectorAll('.gramm-nav-btn').forEach(function(x) { x.classList.remove('active'); });
    var navBtn = document.querySelector('.gramm-nav-btn[data-tab="' + tab + '"]');
    if (navBtn) navBtn.classList.add('active');
    document.querySelectorAll('.gramm-view').forEach(function(v) { v.style.display = 'none'; });
    if (tab === 'feed') {
      document.getElementById('grammFeedView').style.display = 'block';
      showGrammFeed();
    } else if (tab === 'explore') {
      document.getElementById('grammExploreView').style.display = 'block';
      showGrammExplore();
    } else if (tab === 'reels') {
      document.getElementById('grammReelsView').style.display = 'block';
      openGrammReels();
    } else if (tab === 'notifs') {
      document.getElementById('grammNotifsView').style.display = 'block';
      showGrammNotifs();
    } else if (tab === 'profile') {
      document.getElementById('grammProfileView').style.display = 'block';
      renderGrammProfile();
    } else if (tab === 'settings') {
      document.getElementById('grammSettingsView').style.display = 'block';
    }
  }

  document.querySelectorAll('.gramm-nav-btn[data-tab]').forEach(function(btn) {
    btn.onclick = function() {
      switchGrammTab(this.getAttribute('data-tab'));
    };
  });

  // Create button opens create view or composer
  document.getElementById('grammNavCreate').onclick = function() {
    document.querySelectorAll('.gramm-view').forEach(function(v) { v.style.display = 'none'; });
    document.getElementById('grammCreateView').style.display = 'block';
  };
  document.getElementById('grammCreateCancel').onclick = function() {
    switchGrammTab('feed');
  };
  document.getElementById('grammAttachBtn').onclick = function() {
    document.getElementById('grammFileInput').click();
  };

  // Wire feed header buttons
  document.getElementById('grammFeedNotifBtn').onclick = function() {
    switchGrammTab('notifs');
  };

  // ===== Reels =====
  var grammReelsPosts = [];
  var grammReelsIndex = 0;
  var grammReelsVideo = null;

  function openGrammReels() {
    grammReelsPosts = grammPosts.filter(function(p) {
      return p.imageUrl && (isVideoUrl(p.imageUrl) || (p.fileType === 'video'));
    });
    if (grammReelsPosts.length === 0) {
      document.getElementById('grammReelsEmpty').style.display = 'block';
      document.getElementById('grammReelsActions').style.display = 'none';
      document.getElementById('grammReelsInfo').style.display = 'none';
      return;
    }
    grammReelsIndex = 0;
    showGrammReel(0);
  }

  function showGrammReel(index) {
    var p = grammReelsPosts[index];
    if (!p) return;
    grammReelsIndex = index;
    var player = document.getElementById('grammReelsPlayer');
    document.getElementById('grammReelsEmpty').style.display = 'none';
    document.getElementById('grammReelsActions').style.display = 'flex';
    document.getElementById('grammReelsInfo').style.display = 'flex';

    // Clean old video
    var oldVid = player.querySelector('video');
    if (oldVid) { oldVid.pause(); oldVid.parentNode.removeChild(oldVid); }

    // Create video element
    var vid = document.createElement('video');
    vid.src = p.imageUrl;
    vid.loop = true;
    vid.playsInline = true;
    vid.muted = true;
    vid.style.width = '100%';
    vid.style.height = '100%';
    vid.style.objectFit = 'contain';
    player.insertBefore(vid, player.firstChild);
    vid.play().catch(function() {});
    grammReelsVideo = vid;

    // Update info
    document.getElementById('grammReelsAuthor').textContent = getDisplayName(p.authorId, p.author) || p.author;
    document.getElementById('grammReelsAuthor').onclick = function() {
      if (p.authorId) renderGrammUserProfile(p.authorId, p.author);
      else renderGrammUserProfile(null, p.author);
    };
    document.getElementById('grammReelsCaption').textContent = p.caption || '';

    // Update actions
    updateReelActions(index);
  }

  function updateReelActions(index) {
    var p = grammReelsPosts[index];
    if (!p) return;
    var liked = p.likedBy && currentUserId && p.likedBy.indexOf(currentUserId) !== -1;
    var saved = p.savedBy && currentUserId && p.savedBy.indexOf(currentUserId) !== -1;
    var likeBtn = document.getElementById('grammReelsLike');
    var saveBtn = document.getElementById('grammReelsSave');
    likeBtn.className = 'gramm-reels-action' + (liked ? ' liked' : '');
    likeBtn.querySelector('i').className = liked ? 'fas fa-heart' : 'far fa-heart';
    likeBtn.querySelector('span').textContent = p.likeCount || 0;
    saveBtn.className = 'gramm-reels-action' + (saved ? ' saved' : '');
    saveBtn.querySelector('i').className = saved ? 'fas fa-bookmark' : 'far fa-bookmark';
    document.getElementById('grammReelsCommentCount').textContent = p.commentCount || 0;
  }

  // Swipe navigation for reels
  var reelsTouchStartY = 0;
  document.getElementById('grammReelsPlayer').addEventListener('touchstart', function(e) {
    reelsTouchStartY = e.touches[0].clientY;
  });
  document.getElementById('grammReelsPlayer').addEventListener('touchend', function(e) {
    var dy = e.changedTouches[0].clientY - reelsTouchStartY;
    if (Math.abs(dy) > 50) {
      if (dy < 0 && grammReelsIndex < grammReelsPosts.length - 1) showGrammReel(grammReelsIndex + 1);
      else if (dy > 0 && grammReelsIndex > 0) showGrammReel(grammReelsIndex - 1);
    }
  });
  document.getElementById('grammReelsPlayer').addEventListener('wheel', function(e) {
    if (e.deltaY > 0 && grammReelsIndex < grammReelsPosts.length - 1) showGrammReel(grammReelsIndex + 1);
    else if (e.deltaY < 0 && grammReelsIndex > 0) showGrammReel(grammReelsIndex - 1);
  });
  document.addEventListener('keydown', function grammReelsKeys(e) {
    if (document.getElementById('grammReelsView').style.display !== 'block') return;
    if (e.key === 'ArrowDown') { e.preventDefault(); if (grammReelsIndex < grammReelsPosts.length - 1) showGrammReel(grammReelsIndex + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (grammReelsIndex > 0) showGrammReel(grammReelsIndex - 1); }
  });

  // Reels actions
  document.getElementById('grammReelsLike').onclick = function() {
    var p = grammReelsPosts[grammReelsIndex];
    if (!p || !currentUserId) return;
    handleGrammLike(p._id, p, document.getElementById('grammReelsLike'), document.querySelector('#grammReelsLike span'));
    updateReelActions(grammReelsIndex);
  };
  document.getElementById('grammReelsComment').onclick = function() {
    var p = grammReelsPosts[grammReelsIndex];
    if (!p) return;
    openTtsSheet(p._id, p);
  };
  document.getElementById('grammReelsShare').onclick = function() {
    var p = grammReelsPosts[grammReelsIndex];
    if (!p) return;
    if (navigator.share) {
      navigator.share({ url: p.imageUrl, text: p.caption || '' }).catch(function() {});
    } else {
      navigator.clipboard.writeText(p.imageUrl).then(function() { showToast('Ссылка скопирована', 'success'); }).catch(function() {});
    }
  };
  document.getElementById('grammReelsSave').onclick = function() {
    var p = grammReelsPosts[grammReelsIndex];
    if (!p || !currentUserId) return;
    handleGrammSave(p._id, p, document.getElementById('grammReelsSave'));
    updateReelActions(grammReelsIndex);
  };

  // ===== Saved tab on profile =====
  function loadSavedPosts(grid) {
    if (!currentUserId) { grid.innerHTML = '<div class="gramm-empty"><i class="far fa-bookmark"></i>Войдите, чтобы увидеть сохранённое</div>'; return; }
    grid.innerHTML = '<div style="text-align:center;padding:40px 0;color:rgba(255,255,255,0.08)"><i class="fas fa-spinner fa-spin" style="font-size:28px;display:block;margin-bottom:10px"></i></div>';
    // Load all posts and filter client-side (avoids Firestore composite index requirement)
    db.collection('gramm_posts').orderBy('createdAt', 'desc').get().then(function(snap) {
      grid.innerHTML = '';
      var count = 0;
      snap.forEach(function(doc) {
        var p = doc.data();
        p._id = doc.id;
        if (p.savedBy && p.savedBy.indexOf(currentUserId) !== -1) {
          count++;
          if (p.imageUrl && !isVideoUrl(p.imageUrl) && !getYoutubeEmbed(p.imageUrl)) {
            var el = document.createElement('div');
            el.className = 'gramm-photo-grid-item';
            el.innerHTML = '<img src="' + p.imageUrl + '" alt="">';
            el.onclick = function() { openPostModal(p._id, p, currentUserId); };
            grid.appendChild(el);
          } else {
            appendPost(p, grid);
          }
        }
      });
      if (count === 0) {
        grid.innerHTML = '<div class="gramm-empty"><i class="far fa-bookmark"></i>Нет сохранённых публикаций</div>';
      }
    }).catch(function() {
      grid.innerHTML = '<div class="gramm-empty">Ошибка загрузки</div>';
    });
  }

  // ===== Who Liked Modal =====
  function showWhoLiked(postId, postData) {
    var existing = document.querySelector('.gramm-likers-modal');
    if (existing) existing.parentNode.removeChild(existing);

    var modal = document.createElement('div');
    modal.className = 'gramm-likers-modal';
    modal.onclick = function(e) { if (e.target === modal) modal.parentNode.removeChild(modal); };

    var sheet = document.createElement('div');
    sheet.className = 'gramm-likers-sheet';

    var header = document.createElement('div');
    header.className = 'gramm-likers-header';
    header.innerHTML = 'Оценили <button class="gramm-likers-close">&times;</button>';
    header.querySelector('.gramm-likers-close').onclick = function() { modal.parentNode.removeChild(modal); };

    var list = document.createElement('div');
    list.className = 'gramm-likers-list';
    list.innerHTML = '<div style="text-align:center;padding:20px;color:rgba(255,255,255,0.15)"><i class="fas fa-spinner fa-spin"></i></div>';

    sheet.appendChild(header);
    sheet.appendChild(list);
    modal.appendChild(sheet);
    document.body.appendChild(modal);

    // Load likers
    if (postData.likedBy && postData.likedBy.length > 0) {
      list.innerHTML = '';
      postData.likedBy.forEach(function(uid) {
        var item = document.createElement('div');
        item.className = 'gramm-likers-item';
        var avatarHtml = getAvatarHtml(uid, null, 36);
        var name = getDisplayName(uid, null) || uid;
        item.innerHTML = '<div class="gramm-ig-avatar" style="width:36px;height:36px;font-size:14px">' + avatarHtml + '</div><span class="gramm-likers-name">' + name + '</span>';
        item.querySelector('.gramm-likers-name').onclick = function() {
          modal.parentNode.removeChild(modal);
          renderGrammUserProfile(uid, name);
        };
        list.appendChild(item);
      });
    } else {
      list.innerHTML = '<div style="text-align:center;padding:20px;color:rgba(255,255,255,0.15)">Пока никого</div>';
    }
  }

  // ===== Settings =====
  document.getElementById('grammSettingsBack').onclick = function() { switchGrammTab('profile'); };
  document.getElementById('grammSettingsEditProfile').onclick = function() {
    var currentBio = document.getElementById('grammMyBio').textContent || '';
    var newBio = prompt('Изменить информацию о себе:', currentBio);
    if (newBio === null) return;
    if (currentUserId) {
      db.collection('gramm_profiles').doc(currentUserId).set({ bio: newBio }, { merge: true }).then(function() {
        document.getElementById('grammMyBio').textContent = newBio;
        document.getElementById('grammMyBio').style.display = newBio ? 'block' : 'none';
        showToast('Сохранено', 'success');
      }).catch(function(err) { showToast('Ошибка: ' + err.message, 'error'); });
    }
  };
  document.getElementById('grammSettingsAvatar').onclick = function() { showAvatarPicker(); };
  document.getElementById('grammSettingsSaved').onclick = function() { switchGrammTab('profile'); renderGrammProfile(); setTimeout(function() { document.querySelector('#grammProfileView .gramm-ig-tab[data-mptab="saved"]').click(); }, 100); };
  document.getElementById('grammSettingsAbout').onclick = function() { showToast('Cellestegramm v2.0 — Instagram для семьи', 'success'); };
  document.getElementById('grammProfileSettingsBtn').onclick = function() { switchGrammTab('settings'); };

  // ===== Click on likes count to show who liked =====
  document.getElementById('grammBody').addEventListener('click', function(e) {
    var likesEl = e.target.closest('.gramm-post-likes');
    if (likesEl) {
      var postEl = likesEl.closest('.gramm-post');
      if (postEl && postEl._postData) {
        showWhoLiked(postEl._postData._id, postEl._postData);
      }
    }
  });

  // Stories viewer nav
  document.getElementById('storiesPrev').onclick = prevStory;
  document.getElementById('storiesNext').onclick = nextStory;
  document.getElementById('storiesClose').onclick = closeStoriesViewer;
  document.getElementById('storiesBg').onclick = closeStoriesViewer;
  document.getElementById('storiesReplySend').onclick = function() {
    var input = document.getElementById('storiesReplyInput');
    var text = input.value.trim();
    if (!text || !storiesList[storiesIndex]) return;
    var post = storiesList[storiesIndex];
    var author = document.getElementById('userName').textContent || 'Аноним';
    db.collection('gramm_posts').doc(post._id).collection('comments').add({
      text: text, author: author, createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      authorId: currentUserId || null
    }).then(function() {
      input.value = '';
      showToast('Отправлено', 'success');
    }).catch(function(err) { showToast('Ошибка: ' + err.message, 'error'); });
  };
  document.getElementById('storiesReplyInput').onkeydown = function(e) {
    if (e.key === 'Enter') { e.preventDefault(); document.getElementById('storiesReplySend').click(); }
  };

  // Add follow counts to profile renders
  var origRenderProfile2 = renderGrammProfile;
  renderGrammProfile = function() {
    origRenderProfile2();
    if (currentUserId) {
      getFollowCount(currentUserId, 'followers', function(count) {
        var el = document.querySelector('#grammProfileView .gramm-stat-followers-val');
        if (el) el.textContent = count;
      });
      getFollowCount(currentUserId, 'following', function(count) {
        var el = document.querySelector('#grammProfileView .gramm-stat-following-val');
        if (el) el.textContent = count;
      });
    }
  };
  var origRenderUser2 = renderGrammUserProfile;
  renderGrammUserProfile = function(authorId, authorName) {
    origRenderUser2(authorId, authorName);
    if (!authorId) return;
    // Follow/unfollow button
    var actions = document.querySelector('#grammUserView .gramm-ig-actions');
    if (actions) {
      actions.innerHTML = '';
      if (authorId !== currentUserId && currentUserId) {
        var fBtn = document.createElement('button');
        fBtn.className = 'gramm-ig-follow-btn' + (grammFollowing[authorId] ? ' following' : '');
        fBtn.textContent = grammFollowing[authorId] ? 'Подписки' : 'Подписаться';
        fBtn.onclick = function() { toggleFollow(authorId, authorName, fBtn); };
        actions.appendChild(fBtn);
      }
    }
    getFollowCount(authorId, 'followers', function(count) {
      var el = document.querySelector('#grammUserView .gramm-stat-followers-val');
      if (el) el.textContent = count;
    });
    getFollowCount(authorId, 'following', function(count) {
      var el = document.querySelector('#grammUserView .gramm-stat-following-val');
      if (el) el.textContent = count;
    });
  };

  // Notify on like (patch handleGrammLike)
  var origHandleLike = handleGrammLike;
  handleGrammLike = function(postId, postData, btn, countEl) {
    if (!currentUserId) { showToast('Войдите, чтобы ставить лайки', 'error'); return; }
    var liked = postData.likedBy && postData.likedBy.indexOf(currentUserId) !== -1;
    if (!liked && postData.authorId && postData.authorId !== currentUserId) {
      addNotif(postData.authorId, 'like', currentUserId, document.getElementById('userName').textContent || 'Аноним', postId);
    }
    origHandleLike(postId, postData, btn, countEl);
  };

  // Notify on comment (patch comment send)
  // We hook into the TikTok send
  var ttsOrigSend = null;

  // ===== Update profiles with follow counts on load =====
  // Also need to add notif on comment
  // Hook into TikTok comment sheet send
  var origTtsSendSetup = setupTtsInput;
  setupTtsInput = function() {
    origTtsSendSetup();
    // additional hook not needed since ttsInput wraps it
  };

  // ===== Init =====
  setupBannerUpload();
  setupTtsInput();
  setupBioEdit();
  setupSearch();
  loadFollows();
  checkNotifBadge();

  // Keyboard shortcuts for stories viewer
  document.addEventListener('keydown', function(e) {
    if (document.getElementById('storiesViewer').style.display !== 'flex') return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); prevStory(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); nextStory(); }
    else if (e.key === 'Escape') { e.preventDefault(); closeStoriesViewer(); }
  });

})();