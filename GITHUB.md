# Как выложить проект на GitHub

## 1. Установить Git (если ещё не установлен)

- Скачайте: https://git-scm.com/download/win  
- Установите с настройками по умолчанию (можно везде нажимать «Next»).  
- Перезапустите терминал или Cursor после установки.

---

## 2. Открыть терминал в папке проекта

В Cursor: меню **Terminal** → **New Terminal** (или `` Ctrl+` ``).  
Убедитесь, что вы в папке `upmarch` (должно быть что-то вроде `...\Desktop\upmarch`).

---

## 3. Инициализировать репозиторий и первый коммит

По очереди выполните команды:

```bash
git init
git add .
git commit -m "Initial commit: PolimedicClinic patient portal"
```

Если Git спросит имя и email (при первом использовании), введите:

```bash
git config --global user.name "Ваше Имя"
git config --global user.email "ваш@email.com"
```

После этого снова выполните `git add .` и `git commit -m "..."`.

---

## 4. Создать репозиторий на GitHub

1. Зайдите на https://github.com и войдите в аккаунт (или зарегистрируйтесь).  
2. Нажмите **«+»** в правом верхнем углу → **New repository**.  
3. Заполните:
   - **Repository name:** например `polimedicclinic` или `upmarch`
   - **Description:** по желанию, например «Пациентский портал клиники»
   - Оставьте **Public**
   - **НЕ** ставьте галочки «Add a README» и «Add .gitignore» — репозиторий должен быть пустым
4. Нажмите **Create repository**.

---

## 5. Подключить проект к GitHub и отправить код

На странице нового репозитория GitHub покажут команды. Используйте такие (подставьте **свой** логин и имя репозитория):

```bash
git branch -M main
git remote add origin https://github.com/ВАШ_ЛОГИН/ИМЯ_РЕПОЗИТОРИЯ.git
git push -u origin main
```

Пример: если логин `ivanov`, репозиторий `polimedicclinic`:

```bash
git remote add origin https://github.com/ivanov/polimedicclinic.git
git push -u origin main
```

При `git push` откроется окно входа в GitHub (логин и пароль или токен). После успешной авторизации код загрузится на GitHub.

---

## Готово

Репозиторий будет доступен по адресу:  
`https://github.com/ВАШ_ЛОГИН/ИМЯ_РЕПОЗИТОРИЯ`

В репозитории **не** попадут папка `node_modules`, файлы `.env` и база `backend/data/` — они перечислены в `.gitignore`.
