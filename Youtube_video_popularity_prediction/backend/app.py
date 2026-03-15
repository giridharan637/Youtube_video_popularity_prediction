from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pickle
import os
import sqlite3
from database import get_db_connection, init_db
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(os.path.dirname(BASE_DIR), 'frontend')
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'model.pkl')

app = Flask(__name__, static_folder=FRONTEND_DIR, static_url_path='')
CORS(app)

init_db()

model = None
try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
except FileNotFoundError:
    print("Warning: Model not found. Run train_model.py first.")


@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/history.html')
def history_page():
    return send_from_directory(app.static_folder, 'history.html')

@app.route('/analytics.html')
def analytics_page():
    return send_from_directory(app.static_folder, 'analytics.html')

@app.route('/aitools.html')
def aitools_page():
    return send_from_directory(app.static_folder, 'aitools.html')

@app.route('/about.html')
def about_page():
    return send_from_directory(app.static_folder, 'about.html')

@app.route('/dashboard.html')
def dashboard_page():
    return send_from_directory(app.static_folder, 'dashboard.html')

@app.route('/help.html')
def help_page():
    return send_from_directory(app.static_folder, 'help.html')

@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
        
    conn = get_db_connection()
    c = conn.cursor()
    try:
        c.execute('INSERT INTO users (username, password) VALUES (?, ?)', (username, password))
        conn.commit()
        user_id = c.lastrowid
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Username already exists'}), 409
        
    conn.close()
    return jsonify({'message': 'User registered successfully', 'user_id': user_id}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE username = ? AND password = ?', (username, password))
    user = c.fetchone()
    conn.close()
    
    if user:
        return jsonify({'message': 'Login successful', 'user_id': user['id'], 'username': user['username']}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/predict', methods=['POST'])
def predict():
    if not model:
        return jsonify({'error': 'Model not trained yet'}), 500
        
    data = request.json
    title = data.get('title', 'Awesome Video')
    yt_url = data.get('yt_url', '')
    
    # Use defaults if fields are missing (simplified form)
    categoryId = int(data.get('category', 27)) # Default to Education
    duration = int(data.get('duration', 600))  # Default 10 mins
    tags_count = int(data.get('tags_count', 12)) # Default 12 tags
    description = data.get('description', 'Check out this amazing video!')
    user_id = data.get('user_id') 
    
    upload_time_str = data.get('upload_time', '12:00')
    try:
        if ':' in str(upload_time_str):
            upload_time_hour = int(str(upload_time_str).split(':')[0])
        else:
            upload_time_hour = int(upload_time_str)
    except:
        upload_time_hour = 12

    description_length = len(description)
    category = categoryId
    
    features = [[duration, tags_count, description_length, category, upload_time_hour]]
    
    predicted_views = int(model.predict(features)[0])
    
    if predicted_views > 1000000:
        popularity_level = 'High'
        score = min(100, int(predicted_views / 20000))
    elif predicted_views > 100000:
        popularity_level = 'Medium'
        score = min(80, int((predicted_views - 100000) / 11250) + 40)
    else:
        popularity_level = 'Low'
        score = min(40, int(predicted_views / 2500))
        
    result = {
        'views': predicted_views,
        'level': popularity_level,
        'score': score
    }
    
    if user_id:
        category_name = data.get('category_name', 'Unknown')
        conn = get_db_connection()
        c = conn.cursor()
        c.execute('''
            INSERT INTO predictions (user_id, title, category, predicted_views, popularity_level)
            VALUES (?, ?, ?, ?, ?)
        ''', (user_id, title, category_name, predicted_views, popularity_level))
        conn.commit()
        conn.close()
        
    return jsonify(result), 200

@app.route('/api/history', methods=['GET'])
def history():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id required'}), 400
        
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM predictions WHERE user_id = ? ORDER BY timestamp DESC', (user_id,))
    rows = c.fetchall()
    conn.close()
    
    history_list = [dict(row) for row in rows]
    return jsonify(history_list), 200

@app.route('/api/charts_data', methods=['GET'])
def charts_data():
    data = {
        'category_views': {
            'labels': ['Music', 'Gaming', 'Education', 'Tech', 'Entertainment'],
            'data': [5000000, 3000000, 1500000, 2500000, 4000000]
        },
        'upload_time_popularity': {
            'labels': ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
            'data': [10, 5, 40, 60, 85, 95]
        },
        'likes_vs_views': {
            'labels': ['10k Views', '50k Views', '100k Views', '500k Views', '1M+ Views'],
            'data': [500, 2000, 4500, 25000, 60000]
        }
    }
    return jsonify(data), 200

@app.route('/api/analytics_v2', methods=['GET'])
def analytics_v2():
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('SELECT COUNT(*) as total FROM predictions')
    total_predictions = c.fetchone()['total']
    
    c.execute('SELECT category, COUNT(*) as count FROM predictions GROUP BY category')
    cat_rows = c.fetchall()
    category_data = {
        'labels': [row['category'] for row in cat_rows],
        'data': [row['count'] for row in cat_rows]
    }
    
    c.execute('SELECT popularity_level, COUNT(*) as count FROM predictions GROUP BY popularity_level')
    pop_rows = c.fetchall()
    popularity_data = {
        'labels': [row['popularity_level'] for row in pop_rows],
        'data': [row['count'] for row in pop_rows]
    }
    
    c.execute('SELECT timestamp, predicted_views FROM predictions ORDER BY timestamp ASC')
    trend_rows = c.fetchall()
    trend_data = {
        'labels': [row['timestamp'] for row in trend_rows],
        'data': [row['predicted_views'] for row in trend_rows]
    }
    
    conn.close()
    
    return jsonify({
        'total': total_predictions,
        'categories': category_data,
        'popularity': popularity_data,
        'trend': trend_data
    }), 200

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
