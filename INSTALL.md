# Руководство по установке

## Быстрая установка

Для автоматической настройки просто запустите в корне папки:

```bash
python install.py
```

## Ручная установка

Если вы предпочитаете настраивать всё вручную:

### 1. Python Environment

Создайте и активируйте виртуальное окружение:

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS/Linux
python3 -m venv .venv
source .venv/bin/activate
```

Установите зависимости:

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 2. Node.js (Voiceflow)

Если вы планируете работать с Voiceflow компонентами:

```bash
cd voiceflow
npm install
cd ..
```

### 3. Конфигурация

Создайте файл `credentials.env` в корне проекта (используя `credentials.template.env` как основу) и добавьте ваши ключи API.

```env
GEMINI_API_KEY=ваш_ключ
...
```

## Проверка установки

Запустите тестовый скрипт (если есть) или проверьте версию Python:

```bash
python --version
```

Должно быть 3.10 или выше.
