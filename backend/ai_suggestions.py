"""
AI-powered personalized suggestions using Gemini AI
"""

import os
import google.generativeai as genai
import re
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Gemini with API key
def init_gemini():
    """Initialize Gemini AI with API key from environment or config"""
    api_key = os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        # Try to read from config file
        try:
            import config
            api_key = getattr(config, 'GEMINI_CONFIG', {}).get('api_key')
        except (ImportError, AttributeError):
            pass
    
    if not api_key:
        print("⚠️  Gemini API key not found!")
        print("📋 To get your FREE API key:")
        print("   1. Go to: https://aistudio.google.com/app/apikey")
        print("   2. Sign in with your Google account")
        print("   3. Click 'Create API Key'")
        print("   4. Name it 'Burnout Detection App'")
        print("   5. Copy the key (starts with 'AIza')")
        print("   6. Set environment variable: set GEMINI_API_KEY=your-key")
        print("   7. Or create config.py with GEMINI_CONFIG = {'api_key': 'your-key'}")
        return None
    
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
    except Exception as e:
        print(f"❌ Gemini initialization failed: {e}")
        return None

def generate_ai_suggestions(burnout_level, mood, work_hours, fatigue, sleep_hours, sentiment, feedback):
    """Generate personalized suggestions using Gemini AI"""
    
    model = init_gemini()
    if not model:
        return None
    
    # Create personalized prompt
    prompt = f"""
    You are a workplace wellness expert and mental health professional. 

    Based on this employee wellness assessment data, provide 3-4 specific, actionable, and personalized suggestions:

    EMPLOYEE DATA:
    • Burnout Level: {burnout_level} (Score: {getattr(locals(), 'burnout_score', 'N/A')})
    • Current Mood: {mood}
    • Work Hours: {work_hours} hours per day
    • Sleep Hours: {sleep_hours} hours per night
    • Fatigue Level: {fatigue}/10
    • Sentiment Analysis: {sentiment}
    • Employee Feedback: "{feedback}"

    GUIDELINES FOR SUGGESTIONS:
    1. Be specific and actionable (not generic advice)
    2. Personalize to their exact situation
    3. Consider their work hours, fatigue, and mood together
    4. Include immediate steps they can take today
    5. Be supportive and professional in tone
    6. Focus on prevention and early intervention
    7. Consider work-life balance implications

    PRIORITY AREAS:
    - If fatigue > 7: Focus on rest and recovery
    - If work hours > 10: Address workload management
    - If mood is negative/stressed: Prioritize stress reduction
    - If burnout is High: Immediate action required

    Please provide exactly 3-4 numbered suggestions with this format:
    1. [Specific actionable suggestion]
    2. [Specific actionable suggestion] 
    3. [Specific actionable suggestion]
    4. [Specific actionable suggestion if needed]

    Make each suggestion personalized to their data and immediately useful.
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
                if suggestion and len(suggestion) > 10:  # Filter out very short suggestions
                    suggestions.append(suggestion)
            elif len(line.strip()) > 20:  # Add complete sentences as suggestions
                suggestions.append(line.strip())
        
        # Ensure we have 3-4 suggestions
        return suggestions[:4] if suggestions else None
        
    except Exception as e:
        print(f"❌ AI suggestion generation failed: {e}")
        return None

def generate_fallback_suggestions(burnout_level, mood, work_hours, fatigue, sentiment):
    """Generate enhanced fallback suggestions when AI is unavailable"""
    
    suggestions = []
    
    # Base suggestions by burnout level
    if burnout_level == 'High':
        suggestions.extend([
            f"Immediate action required: Your {burnout_level.lower()} burnout level needs attention today",
            f"Consider discussing workload reduction with your manager (you worked {work_hours} hours today)",
            f"Prioritize rest: Your fatigue level of {fatigue}/10 indicates exhaustion"
            "Schedule a wellness check-in with HR this week"
        ])
    elif burnout_level == 'Medium':
        suggestions.extend([
            f"Maintain awareness: Your {mood.lower()} mood with {fatigue}/10 fatigue needs monitoring",
            f"Work-life balance: {work_hours} hours is manageable but watch for increases",
            "Implement micro-breaks every 90 minutes during work hours",
            "Consider stress management techniques like deep breathing or short walks"
        ])
    else:  # Low burnout
        suggestions.extend([
            f"Good foundation: Your {mood.lower()} mood and {work_hours} hours are sustainable",
            f"Prevention focus: Maintain current healthy habits and boundaries",
            f"Sleep optimization: {fatigue}/10 fatigue suggests good recovery patterns",
            "Continue regular check-ins to maintain this positive trajectory"
        ])
    
    # Add sentiment-specific suggestions
    if sentiment == 'Negative':
        suggestions.append("Address negative feelings: Consider talking to someone you trust about work stress")
        suggestions.append("Mental wellness: Explore company EAP resources or professional support options")
    
    # Add fatigue-specific suggestions
    if fatigue >= 8:
        suggestions.append("High fatigue detected: Prioritize sleep quality and consider shorter work duration")
    
    # Add work-hours specific suggestions
    if work_hours >= 12:
        suggestions.append("Long work hours: Ensure adequate breaks and avoid overtime when possible")
    
    return suggestions[:4]  # Return top 4 suggestions

def get_suggestions_with_ai(burnout_level, mood, work_hours, fatigue, sleep_hours, sentiment, feedback, burnout_score):
    """Get AI suggestions with fallback to enhanced logic"""
    
    print("🤖 Generating AI-powered personalized suggestions...")
    
    # Try AI suggestions first
    ai_suggestions = generate_ai_suggestions(
        burnout_level, mood, work_hours, fatigue, sleep_hours, sentiment, feedback
    )
    
    if ai_suggestions:
        print("✅ AI suggestions generated successfully")
        return ai_suggestions
    else:
        print("⚠️  AI unavailable, using enhanced fallback suggestions")
        return generate_fallback_suggestions(burnout_level, mood, work_hours, fatigue, sentiment)

# Test function
def test_ai_suggestions():
    """Test the AI suggestion system"""
    print("🧪 Testing AI Suggestions System")
    print("=" * 50)
    
    # Test data
    test_data = {
        'burnout_level': 'High',
        'mood': 'Stressed',
        'work_hours': 11,
        'fatigue': 8,
        'sleep_hours': 6,
        'sentiment': 'Negative',
        'feedback': 'Feeling overwhelmed with workload and struggling to maintain work-life balance',
        'burnout_score': 8.5
    }
    
    suggestions = get_suggestions_with_ai(**test_data)
    
    if suggestions:
        print("✅ Suggestions generated:")
        for i, suggestion in enumerate(suggestions, 1):
            print(f"   {i}. {suggestion}")
    else:
        print("❌ Failed to generate suggestions")
    
    print("\n🔑 API Key Status:")
    if os.getenv('GEMINI_API_KEY'):
        print("✅ Gemini API key configured")
    else:
        print("❌ Gemini API key not found")
        print("📋 Follow steps above to get your FREE API key")

if __name__ == "__main__":
    test_ai_suggestions()
