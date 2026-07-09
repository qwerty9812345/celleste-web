(function () {
  var isAdmin = false;

  fetch('/api/me').then(function (r) { return r.json(); }).then(function (data) {
    if (data.authenticated && data.isAdmin) {
      isAdmin = true;
      initEditButtons();
    }
  }).catch(function () {});

  function initEditButtons() {
    var btnP = document.getElementById('adminEditBtnP');
    if (btnP) {
      btnP.style.display = 'inline-flex';
      btnP.onclick = togglePostulateEdit;
      var saveP = document.getElementById('adminSaveBtnP');
      if (saveP) saveP.onclick = savePostulateEdit;
    }

    var btnL = document.getElementById('adminEditBtnL');
    if (btnL) {
      btnL.style.display = 'inline-flex';
      btnL.onclick = toggleLocationEdit;
      var saveL = document.getElementById('adminSaveBtnL');
      if (saveL) saveL.onclick = saveLocationEdit;
    }

    loadPostulateData();
    loadLocationData();
  }

  function togglePostulateEdit() {
    var cards = document.querySelectorAll('#page-postulates .postulate-card');
    var isEditing = document.getElementById('adminEditBtnP').textContent.includes('Редактировать');
    cards.forEach(function (card) {
      card.contentEditable = isEditing;
      if (isEditing) {
        card.style.outline = '2px dashed rgba(139,92,246,0.4)';
        card.style.borderRadius = '12px';
        card.style.padding = '12px';
      } else {
        card.style.outline = 'none';
      }
    });
    document.getElementById('adminEditBtnP').style.display = 'none';
    document.getElementById('adminSaveBtnP').style.display = 'inline-flex';
  }

  function savePostulateEdit() {
    var cards = document.querySelectorAll('#page-postulates .postulate-card');
    cards.forEach(function (card) {
      card.contentEditable = false;
      card.style.outline = 'none';
    });
    document.getElementById('adminEditBtnP').style.display = 'inline-flex';
    document.getElementById('adminSaveBtnP').style.display = 'none';

    if (typeof db !== 'undefined') {
      var cardsData = [];
      document.querySelectorAll('#page-postulates .postulate-card').forEach(function (card) {
        cardsData.push(card.outerHTML);
      });
      db.collection('project_data').doc('postulates').set({
        cards: cardsData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(function () {
        showToast('Изменения сохранены', 'success');
      }).catch(function (err) {
        showToast('Ошибка сохранения: ' + err.message, 'error');
      });
    }
  }

  function loadPostulateData() {
    if (typeof db === 'undefined') return;
    db.collection('project_data').doc('postulates').get().then(function (doc) {
      if (doc.exists) {
        var data = doc.data();
        if (data.cards && data.cards.length > 0) {
          var container = document.querySelector('#postulateCards');
          if (container) container.innerHTML = data.cards.join('\n');
        }
      }
    }).catch(function () {});
  }

  function toggleLocationEdit() {
    var cards = document.querySelectorAll('#page-location .loc-card');
    var isEditing = document.getElementById('adminEditBtnL').textContent.includes('Редактировать');
    cards.forEach(function (card) {
      card.contentEditable = isEditing;
      if (isEditing) {
        card.style.outline = '2px dashed rgba(139,92,246,0.4)';
        card.style.borderRadius = '12px';
        card.style.padding = '12px';
      } else {
        card.style.outline = 'none';
      }
    });
    document.getElementById('adminEditBtnL').style.display = 'none';
    document.getElementById('adminSaveBtnL').style.display = 'inline-flex';
  }

  function saveLocationEdit() {
    var cards = document.querySelectorAll('#page-location .loc-card');
    cards.forEach(function (card) {
      card.contentEditable = false;
      card.style.outline = 'none';
    });
    document.getElementById('adminEditBtnL').style.display = 'inline-flex';
    document.getElementById('adminSaveBtnL').style.display = 'none';

    if (typeof db !== 'undefined') {
      var cardsData = [];
      document.querySelectorAll('#page-location .loc-card').forEach(function (card) {
        cardsData.push(card.outerHTML);
      });
      db.collection('project_data').doc('location').set({
        cards: cardsData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }).then(function () {
        showToast('Изменения сохранены', 'success');
      }).catch(function (err) {
        showToast('Ошибка сохранения: ' + err.message, 'error');
      });
    }
  }

  function loadLocationData() {
    if (typeof db === 'undefined') return;
    db.collection('project_data').doc('location').get().then(function (doc) {
      if (doc.exists) {
        var data = doc.data();
        if (data.cards && data.cards.length > 0) {
          var container = document.querySelector('#locationCards');
          if (container) container.innerHTML = data.cards.join('\n');
        }
      }
    }).catch(function () {});
  }

  function showToast(msg, type) {
    var existing = document.querySelector('.public-toast');
    if (existing) existing.remove();
    var t = document.createElement('div');
    t.className = 'public-toast';
    t.textContent = msg;
    t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);padding:12px 24px;border-radius:10px;font-size:14px;font-weight:600;z-index:9999;transition:all 0.3s;';
    if (type === 'success') {
      t.style.background = 'rgba(52,211,153,0.15)';
      t.style.border = '1px solid rgba(52,211,153,0.3)';
      t.style.color = '#6ee7b7';
    } else {
      t.style.background = 'rgba(248,113,113,0.15)';
      t.style.border = '1px solid rgba(248,113,113,0.3)';
      t.style.color = '#fca5a5';
    }
    document.body.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; setTimeout(function () { t.remove(); }, 300); }, 2500);
  }
})();
