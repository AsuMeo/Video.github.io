// ========================
// MEOW MESSENGER - Main App
// Solid.js style reactive messenger on Firebase Realtime
// ========================

console.log("[APP] Инициализация мессенджера...");

let currentUser = null;
let currentChatId = null;
let currentChatUser = null;
let messagesRef = null;
let chatsRef = null;
let usersRef = null;
let typingRef = null;
let presenceRef = null;

const appContainer = document.getElementById("appContainer");
const chatListEl = document.getElementById("chatList");
const messagesContainer = document.getElementById("messagesContainer");
const messageInput = document.getElementById("messageInput");
const chatScreen = document.getElementById("chatScreen");
const searchInput = document.getElementById("searchInput");
const usersModal = document.getElementById("usersModal");
const usersListEl = document.getElementById("usersList");
const profileModal = document.getElementById("profileModal");
const loadingOverlay = document.getElementById("loadingOverlay");
const toast = document.getElementById("toast");

// ========== ИНИЦИАЛИЗАЦИЯ ==========
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    console.log("[APP] Не авторизован, редирект на auth.html");
    window.location.href = "auth.html";
    return;
  }

  currentUser = user;
  console.log("[APP] Авторизован:", user.uid);

  loadingOverlay.classList.add("active");

  usersRef = database.ref("users");
  chatsRef = database.ref("userChats");

  // Presence system
  const userStatusRef = database.ref(`users/${user.uid}/online`);
  const userLastSeenRef = database.ref(`users/${user.uid}/lastSeen`);
  const connectedRef = database.ref(".info/connected");

  connectedRef.on("value", (snap) => {
    if (snap.val() === true) {
      userStatusRef.set(true);
      userStatusRef.onDisconnect().set(false);
      userLastSeenRef.onDisconnect().set(Date.now());
    }
  });

  await loadUserProfile();
  loadChats();

  loadingOverlay.classList.remove("active");
  appContainer.classList.add("active");
  showToast("Добро пожаловать!");
});

// ========== ЗАГРУЗКА ПРОФИЛЯ ==========
async function loadUserProfile() {
  const snapshot = await database.ref(`users/${currentUser.uid}`).once("value");
  const userData = snapshot.val();
  if (userData) {
    document.getElementById("headerAvatar").src = userData.avatar || "";
    document.getElementById("headerName").textContent = userData.name || "Meow";
  }
}

// ========== СПИСОК ЧАТОВ (Realtime) ==========
function loadChats() {
  console.log("[APP] Загрузка чатов...");

  chatsRef.child(currentUser.uid).on("value", async (snapshot) => {
    const chats = snapshot.val() || {};
    const chatArray = [];

    for (const [chatId, chatData] of Object.entries(chats)) {
      const otherUserId = chatData.users.find(id => id !== currentUser.uid);
      const userSnap = await database.ref(`users/${otherUserId}`).once("value");
      const userData = userSnap.val();

      if (userData) {
        chatArray.push({
          id: chatId,
          userId: otherUserId,
          name: userData.name,
          avatar: userData.avatar,
          online: userData.online,
          lastMessage: chatData.lastMessage || "",
          lastMessageTime: chatData.lastMessageTime || 0,
          unread: chatData.unread?.[currentUser.uid] || 0
        });
      }
    }

    chatArray.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
    renderChatList(chatArray);
  });
}

function renderChatList(chats) {
  if (chats.length === 0) {
    chatListEl.innerHTML = `
      <div class="empty-state">
        <div class="icon">💬</div>
        <h3>Нет чатов</h3>
        <p>Нажмите 🔍 чтобы найти пользователей</p>
      </div>
    `;
    return;
  }

  chatListEl.innerHTML = chats.map(chat => {
    const time = chat.lastMessageTime ? formatTime(chat.lastMessageTime) : "";
    const unreadBadge = chat.unread > 0 ? `<span class="unread">${chat.unread}</span>` : "";
    const onlineDot = chat.online ? `<div class="online-indicator"></div>` : "";

    return `
      <div class="chat-item" onclick="openChat('${chat.id}', '${chat.userId}')">
        <div style="position:relative">
          <img class="avatar" src="${chat.avatar || ""}" alt="" onerror="this.style.display='none'">
          ${onlineDot}
        </div>
        <div class="info">
          <div class="name">${escapeHtml(chat.name)}</div>
          <div class="last-msg">${escapeHtml(chat.lastMessage)}</div>
        </div>
        <div class="meta">
          <span class="time">${time}</span>
          ${unreadBadge}
        </div>
      </div>
    `;
  }).join("");
}

