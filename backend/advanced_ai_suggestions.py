"""
Advanced AI suggestions with trend analysis and historical data
"""

import os
import google.generativeai as genai
import re
from dotenv import load_dotenv
import sqlite3

# Load environment variables from .env file
load_dotenv()

def get_employee_history(employee_id):
    """Get employee's previous assessment data for trend analysis"""
    try:
        DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT submission_date, burnout_score, burnout_level, mood, work_hours, fatigue, sleep_hours, sentiment, feedback
            FROM records 
            WHERE employee_id = ? 
            ORDER BY submission_date DESC 
            LIMIT 7
        ''', (employee_id,))
        
        history = []
        for row in cursor.fetchall():
            history.append({
                'submission_date': row[0],
                'burnout_score': row[1],
                'burnout_level': row[2],
                'mood': row[3],
                'work_hours': row[4],
                'fatigue': row[5],
                'sleep_hours': row[6],
                'sentiment': row[7],
                'feedback': row[8]
            })
        
        conn.close()
        return history
    except Exception as e:
        print(f"❌ Error getting employee history: {e}")
        return []

def analyze_trends(history):
    """Analyze trends in employee data"""
    if not history:
        return {
            'trends': {
                'burnout_trend': 'stable',
                'work_hours_trend': 'stable',
                'fatigue_trend': 'stable',
                'sleep_trend': 'stable',
                'mood_trend': 'stable'
            },
            'patterns': [],
            'data_points': 0,
            'avg_burnout': 0,
            'avg_work_hours': 0,
            'avg_fatigue': 0,
            'avg_sleep': 0
        }
    
    # Calculate trends
    trends = {
        'burnout_trend': 'stable',
        'work_hours_trend': 'stable',
        'fatigue_trend': 'stable',
        'sleep_trend': 'stable',
        'mood_trend': 'stable'
    }
    
    if len(history) >= 2:
        # Burnout trend
        recent_scores = [h['burnout_score'] for h in history[:3]]
        if len(recent_scores) >= 2:
            if recent_scores[0] > recent_scores[-1]:
                trends['burnout_trend'] = 'improving'
            elif recent_scores[0] < recent_scores[-1]:
                trends['burnout_trend'] = 'worsening'
        
        # Work hours trend
        recent_hours = [h['work_hours'] for h in history[:3]]
        if len(recent_hours) >= 2:
            if recent_hours[0] > recent_hours[-1]:
                trends['work_hours_trend'] = 'decreasing'
            elif recent_hours[0] < recent_hours[-1]:
                trends['work_hours_trend'] = 'increasing'
        
        # Fatigue trend
        recent_fatigue = [h['fatigue'] for h in history[:3]]
        if len(recent_fatigue) >= 2:
            if recent_fatigue[0] > recent_fatigue[-1]:
                trends['fatigue_trend'] = 'improving'
            elif recent_fatigue[0] < recent_fatigue[-1]:
                trends['fatigue_trend'] = 'worsening'
        
        # Sleep trend
        recent_sleep = [h['sleep_hours'] for h in history[:3]]
        if len(recent_sleep) >= 2:
            if recent_sleep[0] < recent_sleep[-1]:
                trends['sleep_trend'] = 'improving'
            elif recent_sleep[0] > recent_sleep[-1]:
                trends['sleep_trend'] = 'worsening'
    
    # Identify patterns
    patterns = []
    
    # High work hours pattern
    high_work_days = [h for h in history if h['work_hours'] > 10]
    if len(high_work_days) >= 3:
        patterns.append("Consistently working long hours (>10h)")
    
    # High fatigue pattern
    high_fatigue_days = [h for h in history if h['fatigue'] >= 7]
    if len(high_fatigue_days) >= 3:
        patterns.append("Frequently experiencing high fatigue (>=7/10)")
    
    # Poor sleep pattern
    poor_sleep_days = [h for h in history if h['sleep_hours'] < 6]
    if len(poor_sleep_days) >= 3:
        patterns.append("Consistently getting insufficient sleep (<6h)")
    
    # Negative mood pattern
    negative_mood_days = [h for h in history if h['mood'].lower() in ['stressed', 'anxious', 'overwhelmed']]
    if len(negative_mood_days) >= 4:
        patterns.append("Frequently reporting negative mood states")
    
    # High burnout pattern
    high_burnout_days = [h for h in history if h['burnout_level'] in ['High', 'Medium']]
    if len(high_burnout_days) >= 4:
        patterns.append("Consistently experiencing elevated burnout levels")
    
    return {
        'trends': trends,
        'patterns': patterns,
        'data_points': len(history),
        'avg_burnout': sum(h['burnout_score'] for h in history) / len(history) if history else 0,
        'avg_work_hours': sum(h['work_hours'] for h in history) / len(history) if history else 0,
        'avg_fatigue': sum(h['fatigue'] for h in history) / len(history) if history else 0,
        'avg_sleep': sum(h['sleep_hours'] for h in history) / len(history) if history else 0
    }

def init_gemini():
    """Initialize Gemini AI with API key from environment or config"""
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        try:
            import config
            api_key = getattr(config, 'GEMINI_CONFIG', {}).get('api_key')
        except (ImportError, AttributeError):
            pass
    
    if not api_key:
        print("⚠️  Gemini API key not found!")
        return None
    
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')
    except Exception as e:
        print(f"❌ Gemini initialization failed: {e}")
        return None

def generate_advanced_ai_suggestions(employee_id, current_data, history_analysis):
    """Generate advanced AI suggestions with trend analysis"""
    
    model = init_gemini()
    if not model:
        return None
    
    # Create comprehensive analysis prompt
    prompt = f"""
    You are an expert workplace wellness analyst and mental health professional. 

    Analyze this employee's comprehensive wellness data and provide highly personalized, actionable recommendations:

    EMPLOYEE PROFILE:
    - Name: {current_data.get('employee_name', 'Employee')}
    - Current Assessment Date: {current_data.get('submission_date', 'Today')}
    
    TODAY'S DATA:
    - Current Mood: {current_data.get('mood', 'N/A')}
    - Work Hours: {current_data.get('work_hours', 'N/A')} hours
    - Sleep Hours: {current_data.get('sleep_hours', 'N/A')} hours
    - Fatigue Level: {current_data.get('fatigue', 'N/A')}/10
    - Current Burnout Score: {current_data.get('burnout_score', 'N/A')}
    - Current Burnout Level: {current_data.get('burnout_level', 'N/A')}
    - Sentiment Analysis: {current_data.get('sentiment', 'N/A')}
    - Employee Feedback: "{current_data.get('feedback', 'No feedback')}"
    
    HISTORICAL ANALYSIS (Last {history_analysis['data_points']} assessments):
    - Average Burnout Score: {history_analysis['avg_burnout']:.2f}
    - Average Work Hours: {history_analysis['avg_work_hours']:.1f} hours
    - Average Fatigue: {history_analysis['avg_fatigue']:.1f}/10
    - Average Sleep: {history_analysis['avg_sleep']:.1f} hours
    
    TREND ANALYSIS:
    - Burnout Trend: {history_analysis['trends']['burnout_trend']}
    - Work Hours Trend: {history_analysis['trends']['work_hours_trend']}
    - Fatigue Trend: {history_analysis['trends']['fatigue_trend']}
    - Sleep Trend: {history_analysis['trends']['sleep_trend']}
    
    IDENTIFIED PATTERNS:
    {chr(10).join(f"- {pattern}" for pattern in history_analysis['patterns']) if history_analysis['patterns'] else "- No concerning patterns identified"}
    
    COMPREHENSIVE ANALYSIS REQUIREMENTS:
    
    1. IMMEDIATE ACTIONS (Based on today's data):
       - Address current burnout level urgency
       - Consider today's work hours impact
       - Factor in current fatigue and sleep quality
       - Respond to current mood and sentiment
    
    2. TREND-BASED RECOMMENDATIONS:
       - If burnout is worsening: Prioritize immediate intervention
       - If work hours increasing: Address workload management
       - If fatigue worsening: Focus on rest and recovery
       - If sleep declining: Prioritize sleep hygiene
    
    3. PATTERN-BASED INSIGHTS:
       - Address identified patterns with specific solutions
       - Provide breaking strategies for concerning patterns
       - Suggest preventive measures for recurring issues
    
    4. PERSONALIZED ACTION PLAN:
       - Create 3-4 specific, actionable steps
       - Include both immediate and long-term actions
       - Consider employee's specific patterns and trends
       - Provide resources and support options
    
    5. MONITORING RECOMMENDATIONS:
       - Suggest what to track going forward
       - Provide indicators for improvement
       - Recommend when to seek professional help
    
    OUTPUT FORMAT:
    Provide exactly 4 numbered, actionable suggestions that are:
    - Highly personalized to this employee's specific situation
    - Context-aware of their trends and patterns
    - Actionable with clear next steps
    - Supportive and professional in tone
    
    Each suggestion should reference their specific data (trends, patterns, today's metrics).
    """
    
    try:
        response = model.generate_content(prompt)
        ai_suggestions = response.text
        
        # Extract numbered suggestions
        suggestions = []
        lines = ai_suggestions.split('\n')
        
        for line in lines:
            # Look for numbered items or complete sentences
            match = re.match(r'^\d+\.\s*(.+)', line.strip())
            if match:
                suggestion = match.group(1).strip()
                if suggestion and len(suggestion) > 15:  # Filter out very short suggestions
                    suggestions.append(suggestion)
            elif len(line.strip()) > 20:  # Add complete sentences as suggestions
                suggestions.append(line.strip())
        
        # Ensure we have 4 suggestions
        return suggestions[:4] if suggestions else None
        
    except Exception as e:
        print(f"❌ Advanced AI suggestion generation failed: {e}")
        return None

def get_advanced_suggestions_with_analysis(employee_id, current_data):
    """Get advanced AI suggestions with comprehensive analysis"""
    
    print("🤖 Generating Advanced AI Suggestions with Trend Analysis...")
    
    # Get employee history
    history = get_employee_history(employee_id)
    
    # Analyze trends and patterns
    history_analysis = analyze_trends(history)
    
    print(f"📊 Historical Analysis: {history_analysis['data_points']} data points")
    print(f"📈 Burnout Trend: {history_analysis['trends']['burnout_trend']}")
    print(f"🔍 Patterns Found: {len(history_analysis['patterns'])}")
    
    # Try AI suggestions first
    ai_suggestions = generate_advanced_ai_suggestions(employee_id, current_data, history_analysis)
    
    if ai_suggestions:
        print("✅ Advanced AI suggestions generated successfully")
        return ai_suggestions
    else:
        print("⚠️  AI unavailable, using enhanced fallback with trend analysis")
        return generate_enhanced_fallback_suggestions(current_data, history_analysis)

def generate_enhanced_fallback_suggestions(current_data, history_analysis):
    """Generate enhanced fallback suggestions with trend analysis"""
    
    suggestions = []
    burnout_level = current_data.get('burnout_level', 'Low')
    mood = current_data.get('mood', 'Okay')
    work_hours = current_data.get('work_hours', 8)
    fatigue = current_data.get('fatigue', 5)
    sleep_hours = current_data.get('sleep_hours', 7)
    
    # Trend-aware suggestions
    if history_analysis['trends']['burnout_trend'] == 'worsening':
        suggestions.append(f"URGENT: Your burnout is worsening over time (avg: {history_analysis['avg_burnout']:.1f}). Immediate action required today.")
    elif history_analysis['trends']['burnout_trend'] == 'improving':
        suggestions.append(f"POSITIVE: Your burnout is improving (avg: {history_analysis['avg_burnout']:.1f}). Continue current strategies.")
    
    # Work hours trend suggestions
    if history_analysis['trends']['work_hours_trend'] == 'increasing':
        suggestions.append(f"WORKLOAD ALERT: Your work hours are increasing (avg: {history_analysis['avg_work_hours']:.1f}h). Consider workload reduction.")
    elif work_hours > 10:
        suggestions.append(f"LONG HOURS: Today's {work_hours}h exceeds healthy limits. Plan for shorter workdays.")
    
    # Fatigue trend suggestions
    if history_analysis['trends']['fatigue_trend'] == 'worsening':
        suggestions.append(f"FATIGUE CONCERN: Your fatigue is trending upward (avg: {history_analysis['avg_fatigue']:.1f}/10). Prioritize rest.")
    elif fatigue >= 8:
        suggestions.append(f"HIGH FATIGUE: Current {fatigue}/10 indicates exhaustion. Consider immediate recovery time.")
    
    # Sleep trend suggestions
    if history_analysis['trends']['sleep_trend'] == 'worsening':
        suggestions.append(f"SLEEP DECLINE: Your sleep is decreasing (avg: {history_analysis['avg_sleep']:.1f}h). Focus on sleep hygiene.")
    elif sleep_hours < 6:
        suggestions.append(f"INSUFFICIENT SLEEP: Only {sleep_hours}h last night. Aim for 7-8 hours for recovery.")
    
    # Pattern-based suggestions
    if "Consistently working long hours" in history_analysis['patterns']:
        suggestions.append("PATTERN: You consistently work long hours. Discuss workload redistribution with your manager.")
    
    if "Frequently experiencing high fatigue" in history_analysis['patterns']:
        suggestions.append("PATTERN: High fatigue is recurring. Consider energy management and regular breaks.")
    
    if "Consistently getting insufficient sleep" in history_analysis['patterns']:
        suggestions.append("PATTERN: Poor sleep is affecting performance. Establish consistent sleep schedule.")
    
    # Burnout level specific suggestions
    if burnout_level == 'High':
        suggestions.append("HIGH BURNOUT: Immediate action required. Schedule meeting with HR and consider time off.")
    elif burnout_level == 'Medium':
        suggestions.append("MEDIUM BURNOUT: Be proactive with stress management and workload boundaries.")
    
    # Ensure we have 4 suggestions
    return suggestions[:4]

# Test function
def test_advanced_ai_system():
    """Test the advanced AI suggestion system"""
    print("🧪 Testing Advanced AI System with Trend Analysis")
    print("=" * 60)
    
    # Test data
    test_employee_id = 1  # Alice
    test_current_data = {
        'employee_name': 'Alice Johnson',
        'mood': 'Stressed',
        'work_hours': 11,
        'sleep_hours': 5,
        'fatigue': 8,
        'burnout_score': 8.5,
        'burnout_level': 'High',
        'sentiment': 'Negative',
        'feedback': 'Feeling overwhelmed with increasing workload and poor sleep',
        'submission_date': '2026-04-04'
    }
    
    suggestions = get_advanced_suggestions_with_analysis(test_employee_id, test_current_data)
    
    if suggestions:
        print("✅ Advanced suggestions generated:")
        for i, suggestion in enumerate(suggestions, 1):
            print(f"   {i}. {suggestion}")
    else:
        print("❌ Failed to generate suggestions")
    
    print(f"\n🔑 API Key Status: {'✅ Configured' if os.getenv('GEMINI_API_KEY') else '❌ Not found'}")

if __name__ == "__main__":
    test_advanced_ai_system()
