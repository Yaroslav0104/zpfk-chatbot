import pandas as pd
import torch
import numpy as np
from datasets import Dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
from sklearn.metrics import accuracy_score

# 0. Перевірка наявності CUDA (GPU)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"🖥️ Використовується пристрій: {device.type.upper()}")

# 1. Завантажуємо файли
sentiment_train_df = pd.read_csv("/content/drive/MyDrive/Colab Notebooks/sentiment_dataset_train.csv")
sentiment_test_df = pd.read_csv("/content/drive/MyDrive/Colab Notebooks/sentiment_dataset_test.csv")

# ДІАГНОСТИКА: Перевіряємо, чи немає сильного дисбалансу класів
print("\n📊 Розподіл класів у тренувальному датасеті (має бути більш-менш рівномірним):")
print(sentiment_train_df['label'].value_counts())
print("-" * 40)

# ВИПРАВЛЕННЯ 1: Обов'язкове перемішування даних (shuffle), щоб модель не зациклювалась
sentiment_train_dataset = Dataset.from_pandas(sentiment_train_df).shuffle(seed=42)
sentiment_test_dataset = Dataset.from_pandas(sentiment_test_df)

# 2. Обираємо базову модель
model_name = "bert-base-multilingual-cased"
tokenizer = AutoTokenizer.from_pretrained(model_name)

def tokenize_function(examples):
    return tokenizer(examples["text"], padding="max_length", truncation=True)

tokenized_sentiment_train = sentiment_train_dataset.map(tokenize_function, batched=True)
tokenized_sentiment_test = sentiment_test_dataset.map(tokenize_function, batched=True)

# 3. Налаштування моделі (3 класи: Positive, Neutral, Negative)
model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=3)
model.to(device)

# ВИПРАВЛЕННЯ 2: Додаємо функцію для підрахунку точності (Accuracy) під час навчання
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    return {"accuracy": accuracy_score(labels, predictions)}

# 4. Параметри навчання (додано збереження найкращої моделі)
training_args = TrainingArguments(
    output_dir="./results",
    eval_strategy="epoch",
    save_strategy="epoch",       # Зберігаємо чекпоінт кожну епоху
    load_best_model_at_end=True, # В кінці беремо найкращу версію, а не останню
    learning_rate=2e-5,
    per_device_train_batch_size=8,
    num_train_epochs=5,
    weight_decay=0.01,
    save_total_limit=1,
    fp16=torch.cuda.is_available(), 
)

# 5. Запуск навчання
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_sentiment_train,
    eval_dataset=tokenized_sentiment_test,
    compute_metrics=compute_metrics, # Підключаємо метрику точності
)

print("\n🚀 Початок навчання на основі датасетів...")
trainer.train()

# 6. Збереження результату
model.save_pretrained("./my_sentiment_model")
tokenizer.save_pretrained("./my_sentiment_model")
print("\n✅ Найкраща версія моделі успішно збережена в папку ./my_sentiment_model")