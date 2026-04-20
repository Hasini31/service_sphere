# Import Python libraries
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import pickle
import os
from datetime import datetime, timedelta
import numpy as np
import hashlib
import secrets

# Import our custom Python libraries
from python_sentiment_lib import PythonSentimentAnalyzer
from python_ml_lib import PythonBurnoutPredictor
from ml_burnout_calculator import calculate_burnout_with_ml
from chart_generator import generate_manager_charts
from advanced_ai_suggestions import get_advanced_suggestions_with_analysis

app = Flask(__name__)
CORS(app)

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')
REAL_MODEL_PATH = os.path.join(os.path.dirname(__file__), 'real_model.pkl')
SCALER_PATH = os.path.join(os.path.dirname(__file__), 'real_scaler.pkl')
METADATA_PATH = os.path.join(os.path.dirname(__file__), 'model_metadata.pkl')

# Simple session store (in production, use Redis or similar)
sessions = {}

# Initialize Python libraries
sentiment_analyzer = PythonSentimentAnalyzer()
ml_predictor = PythonBurnoutPredictor()

# Hash password
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Generate session token
def generate_token():
    return secrets.token_hex(32)

# Initialize database
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Users table for employees
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            department TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Managers table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS managers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            department TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Records table with employee_id reference
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER,
            employee_name TEXT,
            mood TEXT,
            work_hours REAL,
            sleep_hours REAL,
            fatigue INTEGER,
            experience REAL,
            feedback TEXT,
            sentiment TEXT,
            sentiment_score REAL,
            burnout_score REAL,
            burnout_level TEXT,
            suggestions TEXT,
            week_number INTEGER,
            day_of_week INTEGER,
            weekly_trend TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (employee_id) REFERENCES employees(id)
        )
    ''')
    
    # Insert default manager account if not exists
    try:
        cursor.execute('''
            INSERT OR IGNORE INTO managers (email, password, name, department)
            VALUES (?, ?, ?, ?)
        ''', ('admin@company.com', hash_password('admin123'), 'Admin Manager', 'HR'))
    except:
        pass
    
    conn.commit()
    conn.close()

# Load Python ML model
def load_model():
    # Try to load the real trained model using our Python library
    if ml_predictor.load_model(REAL_MODEL_PATH, SCALER_PATH, METADATA_PATH):
        print("✅ Python ML model loaded successfully!")
        print(f"📊 Model type: {ml_predictor.best_model_name}")
        print(f"🎯 Features: {ml_predictor.feature_columns}")
        return ml_predictor.best_model, ml_predictor.scaler, {
            'feature_columns': ml_predictor.feature_columns,
            'model_type': ml_predictor.best_model_name
        }
    
    # Fallback to original model or rule-based
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, 'rb') as f:
            print("⚠️ Using fallback model")
            return pickle.load(f), None, None
    
    print("⚠️ No model found, using rule-based system")
    return None, None, None

# Python sentiment analysis using our custom library
def analyze_sentiment(text):
    return sentiment_analyzer.analyze(text)

# Get week number and day of week
def get_week_info():
    now = datetime.now()
    week_number = now.isocalendar()[1]
    day_of_week = now.weekday()  # 0 = Monday, 6 = Sunday
    return week_number, day_of_week

# Get past week data for an employee
def get_weekly_data(employee_id, week_number):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT day_of_week, burnout_score, fatigue, work_hours, mood, sentiment
        FROM records 
        WHERE employee_id = ? AND week_number = ?
        ORDER BY day_of_week
    ''', (employee_id, week_number))
    rows = cursor.fetchall()
    conn.close()
    return rows

