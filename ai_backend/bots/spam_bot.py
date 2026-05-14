from transformers import pipeline
model_path = "./my_spam_model"

# Завантажуємо модель 
print("Завантаження фільтра спаму...")
spam_classifier = pipeline(
    "text-classification", 
    model="mrm8488/bert-tiny-finetuned-sms-spam-detection"
)

print("\n" + "="*40)
print("АНАЛІЗАТОР СПАМУ ГОТОВИЙ")
print("Введіть текст для перевірки (або 'exit')")
print("="*40)

while True:
    user_input = input("\nВведіть повідомлення: ").strip()
    
    if user_input.lower() in ['exit', 'вихід', 'quit']:
        break
        
    if not user_input:
        continue
        
    result = spam_classifier(user_input)[0]
    
    # LABEL_1 — це спам у цій моделі
    status = "🚫 СПАМ" if result['label'] == 'LABEL_1' else "✅ НОРМА"
    
    print(f"Результат: {status}")
    print(f"Впевненість: {result['score']:.2%}")