// ========== ОТКРЫТИЕ ЧАТА ==========
async function openChat(chatId, userId) {
  console.log("[APP] Открытие чата:", chatId, "с пользователем:", userId);

  currentChatId = chatId;
  currentChatUser = userId;

  const userSnap = await database.ref(`users/${userId}`).once("value");
  const userData = userSnap.val();

  document.getElementById("chatAvatar").src = userData?.avatar || "";
  document.getElementById("chatName").textContent = userData?.name || "Пользователь";
  updateChatStatus(userData);

  if (presenceRef) presenceRef.off();
  presenceRef = database.ref(`users/${userId}`);
  presenceRef.on("value", (snap) => {
    updateChatStatus(snap.val());
  });

  await database.ref(`userChats/${currentUser.uid}/${chatId}/unread/${currentUser.uid}`).set(0);

  chatScreen.classList.add("active");
  loadMessages(chatId);
  listenTyping(chatId, userId);
}

function updateChatStatus(userData) {
  const statusEl = document.getElementById("chatStatus");
  if (!userData) return;

  if (userData.online) {
    statusEl.textContent = "онлайн";
    statusEl.style.color = "var(--green)";
  } else {
    const time = userData.lastSeen ? formatTime(userData.lastSeen) : "";
    statusEl.textContent = time ? `был(а) ${time}` : "офлайн";
    statusEl.style.color = "var(--text-secondary)";
  }
}

function closeChat() {
  chatScreen.classList.remove("active");
  if (messagesRef) { messagesRef.off(); messagesRef = null; }
  if (typingRef) { typingRef.off(); typingRef = null; }
  if (presenceRef) { presenceRef.off(); presenceRef = null; }
  currentChatId = null;
  currentChatUser = null;
  messagesContainer.innerHTML = "";
}

// ========== СООБЩЕНИЯ (Realtime) ==========
function loadMessages(chatId) {
  messagesContainer.innerHTML = "";

  messagesRef = database.ref(`chats/${chatId}/messages`);
  messagesRef.on("child_added", (snapshot) => {
    const msg = snapshot.val();
    const msgId = snapshot.key;
    appendMessage(msg, msgId);
    scrollToBottom();
  });

  messagesRef.once("value", (snapshot) => {
    snapshot.forEach((child) => {
      const msg = child.val();
      if (msg.sender !== currentUser.uid && !msg.read) {
        database.ref(`chats/${chatId}/messages/${child.key}/read`).set(true);
      }
    });
  });
}

function appendMessage(msg, msgId) {
  const isSent = msg.sender === currentUser.uid;
  const time = formatTime(msg.timestamp);
  const readStatus = isSent ? (msg.read ? "✓✓" : "✓") : "";

  const div = document.createElement("div");
  div.className = `message ${isSent ? "sent" : "received"}`;
  div.id = `msg-${msgId}`;
  div.innerHTML = `
    ${escapeHtml(msg.text)}
    <div class="time">${time} <span class="read-status">${readStatus}</span></div>
  `;

  messagesContainer.appendChild(div);
}

function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ========== ОТПРАВКА СООБЩЕНИЯ ==========
async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || !currentChatId) return;

  messageInput.value = "";

  const messageData = {
    text: text,
    sender: currentUser.uid,
    timestamp: Date.now(),
    read: false
  };

  await database.ref(`chats/${currentChatId}/messages`).push(messageData);

  await database.ref(`userChats/${currentUser.uid}/${currentChatId}`).update({
    lastMessage: text,
    lastMessageTime: Date.now()
  });

  await database.ref(`userChats/${currentChatUser}/${currentChatId}`).update({
    lastMessage: text,
    lastMessageTime: Date.now()
  });

  const unreadSnap = await database.ref(`userChats/${currentChatUser}/${currentChatId}/unread/${currentChatUser}`).once("value");
  const currentUnread = unreadSnap.val() || 0;
  await database.ref(`userChats/${currentChatUser}/${currentChatId}/unread/${currentChatUser}`).set(currentUnread + 1);

  database.ref(`chats/${currentChatId}/typing/${currentUser.uid}`).remove();
}

messageInput?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Typing indicator
let typingTimeout;
messageInput?.addEventListener("input", () => {
  if (!currentChatId) return;
  database.ref(`chats/${currentChatId}/typing/${currentUser.uid}`).set(true);
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    database.ref(`chats/${currentChatId}/typing/${currentUser.uid}`).remove();
  }, 3000);
});

function listenTyping(chatId, userId) {
  const typingIndicator = document.getElementById("typingIndicator");
  if (typingRef) typingRef.off();
  typingRef = database.ref(`chats/${chatId}/typing/${userId}`);

  typingRef.on("value", (snap) => {
    if (snap.val()) {
      typingIndicator.classList.add("active");
      scrollToBottom();
    } else {
      typingIndicator.classList.remove("active");
    }
  });
}

// ========== ПОИСК ПОЛЬЗОВАТЕЛЕЙ ==========
function openUsersModal() {
  usersModal.classList.add("active");
  loadAllUsers();
}

