from flask import Flask, request, jsonify
from transformers import pipeline

app = Flask(__name__)

print("Завантаження моделей (це може зайняти хвилинку)...")

# 1. Завантажуємо НАШУ НАТРЕНОВАНУ модель тональності (ВИПРАВЛЕНО)
sentiment_model_path = "./my_sentiment_model"
sentiment_classifier = pipeline(
    "text-classification", 
    model=sentiment_model_path,
    device="cpu"
)

# 2. Завантажуємо НАШУ НАТРЕНОВАНУ модель для спаму
spam_model_path = "./my_spam_model"
spam_classifier = pipeline(
    "text-classification", 
    model=spam_model_path,
    device="cpu"
)

print("="*40)
print("ШІ-СЕРВЕР УСПІШНО ЗАПУЩЕНО НА ПОРТУ 8000")
print("="*40)

# Словник для швидкого і надійного перекладу (мапінгу)
sentiment_map = {
    "LABEL_0": "positive", # Як показав тест, 0 - це похвала
    "LABEL_1": "neutral",  # 1 - залишається нейтральним
    "LABEL_2": "negative"  # Як показав тест, 2 - це лайка і скарги
}

# Створюємо шлях (ендпоінт), куди PHP буде відправляти текст
@app.route('/analyze', methods=['POST'])
def analyze_text():
    data = request.json
    text = data.get('text', '')

    if not text:
        return jsonify({"error": "Пустий текст"}), 400

    # --- АНАЛІЗ ТОНАЛЬНОСТІ ---
    sent_result = sentiment_classifier(text)[0]
    sent_label = sent_result['label']

    # ДОДАЙ ОСЬ ЦІ ТРИ РЯДКИ ДЛЯ ДЕБАГУ:
    print("\n--- ТЕСТ ШІ ---")
    print(f"Студент написав: {text}")
    print(f"Модель відповіла: {sent_label} (впевненість {sent_result['score']:.2f})")
    print("-----------------\n")
    
    # Використовуємо словник для перекладу (якщо щось піде не так, за замовчуванням буде "neutral")
    sentiment = sentiment_map.get(sent_label, "neutral")

    # --- АНАЛІЗ СПАМУ ---
    spam_result = spam_classifier(text)[0]
    # LABEL_1 — це спам (відповідно до твого тренування)
    is_spam = 1 if spam_result['label'] == 'LABEL_1' else 0

    # Повертаємо результат назад у PHP
    return jsonify({
        "sentiment": sentiment,
        "is_spam": is_spam
    })

if __name__ == '__main__':
    # Сервер буде працювати на localhost:8000
    app.run(port=8000)