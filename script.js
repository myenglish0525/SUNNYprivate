
const studentsData = [
  {
    username: "student1",
    classCode: "CLASSA",
    expiry: "2025-12-31",
    tasks: [
      { name: "單元 1：基本介紹", completed: false, score: null },
      { name: "單元 2：家庭成員", completed: false, score: null }
    ]
  },
  {
    username: "student2",
    classCode: "CLASSB",
    expiry: "2025-12-31",
    tasks: [
      { name: "單元 3：學校生活", completed: false, score: null }
    ]
  }
];

function initLogin(enableLogging = false) {
  const form = document.getElementById("loginForm");
  const error = document.getElementById("loginError");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const classCode = document.getElementById("classCode").value.trim();
    const expiry = document.getElementById("expiryDate").value;

    const user = studentsData.find(s => s.username === username && s.classCode === classCode);
    if (!user) return error.textContent = "帳號或班級代碼錯誤";
    if (user.expiry !== expiry) return error.textContent = "到期日不正確";

    const today = new Date();
    const expDate = new Date(expiry);
    if (today > expDate) return error.textContent = "帳號已到期";

    const userData = { ...user, loginTime: new Date().toLocaleString() };
    localStorage.setItem("loggedInUser", JSON.stringify(userData));

    if (enableLogging) {
      let logs = JSON.parse(localStorage.getItem("loginLogs") || "[]");
      logs.push({ username, classCode, loginTime: new Date().toLocaleString() });
      localStorage.setItem("loginLogs", JSON.stringify(logs));
    }

    window.location.href = "dashboard.html";
  });
}

function initDashboard() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) return window.location.href = "index.html";

  document.getElementById("studentName").textContent = user.username;

  const taskList = document.getElementById("taskList");
  let html = "<ul>";
  user.tasks.forEach((task, i) => {
    const status = task.completed ? `✅ 已完成（${task.score}分）` : "❗ 未完成";
    html += `<li>${task.name} - ${status} 
      <a href="unit.html?unit=${i}">前往</a></li>`;
  });
  html += "</ul>";
  taskList.innerHTML = html;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
  });
}

function initUnit() {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!user) return window.location.href = "index.html";

  const params = new URLSearchParams(window.location.search);
  const index = parseInt(params.get("unit"), 10);
  const task = user.tasks[index];
  document.getElementById("unitTitle").textContent = task.name;

  const submitBtn = document.getElementById("submitBtn");
  const result = document.getElementById("resultMessage");

  if (task.completed) {
    result.textContent = `您已完成，得分：${task.score}`;
    document.getElementById("practiceContent").style.display = "none";
    return;
  }

  submitBtn.addEventListener("click", () => {
    const score = Math.floor(Math.random() * 41) + 60;
    task.completed = true;
    task.score = score;

    if (!user.logs) user.logs = [];
    user.logs.push({ unit: task.name, completeTime: new Date().toLocaleString() });
    localStorage.setItem("loggedInUser", JSON.stringify(user));

    result.textContent = `✅ 完成此單元，得分 ${score} 分`;
    submitBtn.disabled = true;
  });
}
