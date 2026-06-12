const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://hvtapi.io.vn/api/admin";

export async function fetchJSON(endpoint, options = {}) {
  let adminSession = null;
  if (typeof window !== "undefined") {
    adminSession = localStorage.getItem("admin_session");
  }

  const headers = {
    "Content-Type": "application/json",
    ...(adminSession ? { "X-Admin-Session": adminSession } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // Required to send the admin_session cookie
  });

  if (!res.ok) {
    let errorMsg = `API Error ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData.detail) errorMsg = errorData.detail;
    } catch (e) {}
    throw new Error(errorMsg);
  }
  return res.json();
}

export async function login(username, password) {
  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || "Đăng nhập thất bại");
  }
  return data;
}

export async function logout() {
  return fetchJSON("/logout", { method: "POST" });
}

export async function getActiveDbInfo() {
  return fetchJSON("/active-db-info");
}

export async function listStudents(page = 1, pageSize = 50, q = "", lop = "") {
  let url = `/students?page=${page}&page_size=${pageSize}`;
  if (q) url += `&q=${encodeURIComponent(q)}`;
  if (lop) url += `&lop=${encodeURIComponent(lop)}`;
  return fetchJSON(url);
}

export async function createStudent(payload) {
  return fetchJSON("/students", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateStudent(id, payload) {
  return fetchJSON(`/students/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export async function deleteStudent(id) {
  return fetchJSON(`/students/${id}`, { method: "DELETE" });
}

export async function listGraduated() {
  return fetchJSON("/graduated");
}

export async function restoreGraduated(id) {
  return fetchJSON(`/graduated/${id}/restore`, { method: "POST" });
}

export async function listUsers() {
  return fetchJSON("/users");
}

export async function createUser(payload) {
  return fetchJSON("/users", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateUser(id, payload) {
  return fetchJSON(`/users/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export async function deleteUser(id) {
  return fetchJSON(`/users/${id}`, { method: "DELETE" });
}

export async function listClasses() {
  return fetchJSON("/classes");
}

export async function getSchedule(lop) {
  return fetchJSON(`/schedule/${encodeURIComponent(lop)}`);
}

export async function updateSchedule(lop, payload) {
  return fetchJSON(`/schedule/${encodeURIComponent(lop)}`, { method: "POST", body: JSON.stringify(payload) });
}

export async function listPauses() {
  return fetchJSON("/pause");
}

export async function createPause(payload) {
  return fetchJSON("/pause", { method: "POST", body: JSON.stringify(payload) });
}

export async function deletePause(id) {
  return fetchJSON(`/pause/${id}`, { method: "DELETE" });
}

export async function listEvents() {
  return fetchJSON("/events");
}

export async function createEvent(payload) {
  return fetchJSON("/events", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateEvent(id, payload) {
  return fetchJSON(`/events/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export async function deleteEvent(id) {
  return fetchJSON(`/events/${id}`, { method: "DELETE" });
}

export async function listServers() {
  return fetchJSON("/servers");
}

export async function createServer(payload) {
  return fetchJSON("/servers", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateServer(id, payload) {
  return fetchJSON(`/servers/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export async function deleteServer(id) {
  return fetchJSON(`/servers/${id}`, { method: "DELETE" });
}

export async function testServerConnection(id) {
  return fetchJSON(`/servers/${id}/test-connection`, { method: "POST" });
}

export async function testConfigConnection(payload) {
  return fetchJSON("/servers/test-connection", { method: "POST", body: JSON.stringify(payload) });
}

export async function activateServer(id) {
  return fetchJSON(`/servers/${id}/activate`, { method: "POST" });
}

export async function importStudents(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/students/import`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    let errorMsg = `API Error ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData.detail) errorMsg = errorData.detail;
    } catch (e) {}
    throw new Error(errorMsg);
  }
  return res.json();
}

export async function upgradeSchoolYear() {
  return fetchJSON("/upgrade-school-year", { method: "POST" });
}

export async function undoUpgradeSchoolYear() {
  return fetchJSON("/undo-upgrade-school-year", { method: "POST" });
}

export async function downgradeStudent(id) {
  return fetchJSON(`/students/${id}/downgrade`, { method: "POST" });
}

export async function transferStudent(id, payload) {
  return fetchJSON(`/students/${id}/transfer`, { method: "POST", body: JSON.stringify(payload) });
}

export async function listGvcn() {
  return fetchJSON("/gvcn");
}

export async function saveGvcn(payload) {
  return fetchJSON("/gvcn", { method: "POST", body: JSON.stringify(payload) });
}

export async function deleteGvcn(id) {
  return fetchJSON(`/gvcn/${id}`, { method: "DELETE" });
}


