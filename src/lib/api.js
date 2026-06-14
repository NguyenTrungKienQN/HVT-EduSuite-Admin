const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://hvtapi.io.vn/api/v1";

export async function fetchJSON(endpoint, options = {}) {
  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("access_token");
  }

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("admin_session");
        localStorage.removeItem("admin_logged_in");
        window.location.href = "/";
      }
    }
    let errorMsg = `API Error ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData.detail) errorMsg = errorData.detail;
      else if (errorData.message) errorMsg = errorData.message;
    } catch (e) {}
    throw new Error(errorMsg);
  }
  return res.json();
}

export async function login(username, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok || data.status !== "success") {
    throw new Error(data.detail || data.message || "Đăng nhập thất bại");
  }
  if (typeof window !== "undefined" && data.access_token) {
    localStorage.setItem("access_token", data.access_token);
    // Backward compatibility for components expecting admin_session
    localStorage.setItem("admin_session", data.access_token);
  }
  return data;
}

export async function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("access_token");
    localStorage.removeItem("admin_session");
  }
  return { status: "success" };
}

export async function getActiveDbInfo() {
  return fetchJSON("/admin/active-db-info");
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
  return fetchJSON("/students/graduated");
}

export async function restoreGraduated(id) {
  return fetchJSON(`/students/graduated/${id}/restore`, { method: "POST" });
}

export async function downgradeStudent(id) {
  return fetchJSON(`/students/${id}/downgrade`, { method: "POST" });
}

export async function transferStudent(id, payload) {
  return fetchJSON(`/students/${id}/transfer`, { method: "POST", body: JSON.stringify(payload) });
}

export async function listUsers() {
  return fetchJSON("/admin/users");
}

export async function createUser(payload) {
  return fetchJSON("/admin/users", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateUser(id, payload) {
  return fetchJSON(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export async function deleteUser(id) {
  return fetchJSON(`/admin/users/${id}`, { method: "DELETE" });
}

export async function listClasses() {
  return fetchJSON("/admin/classes");
}

export async function getSchedule(lop) {
  return fetchJSON(`/schedule/${encodeURIComponent(lop)}/week`);
}

export async function updateSchedule(lop, payload) {
  return fetchJSON(`/schedule/${encodeURIComponent(lop)}/week`, { method: "PUT", body: JSON.stringify(payload) });
}

export async function listPauses() {
  return fetchJSON("/attendance/pauses");
}

export async function createPause(payload) {
  return fetchJSON("/attendance/pauses", { method: "POST", body: JSON.stringify(payload) });
}

export async function deletePause(id) {
  return fetchJSON(`/attendance/pauses/${id}`, { method: "DELETE" });
}

export async function listEvents() {
  const classesRes = await listClasses();
  const classes = classesRes.classes || classesRes.data || [];
  
  const allEvents = [];
  await Promise.all(classes.map(async (cls) => {
    try {
      const className = typeof cls === "string" ? cls : (cls.lop || cls.name);
      if (!className) return;
      const res = await fetchJSON(`/events?lop=${encodeURIComponent(className)}`);
      if (res.events) {
        allEvents.push(...res.events);
      }
    } catch (err) {
      console.error(`Lỗi tải sự kiện lớp ${cls.lop || cls}`, err);
    }
  }));
  
  allEvents.sort((a, b) => new Date(b.bat_dau) - new Date(a.bat_dau));
  
  return { status: "success", events: allEvents };
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
  return fetchJSON("/admin/servers");
}

export async function createServer(payload) {
  return fetchJSON("/admin/servers", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateServer(id, payload) {
  return fetchJSON(`/admin/servers/${id}`, { method: "PUT", body: JSON.stringify(payload) });
}

export async function deleteServer(id) {
  return fetchJSON(`/admin/servers/${id}`, { method: "DELETE" });
}

export async function testServerConnection(id) {
  return fetchJSON(`/admin/servers/${id}/test-connection`, { method: "POST" });
}

export async function testConfigConnection(payload) {
  return fetchJSON("/admin/servers/test-connection", { method: "POST", body: JSON.stringify(payload) });
}

export async function activateServer(id) {
  return fetchJSON(`/admin/servers/${id}/activate`, { method: "POST" });
}

export async function importStudents(file) {
  const formData = new FormData();
  formData.append("file", file);

  let token = localStorage.getItem("access_token");
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}/students/import`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    let errorMsg = `API Error ${res.status}`;
    try {
      const errorData = await res.json();
      if (errorData.detail) errorMsg = errorData.detail;
      else if (errorData.message) errorMsg = errorData.message;
    } catch (e) {}
    throw new Error(errorMsg);
  }
  return res.json();
}

export async function upgradeSchoolYear() {
  return fetchJSON("/admin/upgrade-school-year", { method: "POST" });
}

export async function undoUpgradeSchoolYear() {
  return fetchJSON("/admin/undo-upgrade-school-year", { method: "POST" });
}

export async function listGvcn() {
  return fetchJSON("/admin/gvcn");
}

export async function saveGvcn(payload) {
  return fetchJSON("/admin/gvcn", { method: "POST", body: JSON.stringify(payload) });
}

export async function deleteGvcn(id) {
  return fetchJSON(`/admin/gvcn/${id}`, { method: "DELETE" });
}

