"""
Тест Google Cloud Speech-to-Text API
Проверяет работоспособность API ключа
"""

import os
import json
import urllib.request
import urllib.error
import base64
import tempfile
import wave
import struct
import math

# Загружаем credentials
def load_credentials():
    env_path = r"c:\Users\Максим\Desktop\work_ai\credentials.env"
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key] = value

load_credentials()

API_KEY = os.environ.get('GOOGLE_CLOUD_SPEECH_API_KEY') or os.environ.get('GEMINI_API_KEY')

def generate_test_audio():
    """Генерируем короткий тестовый WAV файл с тишиной"""
    sample_rate = 16000
    duration = 1  # 1 секунда
    
    # Создаём временный файл
    temp_file = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
    
    with wave.open(temp_file.name, 'w') as wav_file:
        wav_file.setnchannels(1)  # Моно
        wav_file.setsampwidth(2)  # 16 бит
        wav_file.setframerate(sample_rate)
        
        # Генерируем синусоиду (простой тон)
        for i in range(sample_rate * duration):
            value = int(32767 * 0.3 * math.sin(2 * math.pi * 440 * i / sample_rate))
            data = struct.pack('<h', value)
            wav_file.writeframes(data)
    
    return temp_file.name

def test_google_cloud_speech(api_key: str):
    """
    Тестируем Google Cloud Speech-to-Text API
    """
    print("=" * 50)
    print("🔊 Тест Google Cloud Speech-to-Text API")
    print("=" * 50)
    print(f"\n📌 API Key: {api_key[:10]}...{api_key[-4:]}")
    
    # Генерируем тестовое аудио
    print("\n📁 Генерирую тестовое аудио...")
    audio_file = generate_test_audio()
    
    try:
        # Читаем аудио и кодируем в base64
        with open(audio_file, 'rb') as f:
            audio_content = base64.b64encode(f.read()).decode('utf-8')
        
        # Формируем запрос к Google Cloud Speech API
        url = f"https://speech.googleapis.com/v1/speech:recognize?key={api_key}"
        
        payload = {
            "config": {
                "encoding": "LINEAR16",
                "sampleRateHertz": 16000,
                "languageCode": "ru-RU"
            },
            "audio": {
                "content": audio_content
            }
        }
        
        print(f"\n🌐 Отправляю запрос к: speech.googleapis.com")
        
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            url,
            data=data,
            headers={'Content-Type': 'application/json'}
        )
        
        response = urllib.request.urlopen(req, timeout=30)
        result = json.loads(response.read().decode('utf-8'))
        
        print("\n✅ API РАБОТАЕТ!")
        print(f"📋 Ответ: {json.dumps(result, indent=2, ensure_ascii=False)}")
        return True, "Google Cloud Speech API работает"
        
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        error_data = json.loads(error_body) if error_body else {}
        
        error_message = error_data.get('error', {}).get('message', str(e))
        error_status = error_data.get('error', {}).get('status', '')
        
        print(f"\n❌ Ошибка HTTP {e.code}")
        print(f"📋 Статус: {error_status}")
        print(f"📋 Сообщение: {error_message}")
        
        if "API key not valid" in error_message or e.code == 400:
            print("\n⚠️  ВЫВОД: Это НЕ ключ Google Cloud Speech API")
            print("   Этот ключ, вероятно, только для Google AI/Gemini API")
            return False, "Ключ не подходит для Google Cloud Speech API"
        elif "Speech-to-Text API has not been used" in error_message or "PERMISSION_DENIED" in error_status:
            print("\n⚠️  ВЫВОД: API не включено в проекте")
            print("   Нужно включить Speech-to-Text API в Google Cloud Console")
            return False, "Speech-to-Text API не включено"
        else:
            return False, f"Ошибка: {error_message}"
            
    except Exception as e:
        print(f"\n❌ Ошибка: {type(e).__name__}: {e}")
        return False, str(e)
    finally:
        # Удаляем временный файл
        if os.path.exists(audio_file):
            os.unlink(audio_file)

def test_gemini_audio(api_key: str):
    """
    Альтернативный тест - проверяем работает ли как Gemini API
    """
    print("\n" + "=" * 50)
    print("🤖 Проверка как Gemini API")
    print("=" * 50)
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    
    payload = {
        "contents": [{
            "parts": [{"text": "Скажи 'привет' одним словом"}]
        }]
    }
    
    try:
        data = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            url,
            data=data,
            headers={'Content-Type': 'application/json'}
        )
        
        response = urllib.request.urlopen(req, timeout=30)
        result = json.loads(response.read().decode('utf-8'))
        
        text = result.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '')
        print(f"\n✅ Gemini API работает!")
        print(f"📋 Ответ: {text}")
        return True
        
    except Exception as e:
        print(f"\n❌ Gemini тоже не работает: {e}")
        return False

if __name__ == "__main__":
    if not API_KEY:
        print("❌ API ключ не найден в credentials.env")
        exit(1)
    
    # Тест 1: Google Cloud Speech
    success, message = test_google_cloud_speech(API_KEY)
    
    if not success:
        # Тест 2: Проверяем как Gemini API
        test_gemini_audio(API_KEY)
    
    print("\n" + "=" * 50)
    print("📊 ИТОГ")
    print("=" * 50)
    
    if success:
        print("✅ Ключ работает для Google Cloud Speech API")
    else:
        print("⚠️  Ключ НЕ работает для Google Cloud Speech API")
        print("   Это ключ Google AI (Gemini), а не Cloud Speech")
        print("\n📝 Для Google Cloud Speech нужен отдельный проект:")
        print("   1. Перейди: https://console.cloud.google.com/")
        print("   2. Создай проект или выбери существующий")
        print("   3. Включи: APIs & Services → Speech-to-Text API")
        print("   4. Создай API Key: Credentials → Create Credentials → API Key")
