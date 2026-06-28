import { API } from "../../carbontrust/shared.jsx";

export async function sendVerification(payload) {
  const res = await fetch(`${API}/auth/send-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function verifyEmail(token, email) {
  const res = await fetch(`${API}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, email }),
  });
  return res.json();
}

export async function registerCompany(data) {
  const res = await fetch(`${API}/auth/register-company`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function registerLandlord(data) {
  const res = await fetch(`${API}/auth/register-landlord`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function loginUser({ identifier, password, role }) {
  const body = { password, role };
  if (identifier.includes("@")) {
    body.email = identifier.trim();
  } else {
    body.username = identifier.trim();
  }

  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, ...(await res.json()) };
}

export async function adminLogin(username, password) {
  const res = await fetch(`${API}/auth/admin-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

export async function logoutUser(token) {
  const res = await fetch(`${API}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.json();
}

export async function getMe(token) {
  const res = await fetch(`${API}/auth/me`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res.json();
}
