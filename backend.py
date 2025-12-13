import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.tree import DecisionTreeClassifier
from sklearn.utils import shuffle

# ==========================================
# PART 1: DATA GENERATION (FORCED BALANCE)
# ==========================================
print("--- Step 1: Simulating Balanced Data ---")

np.random.seed(42)

# --- 1. Generate NORMAL Data (approx 110,000 rows) ---
n_normal = 110000
normal_data = {
    'amount': np.random.exponential(scale=500, size=n_normal) + 10,
    'time_hour': np.random.randint(6, 22, n_normal), # Mostly day time
    'transfer_type': np.random.choice(['Domestic', 'Bill'], n_normal, p=[0.8, 0.2]),
    'is_outside_country': np.zeros(n_normal, dtype=int), # Inside country
    'complaint_count': np.zeros(n_normal, dtype=int),
    'account_age_days': np.random.randint(100, 4000, n_normal),
    'is_blacklisted': np.zeros(n_normal, dtype=int),
    'minutes_since_last_txn': np.random.uniform(60, 1000, n_normal),
    'transaction_count_today': np.random.choice([1, 2, 3], n_normal),
    'fraud_type': ['Normal'] * n_normal
}
df = pd.DataFrame(normal_data)

# --- 2. Force-Inject 5,000 rows for EACH Fraud Type ---
fraud_count = 5000

def inject_fraud(name, amount_range, time_range, type_choice, outside, age_range, min_gap, daily_cnt, blacklist=0):
    new_rows = {
        'amount': np.random.uniform(amount_range[0], amount_range[1], fraud_count),
        'time_hour': np.random.randint(time_range[0], time_range[1] + 1, fraud_count),
        'transfer_type': np.random.choice(type_choice, fraud_count),
        'is_outside_country': np.full(fraud_count, outside),
        'complaint_count': np.random.choice([1, 2, 3], fraud_count),
        'account_age_days': np.random.randint(age_range[0], age_range[1], fraud_count),
        'is_blacklisted': np.full(fraud_count, blacklist),
        'minutes_since_last_txn': np.full(fraud_count, min_gap),
        'transaction_count_today': np.full(fraud_count, daily_cnt),
        'fraud_type': [name] * fraud_count
    }
    return pd.DataFrame(new_rows)

# Injecting the specific patterns based on your rules:

# Rule 1: Micro-Flooding (Small amt, fast gap, high count)
df = pd.concat([df, inject_fraud('Micro-Flooding', [0.1, 19], [0, 23], ['Domestic'], 0, [100, 1000], 1.5, 15)])

# Rule 2: Laundering (Specific amount 9000-9900)
df = pd.concat([df, inject_fraud('Structuring (Laundering)', [9000, 9900], [0, 23], ['Domestic'], 0, [100, 2000], 60, 5)])

# Rule 3: Account Takeover (Old account, Outside country, High Amt)
df = pd.concat([df, inject_fraud('Account Takeover', [5001, 10000], [0, 23], ['Domestic'], 1, [1001, 3000], 120, 2)])

# Rule 4: Mule Account (New account <7 days, Big money)
df = pd.concat([df, inject_fraud('Mule Account', [2001, 5000], [0, 23], ['Domestic'], 0, [0, 6], 120, 2)])

# Rule 5: High-Risk Wallet (Wallet + >5000)
df = pd.concat([df, inject_fraud('High-Risk Wallet', [5001, 10000], [0, 23], ['Wallet'], 0, [100, 2000], 120, 2)])

# Rule 6: Geo-Impossible (Outside + Domestic + Fast)
df = pd.concat([df, inject_fraud('Geo-Impossible', [100, 5000], [0, 23], ['Domestic'], 1, [100, 2000], 5, 2)])

# Rule 7: Midnight Panic (2AM-4AM + >3000)
df = pd.concat([df, inject_fraud('Midnight Panic', [3001, 6000], [2, 4], ['Domestic'], 0, [100, 2000], 120, 1)])

# Rule 8: Blacklisted User
df = pd.concat([df, inject_fraud('Blacklisted User', [10, 1000], [0, 23], ['Domestic'], 0, [100, 2000], 120, 1, blacklist=1)])

# Rule 9: Dormant Reawakening (Old account, long gap, high amt)
df = pd.concat([df, inject_fraud('Dormant Reawakening', [5001, 10000], [0, 23], ['Domestic'], 0, [2001, 4000], 11000, 1)])

# --- 3. Shuffle and Finalize ---
df = shuffle(df, random_state=42).reset_index(drop=True)

print("✅ Data Generated Successfully!")
print("\n--- NEW DISTRIBUTION (At least 5000 each) ---")
print(df['fraud_type'].value_counts())

# ==========================================
# PART 2: TRAINING THE DECISION TREE
# ==========================================
print("\n--- Step 2: Training Decision Tree ---")

le_type = LabelEncoder()
df['transfer_type_code'] = le_type.fit_transform(df['transfer_type'])

le_target = LabelEncoder()
df['target_code'] = le_target.fit_transform(df['fraud_type'])

X = df[['amount', 'time_hour', 'transfer_type_code', 'is_outside_country',
        'complaint_count', 'account_age_days', 'is_blacklisted',
        'minutes_since_last_txn', 'transaction_count_today']]
y = df['target_code']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

dt_model = DecisionTreeClassifier(random_state=42)
dt_model.fit(X_train, y_train)

score = dt_model.score(X_test, y_test)
print(f"Decision Tree Accuracy: {score*100:.2f}%")
print("✅ Model Trained on Balanced Data")
