const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const state = {
  user: null,
  photo: null,
  selectedPrice: null,
  selectedBug: null,
  senderMode: "pribadi",
  senders: [],
  currentScreen: "splash"
};

const PRICES = [
  { id: 1, label: "1 HARI", price: 2000, qris: "media/qris1.png" },
  { id: 2, label: "7 HARI", price: 10000, qris: "media/qris2.png" },
  { id: 3, label: "30 HARI", price: 15000, qris: "media/qris3.png" },
  { id: 4, label: "FULL UP PERMANEN", price: 28000, qris: "media/qris4.png" },
  { id: 5, label: "RESELLER PERMANEN", price: 40000, qris: "media/qris5.png" },
  { id: 6, label: "OWNER", price: 150000, qris: "media/qris6.png" }
];

const BUGS = [
  { id: "delay",  name: "DELAY",          global: false },
  { id: "fco",    name: "FC ANDRO ORI",   global: true  },
  { id: "fcb",    name: "FC ANDRO BISNIS",global: true  },
  { id: "fcios",  name: "FC IOS INVIS",   global: false },
  { id: "blank",  name: "BLANK UI",       global: false },
  { id: "crash",  name: "CRASH CLICK",    global: false }
];

let adminData = null;
let sosmedData = null;

/* ============ INIT ============ */
function init() {
  loadJSON();
  buildPriceGrid();
  buildBugList();
  buildLinkGB();
  bindEvents();
  navigate("splash");
  startStats();
  renderSenders();
  updateSenderStatus();
}

function loadJSON() {
  fetch("admin.json")
    .then(r => r.json())
    .then(d => { adminData = d; })
    .catch(() => { adminData = { admin: { username: "Alyz", password: "Pemula", role: "Admin" } }; });

  fetch("sosmed.json")
    .then(r => r.json())
    .then(d => {
      sosmedData = d;
      buildLinkGB();
    })
    .catch(() => {
      sosmedData = {
        links: [{ name: "TikTok", url: "#" }],
        help: "#",
        info: "Alya Crasher adalah sebuah Sistem yang di kembangkan oleh Alyz. Jangan lupa Follow @aizxstechu"
      };
      buildLinkGB();
    });
}

/* ============ NAV ============ */
function navigate(id) {
  $$(".screen").forEach(s => s.classList.remove("active"));
  const el = document.getElementById("screen-" + id);
  if (el) el.classList.add("active");
  state.currentScreen = id;
  $$(".panel").forEach(p => p.classList.remove("open"));
  closeDrawer();
}

