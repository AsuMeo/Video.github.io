// ============================================
// APP.JSX — ФУНКЦИОНАЛ МЕССЕНДЖЕРА (ОСНОВНОЙ)
// ============================================

const { useState, useEffect, useRef } = React;

function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  const addLog = (type, icon, message) => {
    const time = new Date().toLocaleTimeString('ru-RU');
    setLogs(prev => [...prev, { type, icon, message, time }]);
  };

  // ============================================
  // ОТСЛЕЖИВАНИЕ АВТОРИЗАЦИИ
  // ============================================
  useEffect(() => {
    addLog('info', '🚀', 'Приложение запущено. Ожидание авторизации...');

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        addLog('success', '✅', `Пользователь авторизован: ${firebaseUser.email}`);
        setUser(firebaseUser);

        // Загружаем данные пользователя
        const snapshot = await database.ref('users/' + firebaseUser.uid).once('value');
        const data = snapshot.val();
        setUserData(data);
        addLog('success', '💾', `Данные пользователя загружены: ${data?.username || 'Unknown'}`);
      } else {
        addLog('info', '👋', 'Пользователь не авторизован');
        setUser(null);
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // ============================================
  // ЗАГРУЗКА СПИСКА ПОЛЬЗОВАТЕЛЕЙ (Realtime)
  // ============================================
  useEffect(() => {
    if (!user) return;

    addLog('info', '👥', 'Подписка на список пользователей...');

    const usersRef = database.ref('users');
    usersRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersList = Object.entries(data)
          .map(([uid, info]) => ({ uid, ...info }))
          .filter(u => u.uid !== user.uid);
        setUsers(usersList);
        addLog('success', '👥', `Загружено пользователей: ${usersList.length}`);
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
    addLog('info', '💬', `Открыт чат с: ${selectedChat.username} (ID: ${chatId})`);

    const messagesRef = database.ref('messages/' + chatId);
    messagesRef.on('value', (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgs = Object.entries(data)
          .map(([key, val]) => ({ id: key, ...val }))
          .sort((a, b) => a.timestamp - b.timestamp);
        setMessages(msgs);
        addLog('info', '💬', `Загружено сообщений: ${msgs.length}`);
      } else {
        setMessages([]);
        addLog('info', '💬', 'Чат пуст. Начните диалог!');
      }
    });

    return () => messagesRef.off();
  }, [user, selectedChat]);

  // Автоскролл вниз
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      timestamp: Date.now(),
      read: false
    };

    addLog('info', '📤', `Отправка сообщения: "${newMessage.trim().substring(0, 30)}..."`);

    try {
      await database.ref('messages/' + chatId).push(messageData);
      addLog('success', '✅', 'Сообщение отправлено в Realtime Database!');
      setNewMessage('');
    } catch (error) {
      addLog('error', '❌', `ОШИБКА ОТПРАВКИ: ${error.message}`);
    }
  };

  // ============================================
  // ВЫХОД
  // ============================================
  const handleLogout = async () => {
    addLog('info', '🚪', 'Запрос на выход...');

    if (user) {
      await database.ref('users/' + user.uid).update({ online: false });
      addLog('success', '💾', 'Статус обновлён на offline');
    }

    await auth.signOut();
    addLog('success', '👋', 'ВЫХОД ИЗ СЕССИИ УСПЕШЕН!');
    setUser(null);
    setSelectedChat(null);
    setMessages([]);
  };

  // Фильтр пользователей
  const filteredUsers = users.filter(u => 
    (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ============================================
  // РЕНДЕР: Если не авторизован — показываем Auth
  // ============================================
  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  // ============================================
  // РЕНДЕР: МЕССЕНДЖЕР
  // ============================================
  return (
    <div className="messenger">
      {/* ШАПКА */}
      <header className="messenger-header">
        <div className="header-left">
          <h1>🐱 Meow Messenger</h1>
          <span className="user-info">
            {userData?.username || user.email} 
            <span className="online-dot">🟢</span>
          </span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Выйти
        </button>
      </header>

      <div className="messenger-body">
        {/* СПИСОК ЧАТОВ */}
        <aside className="chat-list">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Поиск пользователей..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="users-list">
            {filteredUsers.length === 0 && (
              <p className="no-users">Пользователей не найдено</p>
            )}
            {filteredUsers.map(u => (
              <div
                key={u.uid}
                className={`user-item ${selectedChat?.uid === u.uid ? 'active' : ''}`}
                onClick={() => setSelectedChat(u)}
              >
                <div className="user-avatar">
                  {u.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="user-details">
                  <span className="user-name">{u.username || 'Unknown'}</span>
                  <span className={`user-status ${u.online ? 'online' : 'offline'}`}>
                    {u.online ? '🟢 онлайн' : '⚪ офлайн'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ОКНО ЧАТА */}
        <main className="chat-window">
          {selectedChat ? (
            <>
              <div className="chat-header">
                <div className="chat-user-info">
                  <div className="chat-avatar">
                    {selectedChat.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3>{selectedChat.username || 'Unknown'}</h3>
                    <span className={`status ${selectedChat.online ? 'online' : 'offline'}`}>
                      {selectedChat.online ? '🟢 в сети' : '⚪ не в сети'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="messages-container">
                {messages.length === 0 && (
                  <div className="empty-chat">
                    <p>💬 Начните диалог с {selectedChat.username}!</p>
                  </div>
                )}
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`message ${msg.sender === user.uid ? 'sent' : 'received'}`}
                  >
                    <div className="message-bubble">
                      <p>{msg.text}</p>
                      <span className="message-time">
                        {new Date(msg.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        {msg.sender === user.uid && (
                          <span className="read-status">{msg.read ? ' ✅' : ' ⏳'}</span>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form className="message-input" onSubmit={sendMessage}>
                <input
                  type="text"
                  placeholder="Напишите сообщение..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit">📤</button>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <p>👈 Выберите пользователя для начала диалога</p>
            </div>
          )}
        </main>

        {/* ПАНЕЛЬ ЛОГОВ */}
        <aside className="log-sidebar">
          <h3>📋 ЛОГИ СИСТЕМЫ</h3>
          <div className="log-list-messenger">
            {logs.length === 0 && <p className="log-empty">Логи пусты...</p>}
            {logs.map((log, i) => (
              <div key={i} className={`log-item log-${log.type}`}>
                <span className="log-time">[{log.time}]</span>
                <span className="log-icon">{log.icon}</span>
                <span className="log-text">{log.message}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

// Рендерим приложение
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
