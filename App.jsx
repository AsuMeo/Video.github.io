// ============================================
// APP.JSX — ФУНКЦИОНАЛ МЕССЕНДЖЕРА (ОСНОВНОЙ)
// ============================================

const { useState, useEffect, useRef } = React;
const { motion, AnimatePresence } = window.Motion;

// ============================================
// SVG ИКОНКИ
// ============================================
const Icons = {
  ArrowLeft: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6"/>
    </svg>
  ),
  Search: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  ),
  Phone: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  MoreVertical: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>
    </svg>
  ),
  Send: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>
    </svg>
  ),
  Paperclip: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
    </svg>
  ),
  Mic: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/><rect x="9" y="1" width="6" height="13" rx="3"/>
    </svg>
  ),
  Smile: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
    </svg>
  ),
  Pin: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
    </svg>
  ),
  X: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Check: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  DoubleCheck: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/><polyline points="20 6 9 17 4 12" transform="translate(4, 0)"/>
    </svg>
  ),
  MessageCircle: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
    </svg>
  ),
  Users: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  Settings: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  User: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  LogOut: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Cloud: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.5 19c0-1.7-1.3-3-3-3h-11a3 3 0 0 1-3-3 3 3 0 0 1 3-3h.5"/><path d="M17.5 19a3 3 0 0 0 3-3c0-1.4-1-2.6-2.4-2.9"/><path d="M17.5 19a3 3 0 0 1 3-3c0-1.4-1-2.6-2.4-2.9"/><path d="M6.5 13a3 3 0 0 1 3-3h.5"/><path d="M6.5 13a3 3 0 0 0 3-3c0-1.4-1-2.6-2.4-2.9"/>
    </svg>
  ),
  ExternalLink: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  ),
  Loader: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin">
      <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
      <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
    </svg>
  ),
  Pencil: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
    </svg>
  )
};

