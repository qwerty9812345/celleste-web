(function () {
  var currentStep = 1;
  var totalSteps = 4;
  var isSubmitting = false;

  window.nafGoTo = function (n) {
    if (n < 1 || n > totalSteps || isSubmitting) return;
    document.querySelectorAll('.naf-step-content').forEach(function (el) {
      el.classList.remove('visible');
    });
    document.getElementById('nafStep' + n).classList.add('visible');
    currentStep = n;
    nafUpdateSteps();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  function nafUpdateSteps() {
    for (var i = 1; i <= totalSteps; i++) {
      var circle = document.getElementById('nsc' + i);
      var label = document.getElementById('nsl' + i);
      var line = document.getElementById('nsl' + i + 'l');
      var cls = ['pending', 'active', 'done'];
      var idx = i < currentStep ? 2 : i === currentStep ? 1 : 0;
      circle.className = 'naf-step-circle ' + cls[idx];
      if (label) label.className = 'naf-step-label ' + cls[idx];
      if (line) line.className = 'naf-step-line ' + (i < currentStep ? 'done' : i === currentStep ? 'active' : 'pending');
    }
  }

  window.nafHideAlert = function () {
    document.getElementById('nafAlert').classList.remove('show');
  };

  function nafShowAlert(msg) {
    document.getElementById('nafAlertText').textContent = msg;
    var el = document.getElementById('nafAlert');
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.classList.remove('show'); }, 3500);
  }

  function nafUpdateReview() {
    var fields = [
      { l: 'Имя Фамилия (IC)', v: document.getElementById('nafIcName').value.trim() || '\u2014' },
      { l: 'Паспорт (IC)', v: document.getElementById('nafPassport').value.trim() || '\u2014' },
      { l: 'Лет в штате / Lvl', v: document.getElementById('nafStatsLvl').value.trim() || '\u2014' },
      { l: 'Смена фамилии', v: (document.querySelector('input[name="nafSurname"]:checked') || { value: '\u2014' }).value },
      { l: 'Контент / Фракции', v: document.getElementById('nafContentFactions').value.trim() || '\u2014' },
      { l: 'Имя (OOC)', v: document.getElementById('nafOocName').value.trim() || '\u2014' },
      { l: 'Возраст (OOC)', v: document.getElementById('nafOocAge').value.trim() || '\u2014' },
      { l: 'Почему к нам', v: document.getElementById('nafWhyJoin').value.trim() || '\u2014' },
      { l: 'Discord', v: document.getElementById('nafDiscordUser').value.trim() || '\u2014' }
    ];
    var html = '';
    for (var i = 0; i < fields.length; i++) {
      html += '<div class="naf-review-row"><span>' + fields[i].l + '</span><span class="rv">' + fields[i].v + '</span></div>';
    }
    document.getElementById('nafReviewContent').innerHTML = html;
  }

  // Auto-update review when step 4 becomes visible
  var nafObserver = new MutationObserver(function () {
    if (document.getElementById('nafStep4').classList.contains('visible')) {
      nafUpdateReview();
    }
  });
  setTimeout(function () {
    var step4 = document.getElementById('nafStep4');
    if (step4) {
      nafObserver.observe(step4, { attributes: true, attributeFilter: ['class'] });
    }
  }, 100);

  window.nafSubmit = function () {
    if (isSubmitting) return;

    var icName = document.getElementById('nafIcName').value.trim();
    var passport = document.getElementById('nafPassport').value.trim();
    var statsLvl = document.getElementById('nafStatsLvl').value.trim();
    var changeSurname = document.querySelector('input[name="nafSurname"]:checked');
    var contentFactions = document.getElementById('nafContentFactions').value.trim();
    var oocName = document.getElementById('nafOocName').value.trim();
    var oocAge = document.getElementById('nafOocAge').value.trim();
    var whyJoin = document.getElementById('nafWhyJoin').value.trim();
    var discordUser = document.getElementById('nafDiscordUser').value.trim();

    if (!icName) { nafShowAlert('Введите Имя Фамилия (IC)'); nafGoTo(1); document.getElementById('nafIcName').focus(); return; }
    if (!passport) { nafShowAlert('Введите паспорт (IC)'); nafGoTo(1); document.getElementById('nafPassport').focus(); return; }
    if (!statsLvl) { nafShowAlert('Введите сколько лет в штате'); nafGoTo(1); document.getElementById('nafStatsLvl').focus(); return; }
    if (!changeSurname) { nafShowAlert('Выберите готовность сменить фамилию'); nafGoTo(2); return; }
    if (!contentFactions) { nafShowAlert('Опишите контент и фракции'); nafGoTo(2); document.getElementById('nafContentFactions').focus(); return; }
    if (!whyJoin) { nafShowAlert('Напишите почему хотите к нам'); nafGoTo(3); document.getElementById('nafWhyJoin').focus(); return; }
    if (!discordUser) { nafShowAlert('Введите юзер дискорда'); nafGoTo(3); document.getElementById('nafDiscordUser').focus(); return; }

    isSubmitting = true;
    var btn = document.getElementById('nafSubmitBtn');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
    btn.disabled = true;

    var data = {
      icName: icName,
      passport: passport,
      statsLvl: statsLvl,
      changeSurname: changeSurname.value,
      contentFactions: contentFactions,
      oocName: oocName,
      oocAge: oocAge,
      whyJoin: whyJoin,
      discordUser: discordUser
    };

    var discordWebhook = 'https://discord.com/api/webhooks/1519324083207016578/hmiVHQN5UVPTfm8yGQS4pnlleUEqHdfdpvFOq42GcssUWN7_1qKJfJgaJglxnhbqFw2R';
    var googleScriptUrl = 'https://script.google.com/macros/s/AKfycbyr1qt8gxJN4LIDvqkYSE3q-Cjp8KBPBsZCnkNgvKma3ZZQVahoza7rmnsWfvuQUxq1iQ/exec';

    var embed = {
      content: '<a:spacetravelleraesthetic:1390069706022719611> <@&1400251637838385264><@&1400251866369233017> Тук Тук, Новая заявка в семью <a:spacetravelleraesthetic:1390069706022719611>',
      embeds: [{
        title: 'Новая заявка в Celleste',
        color: 666666,
        fields: [
          { name: 'Имя Фамилия (IC)', value: data.icName, inline: true },
          { name: 'Паспорт (IC)', value: data.passport, inline: true },
          { name: 'Лет в штате / Lvl', value: data.statsLvl, inline: true },
          { name: 'Смена фамилии', value: data.changeSurname, inline: true },
          { name: 'Контент / Фракции', value: data.contentFactions || 'Не указано', inline: false },
          { name: 'Имя (OOC)', value: data.oocName || 'Не указано', inline: true },
          { name: 'Возраст (OOC)', value: data.oocAge || 'Не указан', inline: true },
          { name: 'Почему к нам', value: data.whyJoin, inline: false },
          { name: 'Discord', value: data.discordUser, inline: false }
        ],
        footer: { text: 'Не забывайте созвониться с человеком. Тех.поддержка: sokrat_ik.' },
        timestamp: new Date().toISOString()
      }]
    };

    var sentToDiscord = false;
    var sentToGoogle = false;

    function checkDone() {
      if (sentToDiscord || sentToGoogle) {
        document.getElementById('nafFormState').style.display = 'none';
        document.getElementById('nafSuccessState').style.display = 'block';
        isSubmitting = false;
      }
    }

    // Send to Discord
    fetch(discordWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(embed)
    }).then(function (r) {
      sentToDiscord = true;
      checkDone();
    }).catch(function () {
      sentToDiscord = true;
      checkDone();
    });

    // Send to Google Script
    var params = new URLSearchParams();
    params.set('action', 'submitApplication');
    params.set('data', JSON.stringify(data));
    fetch(googleScriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      body: params
    }).then(function () {
      sentToGoogle = true;
      checkDone();
    }).catch(function () {
      sentToGoogle = true;
      checkDone();
    });

    // Fallback if both fail after 5s
    setTimeout(function () {
      if (!sentToDiscord && !sentToGoogle) {
        document.getElementById('nafFormState').style.display = 'none';
        document.getElementById('nafSuccessState').style.display = 'block';
        isSubmitting = false;
      }
    }, 5000);
  };

  window.nafReset = function () {
    document.getElementById('nafFormState').style.display = 'block';
    document.getElementById('nafSuccessState').style.display = 'none';
    document.querySelectorAll('.naf-input-wrap input, .naf-input-wrap textarea').forEach(function (el) { el.value = ''; });
    document.querySelectorAll('input[name="nafSurname"]').forEach(function (el) { el.checked = false; });
    var btn = document.getElementById('nafSubmitBtn');
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Отправить заявку';
    btn.disabled = false;
    isSubmitting = false;
    nafGoTo(1);
  };

})();
