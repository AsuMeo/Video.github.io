// ============================================
// AUTH.JSX — ВХОД И РЕГИСТРАЦИЯ (ОТДЕЛЬНЫЙ ФАЙЛ)
// ============================================

const { useState, useEffect } = React;

// Конфиг Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBm0mIvHVznIeF2PoFk6dtdaiT5r877wyA",
  authDomain: "meow-874ce.firebaseapp.com",
  databaseURL: "https://meow-874ce-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "meow-874ce",
  storageBucket: "meow-874ce.firebasestorage.app",
  messagingSenderId: "471541334599",
  appId: "1:471541334599:web:567af3e7dbe70a37572762"
};

// Инициализация Firebase (только если ещё не инициализирован)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const database = firebase.database();

// ============================================
// КОМПОНЕНТ ЛОГОВ (подробные сообщения)
// ============================================
function LogPanel({ logs }) {
  return (
    <div className="log-panel">
      <h3>📋 ЛОГИ СИСТЕМЫ</h3>
      <div className="log-list">
        {logs.length === 0 && <p className="log-empty">Логи пусты. Начните действие...</p>}
        {logs.map((log, i) => (
          <div key={i} className={`log-item log-${log.type}`}>
            <span className="log-time">[{log.time}]</span>
            <span className="log-icon">{log.icon}</span>
            <span className="log-text">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// КОМПОНЕНТ АВТОРИЗАЦИИ
// ============================================
function Auth({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' или 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  // Функция добавления лога
  const addLog = (type, icon, message) => {
    const time = new Date().toLocaleTimeString('ru-RU');
    setLogs(prev => [...prev, { type, icon, message, time }]);
  };

  // Очистка логов
  const clearLogs = () => setLogs([]);

  // ============================================
  // РЕГИСТРАЦИЯ
  // ============================================
  const handleRegister = async (e) => {
    e.preventDefault();
    clearLogs();
    setLoading(true);

    addLog('info', '📤', 'Нажата кнопка "Регистрация"');
    addLog('info', '📧', `Email для регистрации: ${email}`);
    addLog('info', '👤', `Имя пользователя: ${username || '(не указано)'}`);

    // Валидация
    if (!email || !password) {
      addLog('error', '❌', 'ОШИБКА: Email и пароль обязательны!');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      addLog('error', '❌', 'ОШИБКА: Пароль должен быть минимум 6 символов!');
      setLoading(false);
      return;
    }
    if (!username.trim()) {
      addLog('error', '❌', 'ОШИБКА: Имя пользователя обязательно!');
      setLoading(false);
      return;
    }

    addLog('info', '🔐', 'Отправка запроса регистрации в Firebase Auth...');

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      addLog('success', '✅', `Регистрация в Firebase Auth УСПЕШНА! UID: ${user.uid}`);
      addLog('info', '📧', `Отправка письма подтверждения на ${email}...`);

      await user.sendEmailVerification();
      addLog('success', '✉️', 'Письмо подтверждения отправлено! Проверьте почту.');

      // Сохраняем пользователя в Realtime Database
      addLog('info', '💾', 'Сохранение данных пользователя в Realtime Database...');
      await database.ref('users/' + user.uid).set({
        username: username,
        email: email,
        createdAt: new Date().toISOString(),
        online: true
      });
      addLog('success', '💾', 'Данные пользователя сохранены в БД!');

      addLog('success', '🎉', 'РЕГИСТРАЦИЯ ПОЛНОСТЬЮ ЗАВЕРШЕНА!');

      // Автоматический вход
      addLog('info', '🚪', 'Автоматический вход в сессию...');
      onLogin(user);
      addLog('success', '🔓', 'ВХОД В СЕССИЮ УСПЕШНО! Добро пожаловать, ' + username + '!');

    } catch (error) {
      let errorMsg = '';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMsg = 'Этот email уже зарегистрирован!';
          break;
        case 'auth/invalid-email':
          errorMsg = 'Некорректный формат email!';
          break;
        case 'auth/weak-password':
          errorMsg = 'Слишком слабый пароль!';
          break;
        case 'auth/network-request-failed':
          errorMsg = 'Нет подключения к интернету!';
          break;
        default:
          errorMsg = error.message;
      }
      addLog('error', '❌', `ОШИБКА РЕГИСТРАЦИИ [${error.code}]: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ВХОД
  // ============================================
  const handleLogin = async (e) => {
    e.preventDefault();
    clearLogs();
    setLoading(true);

    addLog('info', '📤', 'Нажата кнопка "Вход"');
    addLog('info', '📧', `Попытка входа с email: ${email}`);

    if (!email || !password) {
      addLog('error', '❌', 'ОШИБКА: Введите email и пароль!');
      setLoading(false);
      return;
    }

    addLog('info', '🔐', 'Отправка запроса входа в Firebase Auth...');

    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      addLog('success', '✅', `Аутентификация Firebase УСПЕШНА! UID: ${user.uid}`);

      // Проверка верификации email
      if (!user.emailVerified) {
        addLog('warning', '⚠️', 'ВНИМАНИЕ: Email не подтверждён!');
        addLog('info', '📧', 'Письмо подтверждения отправлено повторно.');
        await user.sendEmailVerification();
      } else {
        addLog('success', '✉️', 'Email подтверждён!');
      }

      // Обновляем статус online
      addLog('info', '💾', 'Обновление статуса в Realtime Database...');
      await database.ref('users/' + user.uid).update({
        online: true,
        lastLogin: new Date().toISOString()
      });
      addLog('success', '💾', 'Статус обновлён в БД!');

      addLog('success', '🔓', `ВХОД В СЕССИЮ УСПЕШНО! Добро пожаловать!`);

      onLogin(user);

    } catch (error) {
      let errorMsg = '';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMsg = 'Пользователь с таким email не найден!';
          break;
        case 'auth/wrong-password':
          errorMsg = 'Неверный пароль!';
          break;
        case 'auth/invalid-email':
          errorMsg = 'Некорректный формат email!';
          break;
        case 'auth/too-many-requests':
          errorMsg = 'Слишком много попыток. Попробуйте позже.';
          break;
        case 'auth/network-request-failed':
          errorMsg = 'Нет подключения к интернету!';
          break;
        default:
          errorMsg = error.message;
      }
      addLog('error', '❌', `ОШИБКА ВХОДА [${error.code}]: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // ВЫХОД
  // ============================================
  const handleLogout = async () => {
    clearLogs();
    addLog('info', '🚪', 'Нажата кнопка "Выход"');

    const user = auth.currentUser;
    if (user) {
      addLog('info', '💾', 'Обновление статуса offline в БД...');
      await database.ref('users/' + user.uid).update({ online: false });
      addLog('success', '💾', 'Статус обновлён на offline');
    }

    await auth.signOut();
    addLog('success', '👋', 'ВЫХОД ИЗ СЕССИИ УСПЕШЕН!');
    onLogin(null);
  };

  // ============================================
  // СБРОС ПАРОЛЯ
  // ============================================
  const handleResetPassword = async () => {
    clearLogs();
    if (!email) {
      addLog('error', '❌', 'Введите email для сброса пароля!');
      return;
    }

    addLog('info', '🔑', `Отправка запроса сброса пароля на ${email}...`);
    try {
      await auth.sendPasswordResetEmail(email);
      addLog('success', '✉️', 'Письмо для сброса пароля отправлено! Проверьте почту.');
    } catch (error) {
      addLog('error', '❌', `ОШИБКА СБРОСА: ${error.message}`);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1>🐱 Meow Messenger</h1>

        <div className="auth-tabs">
          <button 
            className={mode === 'login' ? 'active' : ''}
            onClick={() => { setMode('login'); clearLogs(); }}
          >
            🔐 Вход
          </button>
          <button 
            className={mode === 'register' ? 'active' : ''}
            onClick={() => { setMode('register'); clearLogs(); }}
          >
            📝 Регистрация
          </button>
        </div>

        <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
          {mode === 'register' && (
            <div className="input-group">
              <label>👤 Имя пользователя</label>
              <input
                type="text"
                placeholder="Введите имя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          )}

          <div className="input-group">
            <label>📧 Email</label>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>🔑 Пароль</label>
            <input
              type="password"
              placeholder="Минимум 6 символов"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? '⏳ Загрузка...' : (mode === 'login' ? '🔓 Войти' : '📝 Зарегистрироваться')}
          </button>
        </form>

        {mode === 'login' && (
          <button className="reset-btn" onClick={handleResetPassword}>
            🔑 Забыли пароль?
          </button>
        )}
      </div>

      {/* ПАНЕЛЬ ЛОГОВ */}
      <LogPanel logs={logs} />
    </div>
  );
}
