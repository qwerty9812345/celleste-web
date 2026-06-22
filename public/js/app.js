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
    var familyLink = document.querySelector('.nav-link[href="#family"]');

    if (authData.authenticated) {
      loginBtn.style.display = 'none';
      userInfo.style.display = 'flex';
      userName.textContent = authData.user.username;

      if (authData.verified) {
        verifiedElements.forEach(function (el) { el.style.display = 'block'; });
        if (familyLink) familyLink.style.display = 'block';

        fetch('/api/save-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }).catch(function () {});
      } else {
        if (authData.user && authData.user.id) {
          checkFamilyMember(authData.user.id).then(function (found) {
            if (found) {
              verifiedElements.forEach(function (el) { el.style.display = 'block'; });
              if (familyLink) familyLink.style.display = 'block';
            } else {
              verifiedElements.forEach(function (el) { el.style.display = 'none'; });
              if (familyLink) familyLink.style.display = 'none';
              showToast('У вас нет роли Celleste. Обратитесь к руководству семьи.', 'error');
            }
          });
        } else {
          verifiedElements.forEach(function (el) { el.style.display = 'none'; });
          if (familyLink) familyLink.style.display = 'none';
        }
      }
    } else {
      loginBtn.style.display = 'inline-flex';
      userInfo.style.display = 'none';
      verifiedElements.forEach(function (el) { el.style.display = 'none'; });
      if (familyLink) familyLink.style.display = 'none';
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
      var rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
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
        ctx.fillStyle = 'rgba(212, 168, 83, ' + Math.max(0, pulseAlpha) + ')';
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
            ctx.strokeStyle = 'rgba(212, 168, 83, ' + alpha + ')';
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
          ctx.strokeStyle = 'rgba(212, 168, 83, ' + mAlpha + ')';
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

})();