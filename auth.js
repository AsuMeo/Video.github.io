// ========================
// MEOW MESSENGER - Auth Module
// Логи каждого шага в консоль и на экран
// ========================

console.log("[AUTH] Инициализация auth.js...");

const log = (type, message, data = null) => {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = `[${timestamp}] [${type.toUpperCase()}]`;
  const fullMsg = data ? `${prefix} ${message}` : `${prefix} ${message}`;

  console.log(fullMsg, data || "");

  const logBox = document.getElementById("logBox");
  if (logBox) {
    logBox.classList.add("show", type);
    const entry = document.createElement("div");
    entry.textContent = fullMsg;
    logBox.appendChild(entry);
    logBox.scrollTop = logBox.scrollHeight;
  }
};

// Проверка авторизации при загрузке
console.log("[AUTH] Проверка текущего пользователя...");
auth.onAuthStateChanged((user) => {
  if (user) {
    log("info", "Пользователь уже авторизован:", user.email);
    window.location.href = "index.html";
  } else {
    log("info", "Пользователь не авторизован, показываем форму входа");
  }
});

// Переключение табов
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

if (loginTab && registerTab) {
  loginTab.addEventListener("click", () => {
    log("info", "Переключение на вкладку Вход");
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
    loginForm.classList.add("active");
    registerForm.classList.remove("active");
  });

  registerTab.addEventListener("click", () => {
    log("info", "Переключение на вкладку Регистрация");
    registerTab.classList.add("active");
    loginTab.classList.remove("active");
    registerForm.classList.add("active");
    loginForm.classList.remove("active");
  });
}

// Предпросмотр аватарки
const avatarInput = document.getElementById("avatarInput");
const avatarPreview = document.getElementById("avatarPreview");

if (avatarInput) {
  avatarInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      log("info", "Выбран файл аватарки:", file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        avatarPreview.src = event.target.result;
        log("success", "Аватарка загружена в предпросмотр");
      };
      reader.readAsDataURL(file);
    }
  });
}

// РЕГИСТРАЦИЯ
const registerBtn = document.getElementById("registerBtn");
if (registerBtn) {
  registerBtn.addEventListener("click", async () => {
    log("info", "=== НАЧАЛО РЕГИСТРАЦИИ ===");

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const file = avatarInput?.files[0];

    log("info", "Проверка данных...");

    if (!name || !email || !password) {
      log("error", "Ошибка: Заполните все поля!");
      return;
    }
    if (password.length < 6) {
      log("error", "Ошибка: Пароль минимум 6 символов!");
      return;
    }

    log("info", "Данные валидны, создаём пользователя...");
    registerBtn.disabled = true;
    registerBtn.textContent = "Регистрация...";

    try {
      log("info", "Отправка запроса в Firebase Auth...");
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      log("success", "Пользователь создан в Firebase Auth! UID:", user.uid);

      let avatarUrl = "";

      // Загрузка аватарки
      if (file) {
        log("info", "Загрузка аватарки в Storage...");
        const storageRef = storage.ref(`avatars/${user.uid}`);
        await storageRef.put(file);
        avatarUrl = await storageRef.getDownloadURL();
        log("success", "Аватарка загружена! URL получен");
      } else {
        log("info", "Аватарка не выбрана, используем пустую");
      }

      // Сохранение данных пользователя в Realtime Database
      log("info", "Сохранение данных в Realtime Database...");
      await database.ref(`users/${user.uid}`).set({
        uid: user.uid,
        name: name,
        email: email,
        avatar: avatarUrl,
        online: true,
        lastSeen: Date.now(),
        createdAt: Date.now()
      });
      log("success", "Данные сохранены в БД!");

      // Создаём пустой список чатов
      log("info", "Создание списка чатов...");
      await database.ref(`userChats/${user.uid}`).set({});
      log("success", "Список чатов создан!");

      log("success", "=== РЕГИСТРАЦИЯ УСПЕШНА ===");
      showToast("Регистрация успешна!");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);

    } catch (error) {
      log("error", "Ошибка регистрации:", error.message);
      registerBtn.disabled = false;
      registerBtn.textContent = "Зарегистрироваться";
    }
  });
}

// ВХОД
const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    log("info", "=== НАЧАЛО ВХОДА ===");

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
      log("error", "Ошибка: Введите email и пароль!");
      return;
    }

    log("info", "Отправка запроса авторизации...");
    loginBtn.disabled = true;
    loginBtn.textContent = "Вход...";

    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      log("success", "Вход успешен! UID:", user.uid);

      // Обновляем статус онлайн
      log("info", "Обновление статуса онлайн...");
      await database.ref(`users/${user.uid}`).update({
        online: true,
        lastSeen: Date.now()
      });
      log("success", "Статус обновлён!");

      showToast("Вход выполнен!");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 500);

    } catch (error) {
      log("error", "Ошибка входа:", error.message);
      loginBtn.disabled = false;
      loginBtn.textContent = "Войти";
    }
  });
}

// Toast уведомление
function showToast(message) {
  const toast = document.getElementById("toast");
  if (toast) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
  }
}

console.log("[AUTH] auth.js полностью загружен");
