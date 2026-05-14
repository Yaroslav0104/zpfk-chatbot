import pandas as pd
from datasets import Dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer

# 1. Завантажуємо файли саме для СПАМУ
# Переконайся, що в CSV є колонки 'text' та 'label' (0 - ham, 1 - spam)
spam_train_df = pd.read_csv("/content/drive/MyDrive/Colab Notebooks/spam_dataset_train.csv")
spam_test_df = pd.read_csv("/content/drive/MyDrive/Colab Notebooks/spam_dataset_test.csv")

# Конвертуємо в формат Hugging Face
spam_train_dataset = Dataset.from_pandas(spam_train_df)
spam_test_dataset = Dataset.from_pandas(spam_test_df)

# 2. Обираємо базову модель
model_name = "bert-base-multilingual-cased"
tokenizer = AutoTokenizer.from_pretrained(model_name)

def tokenize_function(examples):
    return tokenizer(examples["text"], padding="max_length", truncation=True)

# Токенізація
tokenized_spam_train = spam_train_dataset.map(tokenize_function, batched=True)
tokenized_spam_test = spam_test_dataset.map(tokenize_function, batched=True)

# 3. Налаштування моделі (2 класи: Ham та Spam)
model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)

# 4. Параметри навчання
training_args = TrainingArguments(
    output_dir="./results_spam",
    eval_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=8,
    num_train_epochs=3, 
    weight_decay=0.01,
    save_total_limit=1,
)

# 5. Запуск навчання
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_spam_train,
    eval_dataset=tokenized_spam_test,
)

print("--- Початок навчання моделі СПАМУ ---")
trainer.train()

# 6. Збереження результату в окрему папку
model.save_pretrained("./my_spam_model")
tokenizer.save_pretrained("./my_spam_model")
print("✅ Модель спаму успішно навчена та збережена в папку ./my_spam_model")