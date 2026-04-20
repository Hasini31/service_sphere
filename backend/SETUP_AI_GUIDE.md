# 🤖 AI Suggestions Setup Guide

## 🚀 Quick Setup (5 Minutes)

### **🔑 Step 1: Get Your FREE Gemini API Key**

1. **Go to**: https://aistudio.google.com/app/apikey
2. **Sign in** with your Google account
3. **Click "Create API Key"**
4. **Name it**: `Burnout Detection App`
5. **Copy the key** (starts with `AIza...`)

### **🔧 Step 2: Add API Key (Choose ONE option)**

#### **Option A: Environment Variable (Recommended)**
```bash
# Windows Command Prompt
set GEMINI_API_KEY=AIzaSyD_your_actual_key_here

# Or create .env file in backend folder
GEMINI_API_KEY=AIzaSyD_your_actual_key_here
```

#### **Option B: Config File (Easy)**
Create `config.py` in backend folder:
```python
GEMINI_CONFIG = {
    'api_key': 'AIzaSyD_your_actual_key_here',
    'model': 'gemini-pro'
}
```

#### **Option C: Direct in Code (Quick Test)**
In `main.py` (temporary for testing):
```python
GEMINI_API_KEY = "AIzaSyD_your_actual_key_here"
```

## ✅ What AI Suggestions Provide

### **🎯 Personalized & Contextual**
- Uses your actual mood, work hours, fatigue, sleep hours
- Analyzes your feedback text for patterns
- Considers burnout level for urgency
- Provides 3-4 specific, actionable suggestions

### **📝 Example AI Output**
```
1. Immediate action required: Your high burnout level needs attention today
2. Consider discussing workload reduction with your manager (you worked 11 hours today)
3. Prioritize rest: Your fatigue level of 8/10 indicates exhaustion
4. Schedule a wellness check-in with HR this week
```

### **🔄 Fallback System**
If AI is unavailable, uses enhanced logic:
- Work hours + fatigue correlation analysis
- Mood-specific recommendations
- Sentiment-based advice
- Burnout level prioritization

## 🧪 Test the System

After setting up your API key:

```bash
cd backend
python ai_suggestions.py
```

This will test the AI system and show you personalized suggestions!

## 🔒 Security Notes

- **Never commit API keys** to version control
- **Use environment variables** in production
- **API keys are free** for Gemini (no cost concern)

## 🚀 Ready to Use

Once you add your API key, the system will automatically:
1. ✅ Generate personalized suggestions using Gemini AI
2. ✅ Fall back to enhanced logic if AI is unavailable
3. ✅ Provide contextual, actionable advice
4. ✅ Update suggestions in real-time based on employee data

**Get your FREE API key now and start using AI-powered suggestions!** 🎯✨