# Analyze weekly trend
def analyze_weekly_trend(employee_id, current_day, current_score, week_number):
    past_data = get_weekly_data(employee_id, week_number)
    
    if not past_data:
        return {
            'trend': 'baseline',
            'message': 'First assessment this week - establishing baseline.',
            'pattern': 'No pattern yet',
            'avg_score': current_score,
            'comparison': None
        }
    
    past_scores = [row[1] for row in past_data if row[0] < current_day]
    
    if not past_scores:
        return {
            'trend': 'baseline',
            'message': 'First assessment this week - establishing baseline.',
            'pattern': 'No pattern yet',
            'avg_score': current_score,
            'comparison': None
        }
    
    avg_past = sum(past_scores) / len(past_scores)
    diff = current_score - avg_past
    
    # Determine trend
    if diff > 10:
        trend = 'worsening'
        message = f'Your burnout level is increasing. Score is {abs(diff):.1f} points higher than your weekly average.'
    elif diff < -10:
        trend = 'improving'
        message = f'Great progress! Your burnout level is {abs(diff):.1f} points lower than your weekly average.'
    else:
        trend = 'stable'
        message = 'Your burnout level is relatively stable this week.'
    
    # Detect patterns
    patterns = []
    fatigue_values = [row[2] for row in past_data]
    work_hours_values = [row[3] for row in past_data]
    
    if len(fatigue_values) >= 2:
        if all(fatigue_values[i] <= fatigue_values[i+1] for i in range(len(fatigue_values)-1)):
            patterns.append('Fatigue increasing throughout the week')
        elif all(fatigue_values[i] >= fatigue_values[i+1] for i in range(len(fatigue_values)-1)):
            patterns.append('Fatigue decreasing - good recovery')
    
    if len(work_hours_values) >= 2:
        avg_hours = sum(work_hours_values) / len(work_hours_values)
        if avg_hours > 9:
            patterns.append('Consistently high work hours')
    
    pattern_str = '; '.join(patterns) if patterns else 'No significant patterns detected'
    
    return {
        'trend': trend,
        'message': message,
        'pattern': pattern_str,
        'avg_score': avg_past,
        'days_analyzed': len(past_scores),
        'comparison': {
            'current': current_score,
            'average': avg_past,
            'difference': diff
        }
    }

# Generate suggestions based on burnout level, sentiment, and weekly trend
def generate_suggestions(burnout_level, sentiment, weekly_trend=None):
    suggestions = []
    
    if burnout_level == 'High':
        suggestions.extend([
            "Take immediate rest and consider taking time off",
            "Speak with your manager about workload reduction",
            "Consider professional counseling or therapy",
            "Practice stress-relief techniques like meditation"
        ])
    elif burnout_level == 'Medium':
        suggestions.extend([
            "Schedule regular breaks throughout the day",
            "Set clear boundaries between work and personal time",
            "Engage in physical activities or exercise",
            "Connect with colleagues for support"
        ])
    else:
        suggestions.extend([
            "Maintain your current work-life balance",
            "Continue practicing healthy habits",
            "Stay connected with your team"
        ])
    
    if sentiment == 'Negative':
        suggestions.extend([
            "Consider talking to HR about your concerns",
            "Explore mental wellness resources",
            "Practice gratitude and positive thinking"
        ])
    
    # Add trend-based suggestions
    if weekly_trend:
        if weekly_trend.get('trend') == 'worsening':
            suggestions.insert(0, "Your burnout is increasing - take action today")
            suggestions.append("Review what changed this week and address it")
        elif weekly_trend.get('pattern') and 'high work hours' in weekly_trend.get('pattern', '').lower():
            suggestions.append("Consider reducing overtime hours")
    
    return suggestions

# Encode mood for model prediction
def encode_mood(mood):
    mood_map = {'Happy': 0, 'Okay': 1, 'Stressed': 2}
    return mood_map.get(mood, 1)

# Calculate burnout score using ML algorithms (no math ranges!)
def calculate_burnout(mood, work_hours, fatigue, experience, sentiment_score, model=None, scaler=None, metadata=None):
    print(f"🤖 Using ML Algorithm Calculator (No Math Ranges!)")
    print(f"   Input: {mood}, {work_hours}h, {fatigue}/10, {experience}y, sentiment={sentiment_score:.2f}")
    
    try:
        # Use ML algorithms for calculation
        burnout_score = calculate_burnout_with_ml(mood, work_hours, fatigue, experience, sentiment_score)
        print(f"   ML Result: {burnout_score:.2f}/10")
        return burnout_score
    except Exception as e:
        print(f"❌ ML Calculator Error: {e}")
        print("   Fallback to rule-based calculation")
        return calculate_rule_based_burnout_1_to_10(encode_mood(mood), work_hours, fatigue, experience, sentiment_score)