// ============================================
// АВАТАР (генерация цвета по имени)
// ============================================
function Avatar({ name, size = 45, online = false, showStatus = true }) {
  const colors = [
    '#e94560', '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3',
    '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43', '#10ac84',
    '#ee5a24', '#009432', '#0652dd', '#9980fa', '#833471',
    '#e84393', '#00b894', '#0984e3', '#6c5ce7', '#fd79a8'
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
      <motion.div 
        className="avatar"
        style={{ 
          width: size, 
          height: size, 
          background: `linear-gradient(135deg, ${bgColor}, ${bgColor}dd)`,
          fontSize: size * 0.4
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {initial}
      </motion.div>
      {showStatus && online && (
        <motion.div 
          className="avatar-online-badge"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </div>
  );
}

// ============================================
// ИНДИКАТОР "ПЕЧАТАЕТ"
// ============================================
function TypingIndicator() {
  return (
    <motion.div 
      className="typing-indicator"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
    >
      <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
    </motion.div>
  );
}

// ============================================
// ГЛАВНЫЙ КОМПОНЕНТ
// ============================================
function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('chats');
  const [showMenu, setShowMenu] = useState(false);
  const [pinnedMessage, setPinnedMessage] = useState(null);
  const [typingUsers, setTypingUsers] = useState({});
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const addLog = (type, icon, message) => {
    const time = new Date().toLocaleTimeString('ru-RU');
    setLogs(prev => [{ type, icon, message, time, id: Date.now() + Math.random() }, ...prev].slice(0, 50));
  };

  // ============================================
  // АВТОРИЗАЦИЯ
  // ============================================
  useEffect(() => {
    addLog('info', '🚀', 'Приложение запущено. Ожидание авторизации...');

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        addLog('success', '✅', `Авторизован: ${firebaseUser.email}`);
        setUser(firebaseUser);

        const snapshot = await database.ref('users/' + firebaseUser.uid).once('value');
        const data = snapshot.val();
        setUserData(data);
        addLog('success', '💾', `Данные загружены: @${data?.username || 'unknown'}`);
      } else {
        addLog('info', '👋', 'Не авторизован');
        setUser(null);
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // ============================================
  // ЗАГРУЗКА ПОЛЬЗОВАТЕЛЕЙ (Realtime)
  // ============================================
  useEffect(() => {
    if (!user) return;

    addLog('info', '👥', 'Подписка на пользователей...');

    const usersRef = database.ref('users');
    usersRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersList = Object.entries(data)
          .map(([uid, info]) => ({ uid, ...info }))
          .filter(u => u.uid !== user.uid);
        setUsers(usersList);
      }
    });

    return () => usersRef.off();
  }, [user]);

  // ============================================
  // ЗАГРУЗКА СООБЩЕНИЙ (Realtime)
  // ============================================
  useEffect(() => {
    if (!user || !selectedChat) return;

    const chatId = [user.uid, selectedChat.uid].sort().join('_');
    addLog('info', '💬', `Открыт чат с: ${selectedChat.username}`);

    const messagesRef = database.ref('messages/' + chatId);
    messagesRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgs = Object.entries(data)
          .map(([key, val]) => ({ id: key, ...val }))
          .sort((a, b) => a.timestamp - b.timestamp);
        setMessages(msgs);

        // Проверяем закреплённое сообщение
        const pinned = msgs.find(m => m.pinned);
        setPinnedMessage(pinned || null);
      } else {
        setMessages([]);
        setPinnedMessage(null);
      }
    });

    return () => messagesRef.off();
  }, [user, selectedChat]);

  // ============================================
  // ОТСЛЕЖИВАНИЕ "ПЕЧАТАЕТ"
  // ============================================
  useEffect(() => {
    if (!user || !selectedChat) return;

    const chatId = [user.uid, selectedChat.uid].sort().join('_');
    const typingRef = database.ref('typing/' + chatId + '/' + selectedChat.uid);

    typingRef.on('value', (snapshot) => {
      setTypingUsers(prev => ({ ...prev, [selectedChat.uid]: snapshot.val() }));
    });

    return () => typingRef.off();
  }, [user, selectedChat]);

  // Автоскролл
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // ============================================
  // ОТПРАВКА СООБЩЕНИЯ
  // ============================================
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const chatId = [user.uid, selectedChat.uid].sort().join('_');
    const messageData = {
      text: newMessage.trim(),
      sender: user.uid,
      senderName: userData?.username || 'Unknown',
      senderAvatar: userData?.username || '?',
      timestamp: Date.now(),
      read: false,
      pinned: false
    };

    addLog('info', '📤', `Отправка: "${newMessage.trim().substring(0, 30)}..."`);

    try {
      await database.ref('messages/' + chatId).push(messageData);
      addLog('success', '✅', 'Сообщение отправлено!');
      setNewMessage('');
      inputRef.current?.focus();
    } catch (error) {
      addLog('error', '❌', `Ошибка: ${error.message}`);
    }
  };

  // ============================================
  // ОТМЕТКА ПРОЧИТАННО
  // ============================================
  useEffect(() => {
    if (!user || !selectedChat || messages.length === 0) return;

    const chatId = [user.uid, selectedChat.uid].sort().join('_');
    const unreadMessages = messages.filter(m => m.sender !== user.uid && !m.read);

    unreadMessages.forEach(msg => {
      database.ref('messages/' + chatId + '/' + msg.id).update({ read: true });
    });
  }, [messages, user, selectedChat]);

  // ============================================
  // ЗАКРЕПИТЬ СООБЩЕНИЕ
  // ============================================
  const pinMessage = async (msgId) => {
    if (!selectedChat || !user) return;
    const chatId = [user.uid, selectedChat.uid].sort().join('_');

    // Сначала открепляем все
    const updates = {};
    messages.forEach(m => {
      if (m.pinned) updates['messages/' + chatId + '/' + m.id + '/pinned'] = false;
    });

    // Закрепляем новое
    updates['messages/' + chatId + '/' + msgId + '/pinned'] = true;

    await database.ref().update(updates);
    addLog('info', '📌', 'Сообщение закреплено!');
  };

  // ============================================
  // ВЫХОД
  // ============================================
  const handleLogout = async () => {
    addLog('info', '🚪', 'Запрос на выход...');

    if (user) {
      await database.ref('users/' + user.uid).update({ online: false });
      addLog('success', '💾', 'Статус: offline');
    }

    await auth.signOut();
    addLog('success', '👋', 'ВЫХОД УСПЕШЕН!');
    setUser(null);
    setSelectedChat(null);
    setMessages([]);
    setShowMobileChat(false);
  };

  // Фильтр
  const filteredUsers = users.filter(u => 
    (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Последнее сообщение для списка чатов
  const getLastMessage = (chatUser) => {
    const chatId = user && chatUser ? [user.uid, chatUser.uid].sort().join('_') : '';
    // Это упрощённо — в реальном приложении нужно кэшировать
    return null;
  };

  // ============================================
  // РЕНДЕР: Не авторизован
  // ============================================
  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  // ============================================
  // РЕНДЕР: МЕССЕНДЖЕР
  // ============================================
  return (
    <div className="messenger-app">
      {/* МОБИЛЬНАЯ НАВИГАЦИЯ (снизу) */}
      <nav className="mobile-nav">
        <motion.button 
          className={activeTab === 'chats' ? 'active' : ''}
          onClick={() => setActiveTab('chats')}
          whileTap={{ scale: 0.9 }}
        >
          <Icons.MessageCircle />
          <span>Чаты</span>
          {users.some(u => u.online) && <div className="nav-badge" />}
        </motion.button>
        <motion.button 
          className={activeTab === 'contacts' ? 'active' : ''}
          onClick={() => setActiveTab('contacts')}
          whileTap={{ scale: 0.9 }}
        >
          <Icons.Users />
          <span>Контакты</span>
        </motion.button>
        <motion.button 
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
          whileTap={{ scale: 0.9 }}
        >
          <Icons.Settings />
          <span>Настройки</span>
        </motion.button>
        <motion.button 
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
          whileTap={{ scale: 0.9 }}
        >
          <Avatar name={userData?.username || '?'} size={28} showStatus={false} />
          <span>Профиль</span>
        </motion.button>
      </nav>

      {/* ДЕСКТОПНАЯ НАВИГАЦИЯ (слева) */}
      <aside className="desktop-sidebar">
        <div className="sidebar-logo">
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🐱
          </motion.span>
        </div>

        <div className="sidebar-nav">
          <motion.button 
            className={activeTab === 'chats' ? 'active' : ''}
            onClick={() => { setActiveTab('chats'); setSelectedChat(null); }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Чаты"
          >
            <Icons.MessageCircle />
          </motion.button>
          <motion.button 
            className={activeTab === 'contacts' ? 'active' : ''}
            onClick={() => setActiveTab('contacts')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Контакты"
          >
            <Icons.Users />
          </motion.button>
          <motion.button 
            className={activeTab === 'settings' ? 'active' : ''}
            onClick={() => setActiveTab('settings')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Настройки"
          >
            <Icons.Settings />
          </motion.button>
        </div>

        <div className="sidebar-bottom">
          <motion.button 
            onClick={handleLogout}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Выйти"
          >
            <Icons.LogOut />
          </motion.button>
        </div>
      </aside>

      {/* ОСНОВНОЕ СОДЕРЖИМОЕ */}
      <main className="main-content">
        {/* СПИСОК ЧАТОВ */}
        <AnimatePresence>
          {(activeTab === 'chats' || activeTab === 'contacts') && !showMobileChat && (
            <motion.aside 
              className="chat-list-panel"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="chat-list-header">
                <h2>{activeTab === 'chats' ? 'Чаты' : 'Контакты'}</h2>
                <div className="header-actions">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Icons.Cloud />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Icons.ExternalLink />
                  </motion.button>
                </div>
              </div>

              <div className="search-box">
                <Icons.Search />
                <input
                  type="text"
                  placeholder="Поиск по диалогам и юзерам..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="chat-filters">
                <button className="active">Все</button>
                <button>Личные</button>
                <button>🗂️ Архив</button>
                <button className="add-folder">+ Папка</button>
              </div>

              <div className="chat-list">
                {filteredUsers.length === 0 && (
                  <div className="empty-list">
                    <Icons.MessageCircle />
                    <p>Нет пользователей</p>
                  </div>
                )}

                {/* Избранное */}
                <motion.div 
                  className="chat-item"
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Avatar name="Избранное" size={50} online={false} />
                  <div className="chat-info">
                    <div className="chat-top">
                      <span className="chat-name">Избранное</span>
                    </div>
                    <span className="chat-preview">Сообщение</span>
                  </div>
                </motion.div>

                {filteredUsers.map(u => (
                  <motion.div 
                    key={u.uid}
                    className={`chat-item ${selectedChat?.uid === u.uid ? 'active' : ''}`}
                    onClick={() => { 
                      setSelectedChat(u); 
                      setShowMobileChat(true);
                      setActiveTab('chats');
                    }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                    whileTap={{ scale: 0.98 }}
                    layout
                  >
                    <Avatar name={u.username || '?'} size={50} online={u.online} />
                    <div className="chat-info">
                      <div className="chat-top">
                        <span className="chat-name">{u.username || 'Unknown'}</span>
                        <span className="chat-time">
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <span className="chat-preview">
                        {u.online ? '🟢 в сети' : '⚪ был(а) в сети'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ОКНО ЧАТА */}
        <AnimatePresence>
          {selectedChat && (
            <motion.section 
              className={`chat-window ${showMobileChat ? 'mobile-active' : ''}`}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ duration: 0.3, type: 'spring', damping: 25 }}
            >
              {/* ШАПКА ЧАТА */}
              <div className="chat-header">
                <div className="chat-header-left">
                  <motion.button 
                    className="back-btn"
                    onClick={() => setShowMobileChat(false)}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icons.ArrowLeft />
                  </motion.button>

                  <Avatar name={selectedChat.username || '?'} size={40} online={selectedChat.online} />

                  <div className="chat-header-info">
                    <h3>{selectedChat.username || 'Unknown'}</h3>
                    <span className={`status-text ${selectedChat.online ? 'online' : ''}`}>
                      {selectedChat.online ? 'в сети' : `был(а) в сети`}
                    </span>
                  </div>
                </div>

                <div className="chat-header-actions">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Icons.Phone />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                    <Icons.MoreVertical />
                  </motion.button>
                </div>
              </div>

              {/* ЗАКРЕПЛЁННОЕ СООБЩЕНИЕ */}
              <AnimatePresence>
                {pinnedMessage && (
                  <motion.div 
                    className="pinned-message"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <div className="pinned-content">
                      <span className="pinned-label"><Icons.Pin /> Закреплённое сообщение</span>
                      <p>{pinnedMessage.text}</p>
                    </div>
                    <motion.button 
                      className="unpin-btn"
                      onClick={() => pinMessage(pinnedMessage.id)}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Icons.X />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* СООБЩЕНИЯ */}
              <div className="messages-area">
                {messages.length === 0 && (
                  <motion.div 
                    className="empty-chat"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="empty-avatar">
                      <Avatar name={selectedChat.username || '?'} size={80} showStatus={false} />
                    </div>
                    <h3>{selectedChat.username}</h3>
                    <p>Начните диалог первым!</p>
                  </motion.div>
                )}

                <AnimatePresence>
                  {messages.map((msg, index) => {
                    const isMe = msg.sender === user.uid;
                    const showAvatar = !isMe && (index === 0 || messages[index - 1].sender !== msg.sender);

                    return (
                      <motion.div
                        key={msg.id}
                        className={`message-wrapper ${isMe ? 'sent' : 'received'}`}
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3, type: 'spring', damping: 20 }}
                        layout
                      >
                        {!isMe && showAvatar && (
                          <Avatar name={msg.senderName || '?'} size={32} showStatus={false} />
                        )}
                        {!isMe && !showAvatar && <div className="avatar-spacer" />}

                        <motion.div 
                          className={`message-bubble ${isMe ? 'sent' : 'received'} ${msg.pinned ? 'pinned' : ''}`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onDoubleClick={() => pinMessage(msg.id)}
                        >
                          {msg.pinned && <div className="pin-badge"><Icons.Pin /></div>}
                          <p>{msg.text}</p>
                          <div className="message-meta">
                            <span className="message-time">
                              {new Date(msg.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && (
                              <span className={`read-status ${msg.read ? 'read' : ''}`}>
                                {msg.read ? <Icons.DoubleCheck /> : <Icons.Check />}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* ИНДИКАТОР ПЕЧАТИ */}
                <AnimatePresence>
                  {typingUsers[selectedChat?.uid] && (
                    <div className="message-wrapper received">
                      <Avatar name={selectedChat.username || '?'} size={32} showStatus={false} />
                      <TypingIndicator />
                    </div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>

              {/* ВВОД СООБЩЕНИЯ */}
              <form className="message-input-area" onSubmit={sendMessage}>
                <motion.button 
                  type="button" 
                  className="attach-btn"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icons.Paperclip />
                </motion.button>

                <motion.button 
                  type="button" 
                  className="emoji-btn"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icons.Smile />
                </motion.button>

                <div className="input-wrapper">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Сообщение..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                </div>

                {newMessage.trim() ? (
                  <motion.button 
                    type="submit" 
                    className="send-btn"
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 90 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icons.Send />
                  </motion.button>
                ) : (
                  <motion.button 
                    type="button" 
                    className="mic-btn"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Icons.Mic />
                  </motion.button>
                )}
              </form>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ПУСТОЕ СОСТОЯНИЕ (когда чат не выбран) */}
        {!selectedChat && activeTab === 'chats' && (
          <motion.div 
            className="no-chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Icons.MessageCircle />
            </motion.div>
            <h2>Выберите чат</h2>
            <p>Начните общение с друзьями</p>
          </motion.div>
        )}

        {/* НАСТРОЙКИ */}
        {activeTab === 'settings' && (
          <motion.div 
            className="settings-page"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2><Icons.Settings /> Настройки</h2>
            <div className="settings-section">
              <h3>Аккаунт</h3>
              <div className="setting-item">
                <span>Email</span>
                <span className="setting-value">{userData?.email}</span>
              </div>
              <div className="setting-item">
                <span>Юзернейм</span>
                <span className="setting-value">@{userData?.username}</span>
              </div>
              <div className="setting-item">
                <span>UID</span>
                <span className="setting-value">{user?.uid?.slice(0, 12)}...</span>
              </div>
            </div>

            <div className="settings-section">
              <h3>Система</h3>
              <div className="setting-item">
                <span>Версия</span>
                <span className="setting-value">VK Meow v1.0</span>
              </div>
              <div className="setting-item">
                <span>База данных</span>
                <span className="setting-value online">Firebase Realtime ✅</span>
              </div>
            </div>

            <motion.button 
              className="logout-big-btn"
              onClick={handleLogout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icons.LogOut /> Выйти из аккаунта
            </motion.button>
          </motion.div>
        )}

        {/* ПРОФИЛЬ */}
        {activeTab === 'profile' && (
          <motion.div 
            className="profile-page"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="profile-header">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Avatar name={userData?.username || '?'} size={100} online={true} />
              </motion.div>
              <h2>{userData?.username}</h2>
              <p>@{userData?.username}</p>
              <span className="profile-status">🟢 в сети</span>
            </div>

            <div className="profile-stats">
              <div className="stat">
                <span className="stat-value">{users.length}</span>
                <span className="stat-label">Контактов</span>
              </div>
              <div className="stat">
                <span className="stat-value">{messages.length}</span>
                <span className="stat-label">Сообщений</span>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* ПАНЕЛЬ ЛОГОВ (для десктопа) */}
      <aside className="log-panel-desktop">
        <div className="log-header">
          <h3><Icons.Pencil /> ЛОГИ</h3>
          <button onClick={() => setLogs([])}><Icons.X /></button>
        </div>
        <div className="log-list">
          {logs.length === 0 && <p className="log-empty">Логи пусты...</p>}
          {logs.map((log) => (
            <motion.div 
              key={log.id}
              className={`log-item log-${log.type}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="log-time">{log.time}</span>
              <span className="log-text">{log.icon} {log.message}</span>
            </motion.div>
          ))}
        </div>
      </aside>
    </div>
  );
}

// Рендер
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
