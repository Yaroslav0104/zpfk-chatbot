from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import os

# 1. Отримуємо шлях до папки bots (де лежить сам скрипт)
current_dir = os.path.dirname(os.path.abspath(__file__))
base_path = os.path.dirname(current_dir)
model_path = os.path.join(base_path, "my_sentiment_model")

# Завантажуємо модель
print("Завантаження аналізатора емоцій...")
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForSequenceClassification.from_pretrained(model_path)
sentiment_classifier = pipeline(
    "text-classification", 
    model=model, 
    tokenizer=tokenizer
)

# === 1. МАПІНГ ДЛЯ БАЗИ ДАНИХ (Те, що розуміє React) ===
db_sentiment_map = {
    "LABEL_0": "positive",
    "LABEL_1": "neutral",
    "LABEL_2": "negative"
}

# === 2. МАПІНГ ДЛЯ КОНСОЛІ (Щоб тобі було гарно видно при тестуванні) ===
console_map = {
    "positive": "Позитивне (Успіх/Подяка) 🟢", 
    "neutral": "Нейтральне (Питання) 🟡",
    "negative": "Негативне (Скарга/Образа) 🔴"
}

print("\n" + "="*40)
print("АНАЛІЗАТОР ТОНАЛЬНОСТІ ГОТОВИЙ")
print("Введіть текст для перевірки (або 'exit')")
print("="*40)

while True:
    user_input = input("\nВведіть повідомлення: ").strip()
    
    if user_input.lower() in ['exit', 'вихід', 'quit']:
        break
        
    if not user_input:
        continue
        
    result = sentiment_classifier(user_input)[0]
    raw_label = result['label'] # Це буде "LABEL_0", "LABEL_1" або "LABEL_2"
    
    # 3. ОТРИМУЄМО ЗНАЧЕННЯ ДЛЯ БД
    # Саме цю змінну `db_sentiment` ти маєш передавати в свій SQL запит (INSERT INTO...)
    db_sentiment = db_sentiment_map.get(raw_label, "neutral") 
    
    # Вивід результатів
    print(f"Дані для БД: '{db_sentiment}'")
    print(f"Для юзера:   {console_map.get(db_sentiment)}")
    print(f"Впевненість: {result['score']:.2%}")