/* ============ BUILD PRICE ============ */
function buildPriceGrid() {
  const grid = $("#priceGrid");
  if (!grid) return;
  grid.innerHTML = "";
  PRICES.forEach(p => {
    const card = document.createElement("div");
    card.className = "price-card";
    card.dataset.id = p.id;
    card.innerHTML = '<h4>' + p.label + '</h4><p>Rp ' + p.price.toLocaleString("id-ID") + '</p>';
    card.addEventListener("click", () => {
      $$(".price-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      state.selectedPrice = p;
    });
    grid.appendChild(card);
  });

  const up = $("#uproleGrid");
  if (!up) return;
  up.innerHTML = "";
  PRICES.forEach(p => {
    const card = document.createElement("div");
    card.className = "price-card";
    card.innerHTML = '<h4>' + p.label + '</h4><p>Rp ' + p.price.toLocaleString("id-ID") + '</p>';
    card.addEventListener("click", () => {
      up.querySelectorAll(".price-card").forEach(x => x.classList.remove("selected"));
      card.classList.add("selected");
    });
    up.appendChild(card);
  });
}

/* ============ BUILD BUG ============ */
function buildBugList() {
  const list = $("#bugList");
  if (!list) return;
  list.innerHTML = "";

  BUGS.forEach(function(b) {
    const card = document.createElement("div");
    card.className = "bug-option";
    card.dataset.id = b.id;
    card.dataset.global = String(b.global);
    card.dataset.name = b.name;
    card.innerHTML =
      '<div class="bug-opt-top">' +
        '<span class="bug-opt-icon">' +
          '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' +
          '</svg>' +
        '</span>' +
        '<span class="bug-opt-check">&#10003;</span>' +
      '</div>' +
      '<div class="bug-opt-name">' + b.name + '</div>' +
      '<span class="bug-opt-tag">' + b.id + '</span>';

    card.addEventListener("click", function() {
      if (state.senderMode === "global" && !b.global) return;
      $$(".bug-option").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      state.selectedBug = b;
    });

    list.appendChild(card);
  });

  refreshBugAvailability();
}

function refreshBugAvailability() {
  $$(".bug-option").forEach(function(card) {
    const isGlobal = card.dataset.global === "true";
    if (state.senderMode === "global" && !isGlobal) {
      card.classList.add("disabled");
    } else {
      card.classList.remove("disabled");
    }
    card.classList.remove("selected");
  });
  state.selectedBug = null;
}

/* ============ LINK GB ============ */
function buildLinkGB() {
  const wrap = $("#linkgbList");
  if (!wrap || !sosmedData) return;
  wrap.innerHTML = "";
  (sosmedData.links || []).forEach(function(l) {
    const a = document.createElement("a");
    a.href = l.url;
    a.target = "_blank";
    a.className = "btn btn-outline";
    a.style.cssText = "text-align:center; text-decoration:none; display:block; max-width:100%;";
    a.textContent = l.name;
    wrap.appendChild(a);
  });
  const infoText = $("#panelInfoText");
  if (infoText) infoText.textContent = sosmedData.info || "";
  const aboutInfo = $("#aboutInfo");
  if (aboutInfo) aboutInfo.textContent = sosmedData.info || "";
}

/* ============ EVENTS ============ */
function bindEvents() {
  /* nav tombol splash */
  $$("[data-nav]").forEach(function(btn) {
    btn.addEventListener("click", function() { navigate(btn.dataset.nav); });
  });
  $$("[data-back]").forEach(function(btn) {
    btn.addEventListener("click", function() { navigate(btn.dataset.back); });
  });

  /* help */
  const btnHelp = $("#btnHelp");
  if (btnHelp) btnHelp.addEventListener("click", function() {
    const url = (sosmedData && sosmedData.help) ? sosmedData.help : "#";
    window.open(url, "_blank");
  });

  /* bayar */
  const btnBayar = $("#btnBayar");
  if (btnBayar) btnBayar.addEventListener("click", function() {
    const u = $("#beliUser").value.trim();
    const p = $("#beliPass").value.trim();
    if (!state.selectedPrice) return alert("Pilih paket dulu");
    if (!u || !p) return alert("Isi username dan password");
    openQris(state.selectedPrice);
  });

  const qrisClose = $("#qrisClose");
  if (qrisClose) qrisClose.addEventListener("click", function() {
    $("#popupQris").classList.remove("open");
  });

  /* login */
  const btnLogin = $("#btnLogin");
  if (btnLogin) btnLogin.addEventListener("click", doLogin);

  /* skip anim */
  const btnSkip = $("#btnSkip");
  if (btnSkip) btnSkip.addEventListener("click", function() {
    stopGravity();
    navigate("main");
    updateProfileUI();
    setNavActive("home");
  });

  /* drawer */
  const btnDrawer = $("#btnDrawer");
  if (btnDrawer) btnDrawer.addEventListener("click", openDrawer);
  const drawerOverlay = $("#drawerOverlay");
  if (drawerOverlay) drawerOverlay.addEventListener("click", closeDrawer);

  $$("[data-drawer]").forEach(function(btn) {
    btn.addEventListener("click", function() {
      closeDrawer();
      openPanel(btn.dataset.drawer);
    });
  });
  $$(".panel-close").forEach(function(btn) {
    btn.addEventListener("click", function() {
      btn.closest(".panel").classList.remove("open");
    });
  });

  /* foto profil */
  const photoInput = $("#photoInput");
  if (photoInput) photoInput.addEventListener("change", function(e) {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      $("#userPhoto").src = ev.target.result;
      state.photo = ev.target.result;
    };
    reader.readAsDataURL(f);
  });

  /* bottom nav */
  $$("[data-nav2]").forEach(function(btn) {
    btn.addEventListener("click", function() {
      setNavActive(btn.dataset.nav2);
      const t = btn.dataset.nav2;
      if (t === "home") navigate("main");
      else if (t === "bug") navigate("bug");
      else if (t === "sender") navigate("sender");
      else if (t === "setting") navigate("setting");
    });
  });

  /* PILIH SENDER — pribadi / global (event delegation) */
  const senderModeWrap = $("#senderMode");
  if (senderModeWrap) {
    senderModeWrap.addEventListener("click", function(e) {
      const card = e.target.closest(".mode-card");
      if (!card) return;
      const mode = card.dataset.mode;
      $$(".mode-card").forEach(function(b) { b.classList.remove("active"); });
      card.classList.add("active");
      state.senderMode = mode;
      refreshBugAvailability();
      updateSenderStatus();
    });
  }

  /* kirim bug */
  const btnKirimBug = $("#btnKirimBug");
  if (btnKirimBug) btnKirimBug.addEventListener("click", kirimBug);

  const sentOk = $("#sentOk");
  if (sentOk) sentOk.addEventListener("click", function() {
    $("#popupSent").classList.remove("open");
  });

  /* sender page */
  const senderBack = $("#senderBack");
  if (senderBack) senderBack.addEventListener("click", function() {
    navigate("main");
    setNavActive("home");
  });

  const btnTambahSender = $("#btnTambahSender");
  if (btnTambahSender) btnTambahSender.addEventListener("click", function() {
    $("#senderInputWrap").style.display = "block";
    $("#senderNomor").value = "";
  });

  const btnOkeSender = $("#btnOkeSender");
  if (btnOkeSender) btnOkeSender.addEventListener("click", function() {
    const n = $("#senderNomor").value.trim();
    if (!/^[0-9]{8,15}$/.test(n)) return alert("Nomor tidak valid");
    openSenderCode(n);
  });

  const codeClose = $("#codeClose");
  if (codeClose) codeClose.addEventListener("click", function() {
    $("#popupSenderCode").classList.remove("open");
  });
  const codeRefresh = $("#codeRefresh");
  if (codeRefresh) codeRefresh.addEventListener("click", generateSenderCode);

  /* setting */
  const settingBack = $("#settingBack");
  if (settingBack) settingBack.addEventListener("click", function() {
    navigate("main");
    setNavActive("home");
  });
  const btnLogout = $("#btnLogout");
  if (btnLogout) btnLogout.addEventListener("click", logout);
  const btnGantiAkun = $("#btnGantiAkun");
  if (btnGantiAkun) btnGantiAkun.addEventListener("click", function() { alert("Fitur ganti akun"); });
  const btnGantiPass = $("#btnGantiPass");
  if (btnGantiPass) btnGantiPass.addEventListener("click", function() { alert("Fitur ganti password"); });

  /* toggle pass */
  const togglePass = $("#togglePass");
  if (togglePass) togglePass.addEventListener("click", function() {
    const el = $("#profilPass");
    el.type = el.type === "password" ? "text" : "password";
  });

  /* save target */
  const btnSaveTarget = $("#btnSaveTarget");
  if (btnSaveTarget) btnSaveTarget.addEventListener("click", function() {
    const n = $("#targetNomor").value.trim();
    if (!/^[0-9]{8,15}$/.test(n)) return alert("Nomor tidak valid");
    localStorage.setItem("target", n);
    alert("Target disimpan: " + n);
  });

  const bugPin = $("#bugPin");
  if (bugPin) bugPin.addEventListener("click", function() { alert("Pin"); });
  const bugHistory = $("#bugHistory");
  if (bugHistory) bugHistory.addEventListener("click", function() { alert("History"); });

  const senderRefresh = $("#senderRefresh");
  if (senderRefresh) senderRefresh.addEventListener("click", function() {
    renderSenders();
    updateSenderStatus();
  });
}

