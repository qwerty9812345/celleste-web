(function () {
  var STORAGE_KEY = 'celleste_members';
  var isAdmin = false;

  fetch('/api/me').then(function (r) { return r.json(); }).then(function (data) {
    if (data.authenticated && data.isAdmin) isAdmin = true;
    init();
  }).catch(function () { init(); });

  function init() {
    loadFromFirestore();
    render();
  }

  var DEFAULT_DATA = [
    {
      id: 'owner',
      title: 'Owner',
      icon: 'crown',
      roleLabel: 'Head of Family',
      members: [
        { name: 'Mike Celleste', photo: '' },
        { name: 'Sokrat Celleste', photo: '' },
        { name: 'Sergey Celleste', photo: '' },
        { name: 'Boris Celleste', photo: '' }
      ]
    },
    {
      id: 'dep-owner',
      title: 'Dep. Owner',
      icon: 'hand-holding-heart',
      roleLabel: 'Second-in-Command',
      members: [
        { name: 'Berry Celleste', photo: '' },
        { name: 'Artemy Shirlimirli', photo: '' },
        { name: 'Asya Celleste', photo: '' },
        { name: 'Betty Pain', photo: '' }
      ]
    },
    {
      id: 'underboss',
      title: 'Underboss',
      icon: 'dragon',
      roleLabel: 'Enforcer',
      members: [
        { name: 'Damian Karmona', photo: '' },
        { name: 'Dirby Celleste', photo: '' },
        { name: 'Valery Celleste', photo: '' }
      ]
    },
    {
      id: 'charon',
      title: 'Charon',
      icon: 'ship',
      roleLabel: 'Gatekeeper',
      members: [
        { name: 'Danya Bounty', photo: '' },
        { name: 'Vlad Celleste', photo: '' },
        { name: 'Artem Celleste', photo: '' }
      ]
    },
    {
      id: 'regular',
      title: 'Main Roster',
      icon: 'scroll',
      roleLabel: 'Member',
      members: []
    }
  ];

  var DATA_VERSION = 3;
  var data = [];
  var isEdit = false;

  function loadData() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        data = JSON.parse(saved);
        var ver = data._version || 1;
        if (ver < DATA_VERSION) {
          mergeDefaults();
        }
        return;
      }
    } catch (e) {}
    data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    data._version = DATA_VERSION;
    saveData();
  }

  function loadFromFirestore() {
    if (typeof db === 'undefined') { loadData(); return; }
    db.collection('project_data').doc('members').get().then(function (doc) {
      if (doc.exists && doc.data().json) {
        try {
          var parsed = JSON.parse(doc.data().json);
          if (parsed && parsed.length) {
            data = parsed;
            data._version = DATA_VERSION;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            render();
            return;
          }
        } catch (e) {}
      }
      loadData();
    }).catch(function () { loadData(); });
  }

  function mergeDefaults() {
    var merged = JSON.parse(JSON.stringify(DEFAULT_DATA));
    merged._version = DATA_VERSION;
    data.forEach(function (savedGroup) {
      var defaultGroup = merged.find(function (g) { return g.id === savedGroup.id; });
      if (defaultGroup && savedGroup.members) {
        defaultGroup.members = savedGroup.members;
      }
    });
    data = merged;
    saveData();
  }

  function saveData() {
    try {
      data._version = DATA_VERSION;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
    saveToFirestore();
  }

  function saveToFirestore() {
    if (typeof db === 'undefined') return;
    db.collection('project_data').doc('members').set({
      json: JSON.stringify(data),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(function () {});
  }

  function getInitials(name) {
    var parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  }

  function render() {
    var container = document.getElementById('membersRoster');
    if (!container) return;

    var html = '<div class="roster-tree">';

    data.forEach(function (group, gi) {
      if (gi > 0) {
        html += '<div class="roster-tree-connector"><div class="connector-dot"></div></div>';
      }

      html += '<div class="roster-group group-' + group.id + '">';
      html += '<div class="roster-group-header">';
      html += '<div class="roster-group-title"><span class="title-icon"><i class="fas fa-' + group.icon + '"></i></span>' + group.title + '</div>';
      html += '</div>';
      html += '<div class="roster-grid">';

      if (group.members.length === 0) {
        html += '<div class="roster-empty"><i class="fas fa-plus-circle"></i>Состав пока не заполнен</div>';
      } else {
        group.members.forEach(function (member, idx) {
          html += '<div class="roster-card' + (isEdit ? ' edit-mode' : '') + '" data-group="' + group.id + '" data-index="' + idx + '">';
          if (isEdit) {
            html += '<div class="roster-actions">';
            html += '<button class="roster-btn photo-btn" title="Изменить фото"><i class="fas fa-camera"></i></button>';
            html += '<button class="roster-btn delete-btn" title="Удалить"><i class="fas fa-times"></i></button>';
            html += '</div>';
          }
          if (member.photo) {
            html += '<div class="roster-photo"><img src="' + member.photo + '" alt="' + member.name + '"></div>';
          } else {
            html += '<div class="roster-photo">' + getInitials(member.name) + '</div>';
          }
          if (isEdit) {
            html += '<div class="roster-name" contenteditable="true">' + member.name + '</div>';
          } else {
            html += '<div class="roster-name">' + member.name + '</div>';
          }
          html += '<div class="roster-role-label">' + group.roleLabel + '</div>';
          html += '</div>';
        });
      }

      html += '</div>';

      if (isEdit) {
        html += '<div class="roster-group-actions">';
        html += '<button class="roster-add-btn" data-group="' + group.id + '"><i class="fas fa-plus"></i> Добавить участника</button>';
        html += '</div>';
      }

      html += '</div>';
    });

    html += '</div>';

    html += '<div class="admin-bar"' + (isEdit || isAdmin ? '' : ' style="display:none"') + '>';
    html += '<button class="admin-toggle' + (isEdit ? ' active' : '') + '" id="adminToggle"><i class="fas fa-pen"></i> ' + (isEdit ? 'Режим редактирования' : 'Редактировать состав') + '</button>';
    html += '<span class="admin-hint">Изменения сохраняются автоматически</span>';
    html += '</div>';

    container.innerHTML = html;
    bindEvents();
  }

  function bindEvents() {
    if (isEdit) {
      document.querySelectorAll('.roster-name[contenteditable]').forEach(function (el) {
        el.addEventListener('blur', onNameEdit);
        el.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') { e.preventDefault(); el.blur(); }
          if (e.key === 'Escape') { el.textContent = el.dataset.origName || el.textContent; el.blur(); }
        });
        el.addEventListener('focus', function () {
          el.dataset.origName = el.textContent;
        });
      });

      document.querySelectorAll('.delete-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var card = btn.closest('.roster-card');
          var groupId = card.dataset.group;
          var idx = parseInt(card.dataset.index);
          var group = data.find(function (g) { return g.id === groupId; });
          if (group && confirm('Удалить "' + group.members[idx].name + '"?')) {
            group.members.splice(idx, 1);
            saveData();
            render();
          }
        });
      });

      document.querySelectorAll('.photo-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var card = btn.closest('.roster-card');
          var groupId = card.dataset.group;
          var idx = parseInt(card.dataset.index);
          var group = data.find(function (g) { return g.id === groupId; });
          if (group) {
            var url = prompt('URL фото для ' + group.members[idx].name + ':', group.members[idx].photo || '');
            if (url !== null) {
              group.members[idx].photo = url;
              saveData();
              render();
            }
          }
        });
      });

      document.querySelectorAll('.roster-add-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var groupId = btn.dataset.group;
          var group = data.find(function (g) { return g.id === groupId; });
          if (group) {
            var name = prompt('Имя нового участника:');
            if (name && name.trim()) {
              group.members.push({ name: name.trim(), photo: '' });
              saveData();
              render();
            }
          }
        });
      });
    }

    var adminToggle = document.getElementById('adminToggle');
    if (adminToggle) {
      adminToggle.addEventListener('click', function () {
        isEdit = !isEdit;
        render();
      });
    }
  }

  function onNameEdit(e) {
    var el = e.target;
    var card = el.closest('.roster-card');
    var groupId = card.dataset.group;
    var idx = parseInt(card.dataset.index);
    var group = data.find(function (g) { return g.id === groupId; });
    if (group) {
      group.members[idx].name = el.textContent.trim();
      saveData();
    }
  }

  function init() {
    loadData();
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