def calculate_rule_based_burnout_1_to_10(mood_encoded, work_hours, fatigue, experience, sentiment_score):
    """Rule-based burnout calculation on 1-10 scale"""
    base_score = 1.0  # Start at minimum
    
    # Mood impact (1-10 scale)
    mood_impact = [1.0, 3.0, 7.0][mood_encoded]  # Happy=1, Okay=3, Stressed=7
    base_score = max(base_score, mood_impact)
    
    # Work hours impact (major factor)
    if work_hours >= 15:
        base_score = max(base_score, 9.0)  # Very high hours
    elif work_hours >= 12:
        base_score = max(base_score, 8.0)  # High hours
    elif work_hours >= 10:
        base_score = max(base_score, 6.0)  # Moderate overtime
    elif work_hours >= 8:
        base_score = max(base_score, 4.0)  # Normal hours
    else:
        base_score = max(base_score, 2.0)  # Low hours
    
    # Fatigue impact (direct 1-10 mapping)
    base_score = max(base_score, fatigue)
    
    # Experience adjustment
    if experience < 1:
        base_score += 1.0  # New employee penalty
    elif experience > 5:
        base_score -= 1.0  # Experience bonus
    
    # Sentiment adjustment
    if sentiment_score < -0.3:  # Very negative
        base_score += 2.0
    elif sentiment_score < -0.1:  # Negative
        base_score += 1.0
    elif sentiment_score > 0.3:  # Very positive
        base_score -= 1.0
    elif sentiment_score > 0.1:  # Positive
        base_score -= 0.5
    
    # Ensure 1-10 range
    final_score = np.clip(base_score, 1.0, 10.0)
    
    print(f"📊 Rule-based: Mood={mood_encoded}, Hours={work_hours}, Fatigue={fatigue} → Score: {final_score:.1f}/10")
    
    return final_score

def calculate_rule_based_burnout(mood_encoded, work_hours, fatigue, experience, sentiment_score):
    base_score = 0
    base_score += mood_encoded * 12.5
    
    if work_hours > 10:
        base_score += 25
    elif work_hours > 8:
        base_score += (work_hours - 8) * 12.5
    
    base_score += fatigue * 3
    
    if experience < 1:
        base_score += 10
    elif experience > 5:
        base_score -= 5
    
    base_score -= sentiment_score * 10
    
    return min(max(base_score, 0), 100)

def get_burnout_level(score):
    """Get burnout level for 1-10 scale"""
    if score >= 8:
        return 'High'
    elif score >= 5:
        return 'Medium'
    else:
        return 'Low'

# Verify session
def verify_session(token, role='employee'):
    if token in sessions:
        session = sessions[token]
        if session['role'] == role or role == 'any':
            return session
    return None

# Initialize database on startup
init_db()

# Load model (returns model, scaler, metadata)
model, scaler, metadata = load_model()

@app.route('/health')
def health():
    return jsonify({'status': 'healthy', 'model_loaded': model is not None})

