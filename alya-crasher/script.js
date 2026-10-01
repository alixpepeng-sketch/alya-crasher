const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

// ============ STATE ============
const state = {
  user: null,
  photo: null,
  selectedPrice: null,
  qrisIndex: 1,
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
  { id: "delay", name: "DELAY", global: false },
  { id: "fco", name: "FC ANDRO ORI", global: true },
  { id: "fcb", name: "FC ANDRO BISNIS", global: true },
  { id: "fcios", name: "FC IOS INVIS", global: false },
  { id: "blank", name: "BLANK UI", global: false },
  { id: "crash", name: "CRASH CLICK", global: false }
];

let adminData = null;
let sosmedData = null;

// ============ INIT ============
async function init() {
  await loadJSON();
  buildPriceGrid();
  buildBugList();
  buildLinkGB();
  bindEvents();
  navigate("splash");
  startStats();
}

async function loadJSON() {
  try {
    adminData = await fetch("admin.json").then(r => r.json());
  } catch {
    adminData = { admin: { username: "Alyz", password: "Pemula", role: "Admin" } };
  }
  try {
    sosmedData = await fetch("sosmed.json").then(r => r.json());
  } catch {
    sosmedData = {
      links: [{ name: "TikTok", url: "#" }],
      help: "#",
      info: "Alya Crasher adalah sebuah Sistem yang di kembangkan oleh Alyz."
    };
  }
}

// ============ NAVIGATION ============
function navigate(id) {
  $$(".screen").forEach(s => s.classList.remove("active"));
  const el = document.getElementById("screen-" + id);
  if (el) el.classList.add("active");
  state.currentScreen = id;
}

