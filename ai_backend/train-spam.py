import pandas as pd
import torch
import numpy as np
from datasets import Dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
from sklearn.metrics import accuracy_score

# 0. Перевірка наявності CUDA (GPU)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"🖥️ Використовується пристрій: {device.type.upper()}")

# 1. Завантажуємо файли (заміни назви файлів на свої, якщо вони відрізняються)
spam_train_df = pd.read_csv("/content/drive/MyDrive/Colab Notebooks/spam_dataset_train.csv")
spam_test_df = pd.read_csv("/content/drive/MyDrive/Colab Notebooks/spam_dataset_test.csv")

# ДІАГНОСТИКА: Перевіряємо розподіл класів (0 - не спам, 1 - спам)
print("\n📊 Розподіл класів у тренувальному датасеті:")
print(spam_train_df['label'].value_counts())
print("-" * 40)

# Обов'язкове перемішування даних (shuffle)
spam_train_dataset = Dataset.from_pandas(spam_train_df).shuffle(seed=42)
spam_test_dataset = Dataset.from_pandas(spam_test_df)

# 2. Обираємо базову модель
model_name = "bert-base-multilingual-cased"
tokenizer = AutoTokenizer.from_pretrained(model_name)

def tokenize_function(examples):
    return tokenizer(examples["text"], padding="max_length", truncation=True)

tokenized_spam_train = spam_train_dataset.map(tokenize_function, batched=True)
tokenized_spam_test = spam_test_dataset.map(tokenize_function, batched=True)

# 3. Налаштування моделі (УВАГА: num_labels=2 для спаму)
model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)
model.to(device)

# Функція для підрахунку точності (Accuracy)
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    return {"accuracy": accuracy_score(labels, predictions)}

# 4. Параметри навчання
training_args = TrainingArguments(
    output_dir="./spam_results",
    eval_strategy="epoch",
    save_strategy="epoch",       # Зберігаємо чекпоінт кожну епоху
    load_best_model_at_end=True, # В кінці беремо найкращу версію
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
    train_dataset=tokenized_spam_train,
    eval_dataset=tokenized_spam_test,
    compute_metrics=compute_metrics,
)

print("\n🚀 Початок навчання моделі антиспаму...")
trainer.train()

# 6. Збереження результату
model.save_pretrained("./my_spam_model")
tokenizer.save_pretrained("./my_spam_model")
print("\n✅ Найкраща версія моделі антиспаму успішно збережена в папку ./my_spam_model")