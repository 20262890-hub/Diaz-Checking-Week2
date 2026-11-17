(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const DAY = 864e5, HOUR = 36e5, KEY = 'waterwise-v1', IMG = 'assets/images/';
  const seed = () => { const n = Date.now(); return { sync: n, demoFail: true,
    set: { eco: false, voice: false, haptic: true, speak: false, size: 100 },
    plants: [
      { id: 'fern', name: 'Fern', room: 'Kitchen', img: 'fern.png', every: 3, last: n - 3 * DAY, due: null, snooze: 0, sensor: 'failed' },
      { id: 'monstera', name: 'Monstera', room: 'Living room', img: 'monstera.png', every: 7, last: n - 4 * DAY, due: null, snooze: 0, sensor: 'ok' },
      { id: 'cactus', name: 'Cactus', room: 'Window sill', img: 'cactus.png', every: 14, last: n - 7 * DAY, due: null, snooze: 0, sensor: 'ok' }] }; };
  let st; try { st = JSON.parse(localStorage.getItem(KEY)); } catch {}
  st = st || seed();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch {} };

  const dueAt = p => p.due ?? p.last + p.every * DAY;
  const isOver = p => Date.now() >= dueAt(p) && Date.now() >= p.snooze;
  const isSnoozed = p => Date.now() < p.snooze;
  const day = t => new Date(t).toLocaleDateString(undefined, { weekday: 'short' });
  const hm = t => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const status = p => isOver(p) ? '<span class="status"><span aria-hidden="true">&#9888;&#65038;</span> Overdue</span>'
    : isSnoozed(p) ? `<span class="status"><span aria-hidden="true">&#9201;&#65038;</span> Snoozed until ${hm(p.snooze)}</span>`
    : `<span class="status"><span aria-hidden="true">&#10003;</span> OK, next watering ${day(dueAt(p))}</span>`;
  const pic = (p, cls) => `<img class="pic ${cls}" src="${IMG + p.img}" alt="${p.name} in a pot" width="640" height="480" loading="lazy">`;
  const btns = p => `<div class="actions"><button type="button" class="btn btn--primary" data-act="water" data-id="${p.id}">Mark as watered</button>
    <button type="button" class="btn" data-act="snooze" data-id="${p.id}">Snooze 1 hour</button></div>`;

  /* ---- feedback: haptic + spoken ---- */
  const feedback = (msg, ok = true) => {
    if (st.set.haptic && navigator.vibrate) navigator.vibrate(ok ? 90 : [90, 60, 90]);
    if (st.set.speak && window.speechSynthesis) speechSynthesis.speak(new SpeechSynthesisUtterance(msg));
  };

  /* ---- toast with 10 second undo ---- */
  let timer;
  const toast = (msg, prev) => {
    clearInterval(timer); let n = 10;
    const draw = () => { $('#toast-msg').textContent = `${msg} Undo for ${n}s.`; };
    $('#toast').hidden = false; draw();
    $('#undo').onclick = () => { st.plants = JSON.parse(prev); save(); render(); $('#toast').hidden = true; clearInterval(timer); feedback('Undone'); };
    timer = setInterval(() => { n--; if (n <= 0) { $('#toast').hidden = true; clearInterval(timer); } else draw(); }, 1000);
  };
  const change = (id, fn, msg) => {
    const prev = JSON.stringify(st.plants), p = st.plants.find(x => x.id === id);
    fn(p); st.sync = Date.now(); save(); render(); toast(msg, prev); feedback(msg);
  };

  /* ---- actions ---- */
  const acts = {
    water: p => change(p.id, q => { q.last = Date.now(); q.due = null; q.snooze = 0; }, `${p.name} marked as watered.`),
    snooze: p => change(p.id, q => { q.snooze = Date.now() + HOUR; }, `${p.name} snoozed for 1 hour.`),
    dry: p => change(p.id, q => { q.due = Date.now(); q.snooze = 0; }, `${p.name} marked as dry. Water it, then tap Mark as watered.`),
    damp: p => change(p.id, q => { q.due = Date.now() + q.every * DAY; q.snooze = 0; }, `${p.name} is still damp. Next check in ${p.every} days.`),
    retry: p => {
      if (st.demoFail) { $('#retry-msg').textContent = `Still not responding. Your ${p.every}-day reminders keep going.`; feedback('Sensor still not responding', false); }
      else change(p.id, q => { q.sensor = 'ok'; }, 'Sensor is back.');
    }
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (b) return acts[b.dataset.act](st.plants.find(p => p.id === b.dataset.id));
    const sw = e.target.closest('[data-set]'); if (sw) {
      const k = sw.dataset.set;
      if (k === 'demoFail') { st.demoFail = !st.demoFail; st.plants[0].sensor = st.demoFail ? 'failed' : 'ok'; } else st.set[k] = !st.set[k];
      save(); apply(); render(); return; }
    const sz = e.target.closest('[data-size]'); if (sz) { st.set.size = +sz.dataset.size; save(); apply(); }
  });

  /* ---- voice control ---- */
  $('#mic').addEventListener('click', () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return toast('Voice is not supported in this browser. Use the buttons.', JSON.stringify(st.plants));
    const r = new SR(); r.lang = 'en-US';
    r.onresult = ev => {
      const t = ev.results[0][0].transcript.toLowerCase(), p = st.plants.find(x => t.includes(x.name.toLowerCase()));
      if (p && /water/.test(t)) acts.water(p); else { feedback('Did not catch that', false); toast('Did not catch that. Try: I watered the fern.', JSON.stringify(st.plants)); }
    };
    r.start();
  });

  /* ---- views ---- */
  function render() {
    const P = st.plants, over = P.filter(isOver).sort((a, b) => dueAt(a) - dueAt(b)), u = over[0];
    $('#home-urgent').innerHTML = u
      ? `<section class="urgent" aria-labelledby="urgent-title">${pic(u, 'hero')}<p class="status"><span aria-hidden="true">&#9888;&#65038;</span> Overdue</p>
         <h2 id="urgent-title">${u.name} needs water!</h2><p>Dry for ${Math.floor((Date.now() - u.last) / DAY)} days. ${u.room}.</p>${btns(u)}</section>
         ${over.length > 1 ? `<p class="note">${over.length - 1} more plant needs water. Find it below.</p>` : ''}`
      : '<section class="panel"><p class="status"><span aria-hidden="true">&#10003;</span> All good</p><h2>Nothing needs water today.</h2><p>We will stay quiet until a plant is overdue.</p></section>';
    $('#home-list').innerHTML = `<section class="plants" aria-labelledby="plants-title"><h2 id="plants-title">${u ? 'Doing fine' : 'Your plants'}</h2><ul class="plant-list">` +
      P.filter(p => p !== u).map(p => `<li><a href="#${p.id}">${pic(p, 'thumb')}<span>${p.name}</span>${status(p)}</a></li>`).join('') + '</ul></section>';
    const id = location.hash.slice(1), p = P.find(x => x.id === id);
    if (p) {
      $('#plant-title').textContent = p.name;
      $('#plant-info').innerHTML = `${pic(p, 'hero')}<p>${p.room}. Waters every ${p.every} days.</p>${status(p)}`;
      $('#plant-panel').innerHTML = (p.sensor === 'failed'
        ? `<section class="panel panel--alert" aria-labelledby="s-title">${pic({ ...p, img: 'sensor.png', name: 'Soil sensor' }, 'hero')}
           <p class="status"><span aria-hidden="true">&#10005;</span> Sensor offline</p><h2 id="s-title">Sensor not responding</h2><p>No worries. Check by hand.</p>
           <fieldset><legend>Is the soil dry 2 cm down?</legend><div class="actions">
           <button type="button" class="btn btn--primary" data-act="dry" data-id="${p.id}">Yes, it is dry</button>
           <button type="button" class="btn" data-act="damp" data-id="${p.id}">No, still damp</button></div></fieldset>
           <button type="button" class="btn" data-act="retry" data-id="${p.id}">Retry sensor</button><p class="note" id="retry-msg" role="status"></p>
           <p class="note">Reminders keep going every ${p.every} days until the sensor is back. Nothing is lost. Last reading: 2 days ago.</p></section>`
        : '<section class="panel"><p class="status"><span aria-hidden="true">&#10003;</span> Sensor connected</p><p>Soil moisture is fine. We only alert you when it is overdue.</p></section>')
        + `<section class="panel"><h2>Override any time</h2>${btns(p).replace('Snooze 1 hour', 'Snooze 1 hour')}<button type="button" class="btn" data-act="dry" data-id="${p.id}">Mark as dry</button></section>`;
    }
    $$('#sync').forEach(updateSync);
  }
  function updateSync(el) {
    const m = Math.max(0, Math.round((Date.now() - st.sync) / 60000));
    el.textContent = navigator.onLine ? `Synced ${m ? m + ' min ago' : 'just now'}. Works offline.` : `Offline. Last synced ${m} min ago. Changes are saved on this phone.`;
  }
  function route() {
    const h = location.hash.slice(1) || 'home', plant = st.plants.some(p => p.id === h);
    const v = h === 'settings' ? 'settings' : plant ? 'plant' : 'home';
    ['home', 'plant', 'settings'].forEach(n => $('#view-' + n).hidden = n !== v);
    $$('.nav-link').forEach(a => a.toggleAttribute('aria-current', a.getAttribute('href') === '#' + (v === 'settings' ? 'settings' : 'home')) || a.removeAttribute('aria-current'));
    $$('.nav-link').forEach(a => a.getAttribute('aria-current') !== null && a.setAttribute('aria-current', 'page'));
    render(); $('#main').focus({ preventScroll: true });
  }
  function apply() {
    const r = document.documentElement;
    st.set.eco ? r.setAttribute('data-theme', 'eco') : r.removeAttribute('data-theme');
    r.style.fontSize = st.set.size + '%';
    $$('[data-set]').forEach(b => { const on = b.dataset.set === 'demoFail' ? st.demoFail : st.set[b.dataset.set]; b.setAttribute('aria-checked', on); b.textContent = on ? 'ON' : 'OFF'; });
    $$('[data-size]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.size === st.set.size));
    $('#mic').hidden = !st.set.voice;
  }
  addEventListener('hashchange', route);
  addEventListener('online', () => { st.sync = Date.now(); save(); $$('#sync').forEach(updateSync); });
  addEventListener('offline', () => $$('#sync').forEach(updateSync));
  setInterval(() => $$('#sync').forEach(updateSync), 60000);
  if (navigator.onLine) st.sync = Date.now();
  apply(); route();
})();
