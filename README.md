# 🐱 Meow Messenger

**Сквозной мессенджер на Firebase Realtime + GitHub Pages**
Только мобильная версия (Android). Работает прямо из браузера!

## 📁 Структура проекта

```
meow-messenger/
├── index.html          # Главный мессенджер (чаты, сообщения, профиль)
├── auth.html           # Вход / Регистрация (с подробными логами)
├── design.css          # Все стили (мобильная адаптация как Telegram)
├── app.js              # Логика мессенджера (Solid.js style reactive)
├── auth.js             # Логика авторизации (Firebase Auth + Realtime DB)
└── firebase-config.js  # Конфиг Firebase
```

## 🚀 Деплой на GitHub Pages

### Шаг 1: Создай репозиторий
1. Зайди на [github.com](https://github.com)
2. Создай новый репозиторий (назови `meow-messenger`)
3. Сделай его **Public**

### Шаг 2: Загрузи файлы
1. Нажми **"Add file" → "Upload files"**
2. Перетащи ВСЕ 6 файлов из папки `meow-messenger/`
3. Нажми **"Commit changes"**

### Шаг 3: Включи GitHub Pages
1. Зайди в **Settings** репозитория
2. Прокрути вниз до **Pages**
3. В разделе **Source** выбери **Deploy from a branch**
4. Выбери ветку `main` и папку `/ (root)`
5. Нажми **Save**

### Шаг 4: Готово!
Через 1-2 минуты сайт будет доступен по адресу:
```
https://ТВОЙ_НИК.github.io/meow-messenger/
```

## ⚡ Что работает

- ✅ Регистрация / Вход (Firebase Auth)
- ✅ Аватарки (Firebase Storage)
- ✅ Пользователи в Realtime Database
- ✅ Создание чатов
- ✅ Отправка сообщений (Realtime)
- ✅ Индикатор "печатает..."
- ✅ Статус онлайн / офлайн
- ✅ Счётчик непрочитанных
- ✅ Галочки прочтения (✓ / ✓✓)
- ✅ Поиск по чатам
- ✅ Поиск и добавление пользователей
- ✅ Профиль пользователя
- ✅ Полностью мобильный дизайн

## 🔥 Firebase Rules (обязательно!)

Зайди в Firebase Console → Realtime Database → Rules и вставь:

```json
{
  "rules": {
    "users": {
      ".read": "auth != null",
      "$uid": {
        ".write": "auth != null && auth.uid == $uid"
      }
    },
    "chats": {
      ".read": "auth != null",
      "$chatId": {
        ".write": "auth != null && data.child('users').val().contains(auth.uid)"
      }
    },
    "userChats": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
```

## 📱 Только Android
Сайт адаптирован ТОЛЬКО под мобильные устройства. На ПК будет выглядеть как мобильное приложение в центре экрана.
