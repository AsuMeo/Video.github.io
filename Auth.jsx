// ============================================
// AUTH.JSX — ВХОД И РЕГИСТРАЦИЯ (ОТДЕЛЬНЫЙ ФАЙЛ)
// ============================================

const { useState, useEffect } = React;
const { motion, AnimatePresence } = window.Motion;

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

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const database = firebase.database();

// ============================================
// SVG ИКОНКИ (React Icons через CDN)
// ============================================
const Icons = {
  Mail: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  ),
  Lock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Eye: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  EyeOff: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.78 0 1.53-.09 2.24-.26"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  LogIn: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
    </svg>
  ),
  UserPlus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
    </svg>
  ),
  Key: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  AlertCircle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  Info: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  Loader: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin">
      <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
      <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
    </svg>
  )
};

// ============================================
// КОМПОНЕНТ ЛОГОВ (анимированный)
// ============================================
function LogPanel({ logs, onClear }) {
  return (
    <motion.div 
      className="log-panel"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="log-header">
        <h3><Icons.Info /> ЛОГИ СИСТЕМЫ</h3>
        <button className="clear-logs" onClick={onClear} title="Очистить">
          <Icons.X />
        </button>
      </div>
      <div className="log-list">
        <AnimatePresence>
          {logs.length === 0 && (
            <motion.p 
              className="log-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Логи пусты. Начните действие...
            </motion.p>
          )}
          {logs.map((log, i) => (
            <motion.div 
              key={i} 
              className={`log-item log-${log.type}`}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="log-time">{log.time}</span>
              <span className="log-icon">{log.icon}</span>
              <span className="log-text">{log.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ============================================
// КОМПОНЕНТ АВАТАРА (генерация цвета по имени)
// ============================================
function Avatar({ name, size = 45, online = false }) {
  const colors = [
    '#e94560', '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3',
    '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43', '#10ac84',
    '#ee5a24', '#009432', '#0652dd', '#9980fa', '#833471'
  ];

  const getColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const initial = name ? name[0].toUpperCase() : '?';
  const bgColor = getColor(name || '?');

  return (
    <div className="avatar-wrapper" style={{ width: size, height: size }}>
      <div 
        className="avatar"
        style={{ 
          width: size, 
          height: size, 
          background: `linear-gradient(135deg, ${bgColor}, ${bgColor}dd)`,
          fontSize: size * 0.4
        }}
      >
        {initial}
      </div>
      {online && <div className="avatar-online-badge" />}
    </div>
  );
}

// ============================================
// КОМПОНЕНТ ПРОВЕРКИ УНИКАЛЬНОСТИ ЮЗЕРНЕЙМА
// ============================================
function UsernameCheck({ username, onAvailableChange }) {
  const [status, setStatus] = useState('empty'); // empty, checking, available, taken, invalid

  useEffect(() => {
    if (!username || username.length < 3) {
      setStatus('empty');
      onAvailableChange(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setStatus('invalid');
      onAvailableChange(false);
      return;
    }

    setStatus('checking');
    onAvailableChange(false);

    const timer = setTimeout(async () => {
      try {
        const snapshot = await database.ref('usernames/' + username.toLowerCase()).once('value');
        if (snapshot.exists()) {
          setStatus('taken');
          onAvailableChange(false);
        } else {
          setStatus('available');
          onAvailableChange(true);
        }
      } catch (e) {
        setStatus('empty');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const statusConfig = {
    empty: { text: 'Минимум 3 символа, только буквы, цифры и _', color: '#666', icon: null },
    checking: { text: 'Проверка...', color: '#f39c12', icon: <Icons.Loader /> },
    available: { text: '✅ Юзернейм свободен!', color: '#2ecc71', icon: <Icons.Check /> },
    taken: { text: '❌ Юзернейм занят', color: '#e74c3c', icon: <Icons.X /> },
    invalid: { text: '❌ Только a-z, 0-9, _', color: '#e74c3c', icon: <Icons.AlertCircle /> }
  };

  const config = statusConfig[status];

  return (
    <motion.div 
      className="username-status"
      animate={{ color: config.color }}
      transition={{ duration: 0.3 }}
    >
      {config.icon && <span className="status-icon">{config.icon}</span>}
      {config.text}
    </motion.div>
  );
}

// ============================================
// ГЛАВНЫЙ КОМПОНЕНТ АВТОРИЗАЦИИ
// ============================================
function Auth({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [usernameAvailable, setUsernameAvailable] = useState(false);

  const addLog = (type, icon, message) => {
    const time = new Date().toLocaleTimeString('ru-RU');
    setLogs(prev => [{ type, icon, message, time, id: Date.now() + Math.random() }, ...prev]);
  };

  const clearLogs = () => setLogs([]);

  // ============================================
  // РЕГИСТРАЦИЯ
  // ============================================
  const handleRegister = async (e) => {
    e.preventDefault();
    clearLogs();
    setLoading(true);

    addLog('info', '📤', 'Нажата кнопка "Регистрация"');
    addLog('info', '📧', `Email: ${email}`);
    addLog('info', '👤', `Юзернейм: @${username}`);

    if (!email || !password || !username) {
      addLog('error', '❌', 'Все поля обязательны!');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      addLog('error', '❌', 'Пароль минимум 6 символов!');
      setLoading(false);
      return;
    }
    if (!usernameAvailable) {
      addLog('error', '❌', 'Юзернейм недоступен!');
      setLoading(false);
      return;
    }

    addLog('info', '🔐', 'Отправка запроса в Firebase Auth...');

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      addLog('success', '✅', `Регистрация УСПЕШНА! UID: ${user.uid.slice(0, 8)}...`);

      addLog('info', '📧', 'Отправка письма подтверждения...');
      await user.sendEmailVerification();
      addLog('success', '✉️', 'Письмо подтверждения отправлено!');

      // Сохраняем в БД
      addLog('info', '💾', 'Сохранение в Realtime Database...');
      await Promise.all([
        database.ref('users/' + user.uid).set({
          username: username,
          email: email,
          usernameLower: username.toLowerCase(),
          createdAt: new Date().toISOString(),
          online: true,
          avatar: null
        }),
        database.ref('usernames/' + username.toLowerCase()).set(user.uid)
      ]);
      addLog('success', '💾', 'Данные сохранены! Юзернейм зарезервирован.');

      addLog('success', '🎉', 'РЕГИСТРАЦИЯ ЗАВЕРШЕНА!');

      addLog('info', '🚪', 'Автоматический вход...');
      onLogin(user);
      addLog('success', '🔓', 'ВХОД В СЕССИЮ УСПЕШНО!');

    } catch (error) {
      const errors = {
        'auth/email-already-in-use': 'Этот email уже зарегистрирован!',
        'auth/invalid-email': 'Некорректный формат email!',
        'auth/weak-password': 'Слишком слабый пароль!',
        'auth/network-request-failed': 'Нет подключения к интернету!'
      };
      addLog('error', '❌', `ОШИБКА [${error.code}]: ${errors[error.code] || error.message}`);
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
    addLog('info', '📧', `Попытка входа: ${email}`);

    if (!email || !password) {
      addLog('error', '❌', 'Введите email и пароль!');
      setLoading(false);
      return;
    }

    addLog('info', '🔐', 'Аутентификация в Firebase...');

    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      addLog('success', '✅', `Аутентификация УСПЕШНА! UID: ${user.uid.slice(0, 8)}...`);

      if (!user.emailVerified) {
        addLog('warning', '⚠️', 'Email не подтверждён! Письмо отправлено повторно.');
        await user.sendEmailVerification();
      } else {
        addLog('success', '✉️', 'Email подтверждён!');
      }

      addLog('info', '💾', 'Обновление статуса online...');
      await database.ref('users/' + user.uid).update({
        online: true,
        lastLogin: new Date().toISOString()
      });
      addLog('success', '💾', 'Статус обновлён!');

      addLog('success', '🔓', 'ВХОД В СЕССИЮ УСПЕШНО!');
      onLogin(user);

    } catch (error) {
      const errors = {
        'auth/user-not-found': 'Пользователь не найден!',
        'auth/wrong-password': 'Неверный пароль!',
        'auth/invalid-email': 'Некорректный email!',
        'auth/too-many-requests': 'Слишком много попыток!',
        'auth/network-request-failed': 'Нет интернета!'
      };
      addLog('error', '❌', `ОШИБКА [${error.code}]: ${errors[error.code] || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Сброс пароля
  const handleResetPassword = async () => {
    clearLogs();
    if (!email) {
      addLog('error', '❌', 'Введите email для сброса!');
      return;
    }
    addLog('info', '🔑', `Сброс пароля для ${email}...`);
    try {
      await auth.sendPasswordResetEmail(email);
      addLog('success', '✉️', 'Письмо для сброса отправлено!');
    } catch (error) {
      addLog('error', '❌', `ОШИБКА: ${error.message}`);
    }
  };

  return (
    <div className="auth-page">
      {/* Фоновые элементы */}
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />
      <div className="bg-blob blob-3" />

      <motion.div 
        className="auth-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className="auth-box"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="auth-logo">
            <motion.div 
              className="logo-icon"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              🐱
            </motion.div>
            <h1>VK Meow</h1>
            <p>Мессенджер нового поколения</p>
          </div>

          <div className="auth-tabs">
            <motion.button 
              className={mode === 'login' ? 'active' : ''}
              onClick={() => { setMode('login'); clearLogs(); }}
              whileTap={{ scale: 0.95 }}
            >
              <Icons.LogIn /> Вход
            </motion.button>
            <motion.button 
              className={mode === 'register' ? 'active' : ''}
              onClick={() => { setMode('register'); clearLogs(); }}
              whileTap={{ scale: 0.95 }}
            >
              <Icons.UserPlus /> Регистрация
            </motion.button>
          </div>

          <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div
                  key="username"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="input-group">
                    <label><Icons.User /> Юзернейм (уникальный)</label>
                    <div className="input-wrapper">
                      <span className="input-prefix">@</span>
                      <input
                        type="text"
                        placeholder="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="off"
                      />
                    </div>
                    <UsernameCheck username={username} onAvailableChange={setUsernameAvailable} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="input-group">
              <label><Icons.Mail /> Email</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="input-group">
              <label><Icons.Lock /> Пароль</label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Минимум 6 символов"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                </button>
              </div>
            </div>

            <motion.button 
              type="submit" 
              className="auth-btn" 
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <><Icons.Loader /> Обработка...</>
              ) : mode === 'login' ? (
                <><Icons.LogIn /> Войти</>
              ) : (
                <><Icons.UserPlus /> Создать аккаунт</>
              )}
            </motion.button>
          </form>

          {mode === 'login' && (
            <motion.button 
              className="reset-btn" 
              onClick={handleResetPassword}
              whileHover={{ scale: 1.02 }}
            >
              <Icons.Key /> Забыли пароль?
            </motion.button>
          )}
        </motion.div>

        <LogPanel logs={logs} onClear={clearLogs} />
      </motion.div>
    </div>
  );
}