// ============ BUILD PRICE ============
function buildPriceGrid() {
  const grid = $("#priceGrid");
  grid.innerHTML = "";
  PRICES.forEach(p => {
    const card = document.createElement("div");
    card.className = "price-card";
    card.dataset.id = p.id;
    card.innerHTML = `<h4>${p.label}</h4><p>Rp ${p.price.toLocaleString("id-ID")}</p>`;
    card.addEventListener("click", () => {
      $$(".price-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      state.selectedPrice = p;
    });
    grid.appendChild(card);
  });

  const up = $("#uproleGrid");
  up.innerHTML = grid.innerHTML;
  up.querySelectorAll(".price-card").forEach((c, i) => {
    c.addEventListener("click", () => {
      up.querySelectorAll(".price-card").forEach(x => x.classList.remove("selected"));
      c.classList.add("selected");
    });
  });
}

// ============ BUILD BUG ============
function buildBugList() {
  const list = $("#bugList");
  list.innerHTML = "";
  BUGS.forEach(b => {
    const card = document.createElement("div");
    card.className = "bug-card";
    card.dataset.id = b.id;
    card.dataset.global = b.global;
    card.textContent = b.name;
    card.addEventListener("click", () => {
      if (state.senderMode === "global" && !b.global) return;
      $$(".bug-card").forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      state.selectedBug = b;
    });
    list.appendChild(card);
  });
  refreshBugAvailability();
}

function refreshBugAvailability() {
  $$(".bug-card").forEach(card => {
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

// ============ BUILD LINK GB ============
function buildLinkGB() {
  const wrap = $("#linkgbList");
  wrap.innerHTML = "";
  (sosmedData.links || []).forEach(l => {
    const a = document.createElement("a");
    a.href = l.url;
    a.target = "_blank";
    a.className = "btn btn-outline";
    a.style.textAlign = "center";
    a.style.textDecoration = "none";
    a.style.display = "block";
    a.textContent = l.name;
    wrap.appendChild(a);
  });
  $("#panelInfoText").textContent = sosmedData.info || "";
  $("#aboutInfo").textContent = sosmedData.info || "";
}

// ============ EVENTS ============
function bindEvents() {
  // Splash nav
  document.querySelectorAll("[data-nav]").forEach(btn => {
    btn.addEventListener("click", () => navigate(btn.dataset.nav));
  });

  // Back button
  document.querySelectorAll("[data-back]").forEach(btn => {
    btn.addEventListener("click", () => navigate(btn.dataset.back));
  });

  // Help
  $("#btnHelp").addEventListener("click", () => {
    window.open(sosmedData.help || "#", "_blank");
  });

  // Bayar
  $("#btnBayar").addEventListener("click", () => {
    const u = $("#beliUser").value.trim();
    const p = $("#beliPass").value.trim();
    if (!state.selectedPrice) return alert("Pilih paket dulu");
    if (!u || !p) return alert("Isi username dan password");
    openQris(state.selectedPrice);
  });

  // QRIS close
  $("#qrisClose").addEventListener("click", () => {
    $("#popupQris").classList.remove("open");
  });

  // Login
  $("#btnLogin").addEventListener("click", doLogin);

  // Animasi skip
  $("#btnSkip").addEventListener("click", () => {
    stopGravity();
    navigate("main");
    updateProfileUI();
  });

  // Drawer
  $("#btnDrawer").addEventListener("click", openDrawer);
  $("#drawerOverlay").addEventListener("click", closeDrawer);
  document.querySelectorAll("[data-drawer]").forEach(btn => {
    btn.addEventListener("click", () => {
      closeDrawer();
      openPanel(btn.dataset.drawer);
    });
  });
  document.querySelectorAll(".panel-close").forEach(btn => {
    btn.addEventListener("click", () => btn.closest(".panel").classList.remove("open"));
  });

  // Foto profil
  $("#photoInput").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => {
      $("#userPhoto").src = ev.target.result;
      state.photo = ev.target.result;
    };
    reader.readAsDataURL(f);
  });

  // Bottom nav
  document.querySelectorAll("[data-nav2]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const t = btn.dataset.nav2;
      if (t === "home") navigate("main");
      else if (t === "bug") navigate("bug");
      else if (t === "sender") navigate("sender");
      else if (t === "setting") navigate("setting");
    });
  });

  // Bug screen
  $("#bugBack").addEventListener("click", () => {
    navigate("main");
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    document.querySelector('[data-nav2="home"]').classList.add("active");
  });

  // Sender mode
  document.querySelectorAll(".mode-box").forEach(box => {
    box.addEventListener("click", () => {
      document.querySelectorAll(".mode-box").forEach(b => b.classList.remove("active"));
      box.classList.add("active");
      state.senderMode = box.dataset.mode;
      refreshBugAvailability();
      updateSenderStatus();
    });
  });

  // Kirim bug
  $("#btnKirimBug").addEventListener("click", kirimBug);

  // Popup sent
  $("#sentOk").addEventListener("click", () => {
    $("#popupSent").classList.remove("open");
  });

  // Sender
  $("#senderBack").addEventListener("click", () => navigate("main"));
  $("#btnTambahSender").addEventListener("click", () => {
    $("#senderInputWrap").style.display = "block";
    $("#senderNomor").value = "";
  });
  $("#btnOkeSender").addEventListener("click", () => {
    const n = $("#senderNomor").value.trim();
    if (!/^[0-9]{8,15}$/.test(n)) return alert("Nomor tidak valid");
    openSenderCode();
  });
  $("#codeClose").addEventListener("click", () => {
    $("#popupSenderCode").classList.remove("open");
  });
  $("#codeRefresh").addEventListener("click", generateSenderCode);

  // Setting
  $("#settingBack").addEventListener("click", () => navigate("main"));
  $("#btnLogout").addEventListener("click", logout);
  $("#btnGantiAkun").addEventListener("click", () => alert("Fitur ganti akun"));
  $("#btnGantiPass").addEventListener("click", () => alert("Fitur ganti password"));

  // Toggle pass
  $("#togglePass").addEventListener("click", () => {
    const el = $("#profilPass");
    el.type = el.type === "password" ? "text" : "password";
  });
}

// ============ QRIS ============
function openQris(price) {
  $("#qrisImg").src = price.qris;
  $("#qrisPrice").textContent = "Rp " + price.price.toLocaleString("id-ID");
  $("#qrisTitle").textContent = "PEMBAYARAN " + price.label;
  $("#popupQris").classList.add("open");
}

// ============ LOGIN ============
function doLogin() {
  const u = $("#loginUser").value.trim();
  const p = $("#loginPass").value.trim();
  const err = $("#loginError");
  err.textContent = "";

  if (adminData && adminData.admin &&
      u === adminData.admin.username &&
      p === adminData.admin.password) {
    state.user = { username: u, password: p, role: adminData.admin.role };
    navigate("anim");
    startGravity();
    return;
  }

  const stored = JSON.parse(localStorage.getItem("users") || "[]");
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

// ============ ANIMASI GRAFITY 3D ============
let gravityRAF = null;
let gravityCtx = null;
let particles = [];

function startGravity() {
  const canvas = $("#gravityCanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gravityCtx = canvas.getContext("2d");
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
  const MAX = 300;
  function loop() {
    frame++;
    const w = canvas.width;
    const h = canvas.height;
    gravityCtx.fillStyle = "rgba(0,0,0,0.25)";
    gravityCtx.fillRect(0, 0, w, h);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;
      if (p.z < 50) p.z = 50;
      if (p.z > 1200) p.z = 1200;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      const scale = 500 / p.z;
      const px = (p.x - w / 2) * scale + w / 2;
      const py = (p.y - h / 2) * scale + h / 2;
      const r = p.size * scale;
      if (r > 0.2 && px > 0 && px < w && py > 0 && py < h) {
        gravityCtx.beginPath();
        gravityCtx.arc(px, py, r, 0, Math.PI * 2);
        gravityCtx.fillStyle = `rgba(255,255,255,${Math.min(1, scale * 2)})`;
        gravityCtx.fill();
      }
    });

    if (frame >= MAX) {
      gravityRAF = requestAnimationFrame(loop);
      // auto lanjut setelah 300 frame? no, tunggu user skip atau selesai
    } else {
      gravityRAF = requestAnimationFrame(loop);
    }
    // Auto selesai setelah 7 detik
    if (frame === 420) {
      stopGravity();
      navigate("main");
      updateProfileUI();
    }
  }
  loop();
}