# Employee Registration
@app.route('/auth/employee/register', methods=['POST'])
def employee_register():
    try:
        data = request.json
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        name = data.get('name', '').strip()
        department = data.get('department', '').strip()
        
        if not email or not password or not name:
            return jsonify({'error': 'Email, password, and name are required'}), 400
        
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check if email already exists
        cursor.execute('SELECT id FROM employees WHERE email = ?', (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({'error': 'Email already registered'}), 400
        
        # Insert new employee
        cursor.execute('''
            INSERT INTO employees (email, password, name, department)
            VALUES (?, ?, ?, ?)
        ''', (email, hash_password(password), name, department))
        conn.commit()
        employee_id = cursor.lastrowid
        conn.close()
        
        # Create session
        token = generate_token()
        sessions[token] = {
            'id': employee_id,
            'email': email,
            'name': name,
            'department': department,
            'role': 'employee'
        }
        
        return jsonify({
            'message': 'Registration successful',
            'token': token,
            'user': {
                'id': employee_id,
                'email': email,
                'name': name,
                'department': department,
                'role': 'employee'
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Employee Login
@app.route('/auth/employee/login', methods=['POST'])
def employee_login():
    try:
        data = request.json
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('SELECT id, email, name, department FROM employees WHERE email = ? AND password = ?', 
                      (email, hash_password(password)))
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        token = generate_token()
        sessions[token] = {
            'id': user[0],
            'email': user[1],
            'name': user[2],
            'department': user[3],
            'role': 'employee'
        }
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user[0],
                'email': user[1],
                'name': user[2],
                'department': user[3],
                'role': 'employee'
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Manager Login
@app.route('/auth/manager/login', methods=['POST'])
def manager_login():
    try:
        data = request.json
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute('SELECT id, email, name FROM managers WHERE email = ? AND password = ?', 
                      (email, hash_password(password)))
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        token = generate_token()
        sessions[token] = {
            'id': user[0],
            'email': user[1],
            'name': user[2],
            'role': 'manager'
        }
        
        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': user[0],
                'email': user[1],
                'name': user[2],
                'role': 'manager'
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Logout
@app.route('/auth/logout', methods=['POST'])
def logout():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if token in sessions:
        del sessions[token]
    return jsonify({'message': 'Logged out successfully'})

# Verify token
@app.route('/auth/verify', methods=['GET'])
def verify_token():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    session = verify_session(token, 'any')
    if session:
        return jsonify({'valid': True, 'user': session})
    return jsonify({'valid': False}), 401

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Verify employee session
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        session = verify_session(token, 'employee')
        
        if not session:
            return jsonify({'error': 'Unauthorized. Please login.'}), 401
        
        data = request.json
        
        employee_id = session['id']
        employee_name = session['name']
        mood = data.get('mood', 'Okay')
        work_hours = float(data.get('work_hours', 8))
        sleep_hours = float(data.get('sleep_hours', 7))
        fatigue = int(data.get('fatigue', 5))
        experience = float(data.get('experience', 1))
        feedback = data.get('feedback', '')
        
        if fatigue < 0 or fatigue > 10:
            return jsonify({'error': 'Fatigue must be between 0 and 10'}), 400
        if work_hours < 0 or work_hours > 24:
            return jsonify({'error': 'Work hours must be between 0 and 24'}), 400
        if sleep_hours < 0 or sleep_hours > 24:
            return jsonify({'error': 'Sleep hours must be between 0 and 24'}), 400
        if experience < 0:
            return jsonify({'error': 'Experience cannot be negative'}), 400
        
        # Check if employee already submitted today
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT COUNT(*) FROM records 
            WHERE employee_id = ? AND submission_date = DATE('now')
        ''', (employee_id,))
        today_submission = cursor.fetchone()[0]
        
        if today_submission > 0:
            conn.close()
            return jsonify({'error': 'You have already submitted your assessment today. Please come back tomorrow.'}), 400
        
        conn.close()
        
        # Get submission date
        submission_date = datetime.now().strftime("%Y-%m-%d")
        day_of_week = datetime.now().weekday()  # 0=Monday, 1=Tuesday, etc.
        
        # Analyze sentiment
        sentiment, sentiment_score = analyze_sentiment(feedback)
        
        # Calculate burnout score (with real model support)
        burnout_score = calculate_burnout(mood, work_hours, fatigue, experience, sentiment_score, model, scaler, metadata)
        burnout_level = get_burnout_level(burnout_score)
        
        # Generate advanced AI-powered suggestions with trend analysis
        current_data = {
            'employee_name': employee_name,
            'mood': mood,
            'work_hours': work_hours,
            'sleep_hours': sleep_hours,
            'fatigue': fatigue,
            'burnout_score': burnout_score,
            'burnout_level': burnout_level,
            'sentiment': sentiment,
            'feedback': feedback,
            'submission_date': submission_date
        }
        
        suggestions_list = get_advanced_suggestions_with_analysis(employee_id, current_data)
        
        if suggestions_list:
            suggestions = '|'.join(suggestions_list)
        else:
            # Fallback to original suggestions if AI fails
            suggestions = generate_suggestions(burnout_level, sentiment)
            suggestions = '|'.join(suggestions)
        
        # Insert record with new structure
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO records (
                employee_id, employee_name, mood, work_hours, sleep_hours, fatigue, experience, feedback,
                sentiment, sentiment_score, burnout_score, burnout_level, suggestions,
                submission_date, day_of_week
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            employee_id, employee_name, mood, work_hours, sleep_hours, fatigue, experience, feedback,
            sentiment, sentiment_score, burnout_score, burnout_level, suggestions,
            submission_date, day_of_week
        ))
        
        record_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Get day name
        day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        
        return jsonify({
            'id': record_id,
            'employee_name': employee_name,
            'mood': mood,
            'work_hours': work_hours,
            'sleep_hours': sleep_hours,
            'fatigue': fatigue,
            'experience': experience,
            'feedback': feedback,
            'sentiment': sentiment,
            'sentiment_score': sentiment_score,
            'burnout_score': burnout_score,
            'burnout_level': burnout_level,
            'suggestions': suggestions.split('|'),
            'submission_date': submission_date,
            'day_of_week': day_names[day_of_week]
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get employee's own history with enhanced analytics
@app.route('/my-records')
def get_my_records():
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        session = verify_session(token, 'employee')
        
        if not session:
            return jsonify({'error': 'Unauthorized'}), 401
        
        employee_id = session['id']
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, employee_name, work_hours, sleep_hours, fatigue, experience, feedback,
                   sentiment, sentiment_score, burnout_score, burnout_level, suggestions,
                   submission_date, day_of_week
            FROM records 
            WHERE employee_id = ? 
            ORDER BY submission_date DESC
        ''', (employee_id,))
        
        records = []
        for row in cursor.fetchall():
            records.append({
                'id': row[0],
                'employee_name': row[1],
                'work_hours': row[2],
                'sleep_hours': row[3],
                'fatigue': row[4],
                'experience': row[5],
                'feedback': row[6],
                'sentiment': row[7],
                'sentiment_score': row[8],
                'burnout_score': row[9],
                'burnout_level': row[10],
                'suggestions': row[11],
                'submission_date': row[12],
                'day_of_week': row[13]
            })
        
        conn.close()
        
        return jsonify({'records': records})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/records')
def get_records():
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        session = verify_session(token, 'manager')
        
        if not session:
            return jsonify({'error': 'Unauthorized'}), 401
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, employee_name, mood, work_hours, sleep_hours, fatigue, experience, feedback,
                   sentiment, sentiment_score, burnout_score, burnout_level, suggestions,
                   submission_date, day_of_week
            FROM records 
            ORDER BY submission_date DESC
        ''')
        
        records = []
        for row in cursor.fetchall():
            records.append({
                'id': row[0],
                'employee_name': row[1],
                'mood': row[2],
                'work_hours': row[3],
                'sleep_hours': row[4],
                'fatigue': row[5],
                'experience': row[6],
                'feedback': row[7],
                'sentiment': row[8],
                'sentiment_score': row[9],
                'burnout_score': row[10],
                'burnout_level': row[11],
                'suggestions': row[12],
                'submission_date': row[13],
                'day_of_week': row[14]
            })
        
        conn.close()
        
        return jsonify(records)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get statistics for manager dashboard
@app.route('/stats')
def get_stats():
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        session = verify_session(token, 'manager')
        
        if not session:
            return jsonify({'error': 'Unauthorized'}), 401
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Get total employees
        cursor.execute('SELECT COUNT(DISTINCT employee_id) FROM records')
        total_employees = cursor.fetchone()[0]
        
        # Get total assessments
        cursor.execute('SELECT COUNT(*) FROM records')
        total_assessments = cursor.fetchone()[0]
        
        # Get burnout distribution
        cursor.execute('''
            SELECT burnout_level, COUNT(*) as count 
            FROM records 
            GROUP BY burnout_level
        ''')
        burnout_stats = dict(cursor.fetchall())
        
        high_burnout = burnout_stats.get('High', 0)
        medium_burnout = burnout_stats.get('Medium', 0)
        low_burnout = burnout_stats.get('Low', 0)
        
        # Get average burnout score
        cursor.execute('SELECT AVG(burnout_score) FROM records')
        avg_burnout = cursor.fetchone()[0] or 0
        
        # Get recent records
        cursor.execute('''
            SELECT employee_name, burnout_score, burnout_level, submission_date
            FROM records 
            ORDER BY submission_date DESC 
            LIMIT 50
        ''')
        
        recent_records = []
        for row in cursor.fetchall():
            recent_records.append({
                'employee_name': row[0],
                'burnout_score': row[1],
                'burnout_level': row[2],
                'submission_date': row[3]
            })
        
        # Get scatter data for charts
        cursor.execute('''
            SELECT work_hours, fatigue, burnout_level
            FROM records 
        ''')
        scatter_data = []
        for row in cursor.fetchall():
            scatter_data.append({
                'work_hours': row[0],
                'fatigue': row[1],
                'burnout_level': row[2]
            })
        
        # Get employee submission dates
        cursor.execute('''
            SELECT employee_name, submission_date, COUNT(*) as submissions
            FROM records 
            GROUP BY employee_name, submission_date
            ORDER BY employee_name, submission_date DESC
        ''')
        
        submission_dates = {}
        for row in cursor.fetchall():
            employee_name = row[0]
            if employee_name not in submission_dates:
                submission_dates[employee_name] = []
            submission_dates[employee_name].append({
                'date': row[1],
                'submissions': row[2]
            })
        
        conn.close()
        
        # Generate charts using Python libraries
        try:
            charts = generate_manager_charts()
        except Exception as e:
            print(f"Chart generation error: {e}")
            charts = {
                'pie_chart': None,
                'scatter_chart': None,
                'burnout_data': burnout_stats,
                'scatter_data': scatter_data
            }
        
        return jsonify({
            'total_employees': total_employees,
            'total_assessments': total_assessments,
            'high_burnout': high_burnout,
            'medium_burnout': medium_burnout,
            'low_burnout': low_burnout,
            'avg_burnout': round(avg_burnout, 1),
            'burnout_distribution': burnout_stats,
            'recent_records': recent_records,
            'scatter_data': scatter_data,
            'charts': charts,
            'submission_dates': submission_dates
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    current_week = datetime.now().isocalendar()[1]
    last_week = current_week - 1
    
    current_week_records = [r for r in records if r['week_number'] == current_week]
    last_week_records = [r for r in records if r['week_number'] == last_week]
    
    week_comparison = None
    if current_week_records and last_week_records:
        current_avg = sum(r['burnout_score'] for r in current_week_records) / len(current_week_records)
        last_avg = sum(r['burnout_score'] for r in last_week_records) / len(last_week_records)
        
        change = current_avg - last_avg
        trend = 'improving' if change < -0.5 else 'declining' if change > 0.5 else 'stable'
        
        week_comparison = {
            'current_week_avg': round(current_avg, 1),
            'last_week_avg': round(last_avg, 1),
            'change': round(change, 1),
            'trend': trend
        }
    
    # Alert system - check for 1 week of high burnout without improvement
    alert = None
    if len(weekly_trend) >= 7:
        high_burnout_days = sum(1 for day in weekly_trend if day['score'] >= 8)
        
        if high_burnout_days >= 7:
            alert = "No improvement detected for 1 week. Immediate attention required."
        elif high_burnout_days >= 5:
            alert = "High burnout levels detected for most of the week. Consider taking action."
    
    return {
        'burnout_distribution': distribution,
        'weekly_trend': weekly_trend,
        'week_comparison': week_comparison,
        'alert': alert
    }

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