function closeUsersModal() {
  usersModal.classList.remove("active");
}

async function loadAllUsers() {
  const snapshot = await usersRef.once("value");
  const users = snapshot.val() || {};

  const userArray = Object.entries(users)
    .filter(([uid]) => uid !== currentUser.uid)
    .map(([uid, data]) => ({ uid, ...data }));

  renderUsersList(userArray);
}

function renderUsersList(users) {
  if (users.length === 0) {
    usersListEl.innerHTML = `
      <div class="empty-state">
        <div class="icon">👥</div>
        <h3>Нет пользователей</h3>
      </div>
    `;
    return;
  }

  usersListEl.innerHTML = users.map(user => `
    <div class="user-item" onclick="startChat('${user.uid}')">
      <img class="avatar" src="${user.avatar || ""}" alt="" onerror="this.style.display='none'">
      <div class="info">
        <div class="name">${escapeHtml(user.name)}</div>
        <div class="email">${escapeHtml(user.email)}</div>
      </div>
    </div>
  `).join("");
}

// Поиск по чатам
searchInput?.addEventListener("input", async (e) => {
  const query = e.target.value.toLowerCase().trim();
  if (!query) { loadChats(); return; }

  const chatsSnap = await chatsRef.child(currentUser.uid).once("value");
  const chats = chatsSnap.val() || {};

  const results = [];
  for (const [chatId, chatData] of Object.entries(chats)) {
    const otherUserId = chatData.users.find(id => id !== currentUser.uid);
    const userSnap = await database.ref(`users/${otherUserId}`).once("value");
    const userData = userSnap.val();

    if (userData && userData.name.toLowerCase().includes(query)) {
      results.push({
        id: chatId,
        userId: otherUserId,
        name: userData.name,
        avatar: userData.avatar,
        online: userData.online,
        lastMessage: chatData.lastMessage || "",
        lastMessageTime: chatData.lastMessageTime || 0,
        unread: chatData.unread?.[currentUser.uid] || 0
      });
    }
  }

  renderChatList(results);
});

// ========== НАЧАТЬ ЧАТ ==========
async function startChat(userId) {
  closeUsersModal();

  const myChatsSnap = await chatsRef.child(currentUser.uid).once("value");
  const myChats = myChatsSnap.val() || {};

  let existingChatId = null;
  for (const [chatId, chatData] of Object.entries(myChats)) {
    if (chatData.users.includes(userId)) {
      existingChatId = chatId;
      break;
    }
  }

  if (existingChatId) {
    openChat(existingChatId, userId);
    return;
  }

  const newChatRef = database.ref("chats").push();
  const chatId = newChatRef.key;

  await newChatRef.set({
    users: [currentUser.uid, userId],
    createdAt: Date.now()
  });

  await chatsRef.child(currentUser.uid).child(chatId).set({
    users: [currentUser.uid, userId],
    lastMessage: "",
    lastMessageTime: Date.now(),
    unread: { [currentUser.uid]: 0, [userId]: 0 }
  });

  await chatsRef.child(userId).child(chatId).set({
    users: [currentUser.uid, userId],
    lastMessage: "",
    lastMessageTime: Date.now(),
    unread: { [currentUser.uid]: 0, [userId]: 0 }
  });

  openChat(chatId, userId);
  showToast("Чат создан!");
}

// ========== ПРОФИЛЬ ==========
function openProfile() {
  profileModal.classList.add("active");
  loadProfileData();
}

function closeProfile() {
  profileModal.classList.remove("active");
}

async function loadProfileData() {
  const snap = await database.ref(`users/${currentUser.uid}`).once("value");
  const data = snap.val();
  document.getElementById("profileAvatar").src = data?.avatar || "";
  document.getElementById("profileName").textContent = data?.name || "";
  document.getElementById("profileEmail").textContent = data?.email || "";
}

async function logout() {
  await database.ref(`users/${currentUser.uid}/online`).set(false);
  await database.ref(`users/${currentUser.uid}/lastSeen`).set(Date.now());
  await auth.signOut();
  window.location.href = "auth.html";
}

// ========== УТИЛИТЫ ==========
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Вчера";
  }

  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// ========== ОБРАБОТЧИКИ ==========
document.getElementById("searchBtn")?.addEventListener("click", openUsersModal);
document.getElementById("profileBtn")?.addEventListener("click", openProfile);
document.getElementById("closeChatBtn")?.addEventListener("click", closeChat);
document.getElementById("sendBtn")?.addEventListener("click", sendMessage);
document.getElementById("closeUsersModal")?.addEventListener("click", closeUsersModal);
document.getElementById("closeProfileModal")?.addEventListener("click", closeProfile);
document.getElementById("logoutBtn")?.addEventListener("click", logout);

console.log("[APP] app.js полностью загружен");