function stopGravity() {
  if (gravityRAF) cancelAnimationFrame(gravityRAF);
  gravityRAF = null;
}

// ============ SENDER CODE ============
function generateSenderCode() {
  const seg = () => Math.random().toString(36).toUpperCase().slice(2, 6).padEnd(4, "X");
  $("#senderCode").textContent = `${seg()}-${seg()}`;
}

function openSenderCode() {
  generateSenderCode();
  $("#popupSenderCode").classList.add("open");
  const n = $("#senderNomor").value.trim();
  setTimeout(() => {
    if (!state.senders.find(s => s.nomor === n)) {
      state.senders.push({ nomor: n, online: true });
      renderSenders();
      updateSenderStatus();
    }
  }, 1200);
}

function renderSenders() {
  const wrap = $("#senderList");
  wrap.innerHTML = "";
  state.senders.forEach((s, i) => {
    const div = document.createElement("div");
    div.className = "sender-item";
    div.innerHTML = `
      <div><span class="status-dot"></span>${s.nomor}</div>
      <button class="del-btn" data-i="${i}">HAPUS</button>
    `;
    div.querySelector(".del-btn").addEventListener("click", () => {
      state.senders.splice(i, 1);
      renderSenders();
      updateSenderStatus();
    });
    wrap.appendChild(div);
  });
}

function updateSenderStatus() {
  const on = state.senders.some(s => s.online);
  $("#senderStatus").textContent = `STATUS SENDER: ${on ? "ON" : "OFF"}`;
  $("#statSender").textContent = state.senders.length;
}

// ============ KIRIM BUG ============
function kirimBug() {
  const nomor = $("#targetNomor").value.trim();
  if (!/^[0-9]{8,15}$/.test(nomor)) return alert("Nomor tidak valid");
  if (!state.selectedBug) return alert("Pilih menu bug");

  $("#popupCountdown").classList.add("open");
  let n = 8;
  $("#countdownNum").textContent = n;
  const iv = setInterval(() => {
    n--;
    $("#countdownNum").textContent = n;
    $("#countdownNum").style.animation = "none";
    void $("#countdownNum").offsetWidth;
    $("#countdownNum").style.animation = "popNum .35s ease";
    if (n <= 0) {
      clearInterval(iv);
      $("#popupCountdown").classList.remove("open");
      $("#sentText").textContent = `Terkirim. ${state.selectedBug.name} telah di kirim cek history bug untuk melihat status pengiriman`;
      $("#popupSent").classList.add("open");
    }
  }, 1000);
}

// ============ DRAWER / PANEL ============
function openDrawer() {
  $("#drawer").classList.add("open");
  $("#drawerOverlay").classList.add("open");
}
function closeDrawer() {
  $("#drawer").classList.remove("open");
  $("#drawerOverlay").classList.remove("open");
}
function openPanel(name) {
  const p = document.getElementById("panel-" + name);
  if (p) p.classList.add("open");
  if (name === "profil") updateProfileUI();
}

// ============ SETTING ============
function logout() {
  state.user = null;
  navigate("splash");
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
  document.querySelector('[data-nav2="home"]').classList.add("active");
  $("#loginUser").value = "";
  $("#loginPass").value = "";
  $("#loginError").textContent = "";
}

// ============ STATS DUMMY ============
function startStats() {
  setInterval(() => {
    const online = Math.floor(Math.random() * 40) + 10;
    const sender = state.senders.length;
    const cpu = Math.floor(Math.random() * 60) + 20;
    $("#statOnline").textContent = online;
    $("#statSender").textContent = sender;
    $("#statCpu").textContent = cpu + "%";
  }, 3000);
}

// ============ START ============
window.addEventListener("DOMContentLoaded", init);