/* set nav active */
function setNavActive(name) {
  $$(".nav-btn").forEach(function(b) {
    b.classList.toggle("active", b.dataset.nav2 === name);
  });
}

/* ============ QRIS ============ */
function openQris(price) {
  $("#qrisImg").src = price.qris;
  $("#qrisPrice").textContent = "Rp " + price.price.toLocaleString("id-ID");
  $("#qrisTitle").textContent = "PEMBAYARAN " + price.label;
  $("#popupQris").classList.add("open");
}

/* ============ LOGIN ============ */
function doLogin() {
  const u = $("#loginUser").value.trim();
  const p = $("#loginPass").value.trim();
  const err = $("#loginError");
  err.textContent = "";

  if (!adminData) {
    adminData = { admin: { username: "Alyz", password: "Pemula", role: "Admin" } };
  }

  if (u === adminData.admin.username && p === adminData.admin.password) {
    state.user = { username: u, password: p, role: adminData.admin.role };
    navigate("anim");
    startGravity();
    return;
  }

  let stored = [];
  try { stored = JSON.parse(localStorage.getItem("users") || "[]"); } catch(e) { stored = []; }
  const found = stored.find(x => x.username === u && x.password === p);
  if (found) {
    state.user = found;
    navigate("anim");
    startGravity();
    return;
  }

  err.textContent = "Username atau password salah";
}

function updateProfileUI() {
  if (!state.user) return;
  $("#profileName").textContent = state.user.username.toUpperCase();
  $("#profileRole").textContent = state.user.role || "User";
  $("#profilUser").value = state.user.username;
  $("#profilPass").value = state.user.password;
}

/* ============ GRAVITY 3D ============ */
let gravityRAF = null;
let particles = [];

function startGravity() {
  const canvas = $("#gravityCanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");
  particles = [];
  for (let i = 0; i < 120; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 800 + 200,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      vz: (Math.random() - 0.5) * 0.8,
      size: Math.random() * 3 + 1
    });
  }
  let frame = 0;
  function loop() {
    frame++;
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(0, 0, w, h);
    particles.forEach(function(p) {
      p.x += p.vx; p.y += p.vy; p.z += p.vz;
      if (p.z < 50) p.z = 50;
      if (p.z > 1200) p.z = 1200;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
      const scale = 500 / p.z;
      const px = (p.x - w/2) * scale + w/2;
      const py = (p.y - h/2) * scale + h/2;
      const r = p.size * scale;
      if (r > 0.2 && px > 0 && px < w && py > 0 && py < h) {
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255," + Math.min(1, scale * 2) + ")";
        ctx.fill();
      }
    });
    if (frame >= 420) {
      stopGravity();
      navigate("main");
      updateProfileUI();
      setNavActive("home");
      return;
    }
    gravityRAF = requestAnimationFrame(loop);
  }
  loop();
}

