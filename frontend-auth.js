// frontend-auth.js
// Integração frontend <-> backend (Node/Express) para autenticação.
// Ajuste API_BASE se seu backend estiver em outra porta/host.
const API_URL = "https://backend-dark-white.onrender.com";
const TOKEN_KEY = 'dw_token';
const USER_KEY = 'dw_user';

// Registrar usuário (chama /api/auth/register)
async function registerUser({ nome, endereco, email, senha }) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nome, endereco, email, senha })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro ao registrar');
  return data;
}

// Login (chama /api/auth/login). Salva token e user no localStorage.
async function loginUser({ email, senha }) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erro no login');
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data;
}

// Logout (remove token e user)
function logoutUser() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // opcional: redirecionar para a home
  window.location.href = window.location.pathname.endsWith('index.html') ? 'index.html' : 'index.html';
}

// Retorna token atual ou null
function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Retorna usuário armazenado ou tenta buscar /api/me
async function getCurrentUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (raw) return JSON.parse(raw);
  const token = getToken();
  if (!token) return null;
  // tenta validar com /api/me
  try {
    const res = await fetch(`${API_BASE}/api/me`, {
      headers: { Authorization: 'Bearer ' + token }
    });
    if (!res.ok) {
      logoutUser();
      return null;
    }
    const d = await res.json();
    localStorage.setItem(USER_KEY, JSON.stringify(d.user));
    return d.user;
  } catch {
    logoutUser();
    return null;
  }
}

// Monta uma área de autenticação no header (ex.: <div id="auth-area"></div>)
async function mountAuthHeader(containerSelector = '#auth-area') {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  const user = await getCurrentUser();
  if (user) {
    container.innerHTML = `
      <span style="color:white;margin-right:8px">Olá, ${escapeHtml(user.nome || user.email)}</span>
      <button id="dw-logout" style="padding:6px 10px;border-radius:6px;border:none;background:#fff;color:#333;cursor:pointer">Sair</button>
    `;
    document.getElementById('dw-logout').addEventListener('click', () => {
      logoutUser();
    });
  } else {
    container.innerHTML = `
      <a href="Login.html" style="color:white;margin-right:8px">Entrar</a>
      <a href="Register.html" style="color:white">Cadastrar</a>
    `;
  }
}

// Pequeno escape para inserir nome seguro em HTML
function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
}

// Exporta utilitários no window para uso em páginas de login/register
window.dwAuth = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  mountAuthHeader
};