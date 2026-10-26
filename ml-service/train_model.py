
import json
from pathlib import Path

import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

# Demonstration data only.
# Each text sample has a known job category.
samples = [
    ("react javascript html css frontend components", "Frontend Developer"),
    ("react css javascript responsive web pages", "Frontend Developer"),
    ("html css react ui browser javascript", "Frontend Developer"),
    ("frontend javascript react vite components", "Frontend Developer"),
    ("node express mongodb rest api backend", "Backend Developer"),
    ("python fastapi database api server backend", "Backend Developer"),
    ("express node js authentication api", "Backend Developer"),
    ("mongodb server routes node express", "Backend Developer"),
    ("python pandas numpy data cleaning analysis", "Data Analyst"),
    ("sql excel pandas visualization reports", "Data Analyst"),
    ("python statistics charts dashboard analytics", "Data Analyst"),
    ("sql data analysis python reporting", "Data Analyst"),
    ("python machine learning classification model", "ML Engineer"),
    ("scikit learn tfidf regression model training", "ML Engineer"),
    ("python nlp machine learning model evaluation", "ML Engineer"),
    ("pandas sklearn feature engineering prediction", "ML Engineer"),
    ("react node express mongodb full stack", "Full Stack Developer"),
    ("javascript frontend backend database application", "Full Stack Developer"),
    ("mern stack react node mongodb api", "Full Stack Developer"),
    ("full stack web development rest api react", "Full Stack Developer"),
]

texts = [item[0] for item in samples]
labels = [item[1] for item in samples]

X_train, X_test, y_train, y_test = train_test_split(
    texts,
    labels,
    test_size=0.25,
    random_state=42,
    stratify=labels,
)

model = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2))),
    ("classifier", LogisticRegression(max_iter=1000)),
])

model.fit(X_train, y_train)

predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)

print(f"Demo test accuracy: {accuracy:.2%}")
print("Test samples:", len(X_test))

output_path = Path(__file__).parent / "job_classifier.joblib"
joblib.dump(model, output_path)

print(f"Model saved to: {output_path}")