function stopGravity() {
  if (gravityRAF) cancelAnimationFrame(gravityRAF);
  gravityRAF = null;
}

/* ============ SENDER CODE ============ */
function generateSenderCode() {
  const seg = function() { return Math.random().toString(36).toUpperCase().slice(2, 6).padEnd(4, "X"); };
  $("#senderCode").textContent = seg() + "-" + seg();
}

function openSenderCode(nomor) {
  generateSenderCode();
  $("#popupSenderCode").classList.add("open");
  setTimeout(function() {
    if (!state.senders.find(s => s.nomor === nomor)) {
      state.senders.push({ nomor: nomor, online: true });
      renderSenders();
      updateSenderStatus();
    }
  }, 1200);
}

function renderSenders() {
  const wrap = $("#senderList");
  if (!wrap) return;
  wrap.innerHTML = "";
  if (!state.senders.length) {
    wrap.innerHTML = '<div class="sender-item"><div><span class="status-dot"></span>Belum ada sender</div></div>';
    return;
  }
  state.senders.forEach(function(s, i) {
    const div = document.createElement("div");
    div.className = "sender-item";
    div.innerHTML =
      '<div><span class="status-dot"></span>' + s.nomor + '</div>' +
      '<button type="button" class="del-btn" data-i="' + i + '">HAPUS</button>';
    div.querySelector(".del-btn").addEventListener("click", function() {
      state.senders.splice(i, 1);
      renderSenders();
      updateSenderStatus();
    });
    wrap.appendChild(div);
  });
}

function updateSenderStatus() {
  const st = $("#statSender");
  if (st) st.textContent = state.senders.length;
  const sub = $("#globalSenderSub");
  if (sub) sub.textContent = state.senders.length + " sender";
  const onl = $("#senderOnlineCount");
  if (onl) onl.textContent = state.senders.length;
  const pr = $("#pribadiSub");
  if (pr) pr.textContent = state.senders.length ? state.senders.length + " sender" : "Kosong";
}

/* ============ KIRIM BUG ============ */
function kirimBug() {
  const nomor = $("#targetNomor").value.trim();
  if (!/^[0-9]{8,15}$/.test(nomor)) return alert("Nomor tidak valid");
  if (!state.selectedBug) return alert("Pilih menu bug");

  $("#popupCountdown").classList.add("open");
  let n = 8;
  $("#countdownNum").textContent = n;
  const iv = setInterval(function() {
    n--;
    $("#countdownNum").textContent = n;
    $("#countdownNum").style.animation = "none";
    void $("#countdownNum").offsetWidth;
    $("#countdownNum").style.animation = "popNum .35s ease";
    if (n <= 0) {
      clearInterval(iv);
      $("#popupCountdown").classList.remove("open");
      $("#sentText").textContent = "Terkirim. " + state.selectedBug.name + " telah di kirim cek history bug untuk melihat status pengiriman";
      $("#popupSent").classList.add("open");
    }
  }, 1000);
}

/* ============ DRAWER / PANEL ============ */
function openDrawer() {
  $("#drawer").classList.add("open");
  $("#drawerOverlay").classList.add("open");
}
function closeDrawer() {
  const d = $("#drawer");
  const o = $("#drawerOverlay");
  if (d) d.classList.remove("open");
  if (o) o.classList.remove("open");
}
function openPanel(name) {
  const p = document.getElementById("panel-" + name);
  if (p) p.classList.add("open");
  if (name === "profil") updateProfileUI();
}

/* ============ SETTING ============ */
function logout() {
  state.user = null;
  navigate("splash");
  setNavActive("home");
  $("#loginUser").value = "";
  $("#loginPass").value = "";
  $("#loginError").textContent = "";
}

/* ============ STATS ============ */
function startStats() {
  setInterval(function() {
    const online = Math.floor(Math.random() * 40) + 10;
    const cpu = Math.floor(Math.random() * 60) + 20;
    const s1 = $("#statOnline"); if (s1) s1.textContent = online;
    const s2 = $("#statSender"); if (s2) s2.textContent = state.senders.length;
    const s3 = $("#statCpu"); if (s3) s3.textContent = cpu + "%";
  }, 3000);
}

/* ============ START ============ */
window.addEventListener("DOMContentLoaded", init);
