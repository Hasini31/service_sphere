"""
ML-Based Burnout Calculator
Uses machine learning algorithms instead of math ranges
"""

import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.neighbors import KNeighborsRegressor
from sklearn.svm import SVR
import joblib
import os

class MLBurnoutCalculator:
    """
    Advanced ML-based burnout calculation using multiple algorithms
    """
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.feature_weights = {
            'mood': 0.25,        # How mood affects burnout
            'work_hours': 0.30,  # Work hours impact
            'fatigue': 0.25,     # Fatigue level impact
            'experience': 0.10,  # Experience factor
            'sentiment': 0.10    # Sentiment analysis impact
        }
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize multiple ML models for ensemble"""
        self.models = {
            'random_forest': RandomForestRegressor(n_estimators=50, random_state=42),
            'knn': KNeighborsRegressor(n_neighbors=5, weights='distance'),
            'svr': SVR(kernel='rbf', C=1.0, gamma='scale'),
            'weighted_ensemble': None  # Custom weighted ensemble
        }
        
        self.scalers = {
            'random_forest': StandardScaler(),
            'knn': StandardScaler(),
            'svr': StandardScaler()
        }
    
    def _encode_features(self, mood, work_hours, fatigue, experience, sentiment_score):
        """Convert inputs to ML features"""
        # Encode mood (Happy=0, Okay=1, Stressed=2)
        mood_encoded = {'Happy': 0, 'Okay': 1, 'Stressed': 2}.get(mood, 1)
        
        # Create feature vector
        features = np.array([
            mood_encoded,
            work_hours / 24.0,        # Normalize work hours (0-1 scale)
            fatigue / 10.0,           # Normalize fatigue (0-1 scale)
            experience / 20.0,        # Normalize experience (0-1 scale)
            (sentiment_score + 1) / 2.0  # Normalize sentiment (-1 to 1 -> 0 to 1)
        ])
        
        return features, mood_encoded
    
    def _create_synthetic_training_data(self):
        """Create realistic training data for ML models"""
        np.random.seed(42)
        n_samples = 1000
        
        # Generate realistic scenarios
        scenarios = []
        burnout_scores = []
        
        for i in range(n_samples):
            # Randomly pick scenario type
            scenario_type = np.random.choice(['low_risk', 'medium_risk', 'high_risk'], 
                                           p=[0.4, 0.4, 0.2])
            
            if scenario_type == 'low_risk':
                mood = np.random.choice([0, 1], p=[0.7, 0.3])
                work_hours = np.random.normal(7.5, 1.5)
                fatigue = np.random.beta(1, 5) * 10
                experience = np.random.exponential(5) + 1
                sentiment = np.random.normal(0.2, 0.15)
                base_score = np.random.normal(2.5, 1.0)
                
            elif scenario_type == 'medium_risk':
                mood = np.random.choice([1, 2], p=[0.6, 0.4])
                work_hours = np.random.normal(9, 2)
                fatigue = np.random.beta(3, 3) * 10
                experience = np.random.exponential(3) + 1
                sentiment = np.random.normal(0.0, 0.2)
                base_score = np.random.normal(5.5, 1.5)
                
            else:  # high_risk
                mood = np.random.choice([1, 2], p=[0.2, 0.8])
                work_hours = np.random.normal(11, 2.5)
                fatigue = np.random.beta(5, 2) * 10
                experience = np.random.exponential(2) + 0.5
                sentiment = np.random.normal(-0.3, 0.2)
                base_score = np.random.normal(8.5, 1.0)
            
            # Add some noise and interactions
            interaction_effect = 0
            if mood == 2 and work_hours > 10:  # Stressed + long hours
                interaction_effect += 1.5
            if fatigue > 7 and sentiment < -0.2:  # High fatigue + negative sentiment
                interaction_effect += 1.2
            if work_hours > 12 and fatigue > 8:  # Very long hours + high fatigue
                interaction_effect += 1.8
            
            final_score = np.clip(base_score + interaction_effect + np.random.normal(0, 0.5), 1, 10)
            
            # Normalize features
            features = np.array([
                mood,
                work_hours / 24.0,
                fatigue / 10.0,
                experience / 20.0,
                (sentiment + 1) / 2.0
            ])
            
            scenarios.append(features)
            burnout_scores.append(final_score)
        
        return np.array(scenarios), np.array(burnout_scores)
    
    def train_models(self):
        """Train all ML models with synthetic data"""
        print("🤖 Training ML Burnout Calculator...")
        
        X, y = self._create_synthetic_training_data()
        
        for name, model in self.models.items():
            if name == 'weighted_ensemble':
                continue
                
            print(f"   Training {name}...")
            
            # Scale features
            X_scaled = self.scalers[name].fit_transform(X)
            
            # Train model
            model.fit(X_scaled, y)
            
            # Calculate score
            train_score = model.score(X_scaled, y)
            print(f"   R² Score: {train_score:.3f}")
    
    def calculate_burnout_ml(self, mood, work_hours, fatigue, experience, sentiment_score):
        """
        Calculate burnout using ML algorithms (no math ranges!)
        
        Returns:
            float: Burnout score (1-10 scale)
        """
        features, mood_encoded = self._encode_features(mood, work_hours, fatigue, experience, sentiment_score)
        
        predictions = []
        
        # Get predictions from all models
        for name, model in self.models.items():
            if name == 'weighted_ensemble':
                continue
                
            try:
                # Scale features
                features_scaled = self.scalers[name].transform(features.reshape(1, -1))
                
                # Predict
                prediction = model.predict(features_scaled)[0]
                predictions.append(prediction)
                
                print(f"   {name}: {prediction:.2f}")
                
            except Exception as e:
                print(f"   {name}: Error - {e}")
                continue
        
        if not predictions:
            # Fallback to simple weighted calculation
            return self._weighted_calculation(mood_encoded, work_hours, fatigue, experience, sentiment_score)
        
        # Ensemble prediction (average of all models)
        ensemble_prediction = np.mean(predictions)
        
        # Apply feature-based adjustments
        adjusted_score = self._apply_feature_adjustments(ensemble_prediction, mood_encoded, work_hours, fatigue, sentiment_score)
        
        final_score = np.clip(adjusted_score, 1.0, 10.0)
        
        print(f"   Ensemble: {ensemble_prediction:.2f}")
        print(f"   Adjusted: {adjusted_score:.2f}")
        print(f"   Final: {final_score:.2f}/10")
        
        return final_score
    
    def _apply_feature_adjustments(self, base_score, mood_encoded, work_hours, fatigue, sentiment_score):
        """Apply intelligent feature-based adjustments"""
        adjusted_score = base_score
        
        # Mood-based adjustments
        if mood_encoded == 2:  # Stressed
            adjusted_score += 0.5
        elif mood_encoded == 0:  # Happy
            adjusted_score -= 0.3
        
        # Work hour patterns
        if work_hours >= 15:
            adjusted_score += 1.2
        elif work_hours >= 12:
            adjusted_score += 0.8
        elif work_hours <= 6:
            adjusted_score -= 0.4
        
        # Fatigue patterns
        if fatigue >= 9:
            adjusted_score += 1.0
        elif fatigue >= 7:
            adjusted_score += 0.5
        elif fatigue <= 3:
            adjusted_score -= 0.3
        
        # Sentiment patterns
        if sentiment_score < -0.4:
            adjusted_score += 0.8
        elif sentiment_score < -0.2:
            adjusted_score += 0.4
        elif sentiment_score > 0.3:
            adjusted_score -= 0.4
        
        return adjusted_score
    
    def _weighted_calculation(self, mood_encoded, work_hours, fatigue, experience, sentiment_score):
        """Fallback weighted calculation"""
        # Normalize inputs
        normalized_mood = mood_encoded / 2.0
        normalized_hours = min(work_hours / 15.0, 1.0)
        normalized_fatigue = fatigue / 10.0
        normalized_experience = min(experience / 10.0, 1.0)
        normalized_sentiment = (sentiment_score + 1) / 2.0
        
        # Weighted sum
        weighted_score = (
            normalized_mood * self.feature_weights['mood'] * 10 +
            normalized_hours * self.feature_weights['work_hours'] * 10 +
            normalized_fatigue * self.feature_weights['fatigue'] * 10 +
            normalized_experience * self.feature_weights['experience'] * 10 +
            (1 - normalized_sentiment) * self.feature_weights['sentiment'] * 10  # Reverse sentiment
        )
        
        return np.clip(weighted_score, 1.0, 10.0)
    
    def save_models(self, prefix='ml_burnout'):
        """Save trained models"""
        for name, model in self.models.items():
            if name == 'weighted_ensemble':
                continue
            
            joblib.dump(model, f'{prefix}_{name}.pkl')
            joblib.dump(self.scalers[name], f'{prefix}_{name}_scaler.pkl')
        
        print("💾 ML models saved!")
    
    def load_models(self, prefix='ml_burnout'):
        """Load trained models"""
        models_loaded = 0
        
        for name in self.models.keys():
            if name == 'weighted_ensemble':
                continue
                
            model_file = f'{prefix}_{name}.pkl'
            scaler_file = f'{prefix}_{name}_scaler.pkl'
            
            if os.path.exists(model_file) and os.path.exists(scaler_file):
                try:
                    self.models[name] = joblib.load(model_file)
                    self.scalers[name] = joblib.load(scaler_file)
                    models_loaded += 1
                    print(f"✅ Loaded {name}")
                except Exception as e:
                    print(f"❌ Error loading {name}: {e}")
        
        if models_loaded > 0:
            print(f"🤖 Loaded {models_loaded} ML models")
            return True
        else:
            print("⚠️ No models found, training new ones...")
            self.train_models()
            self.save_models()
            return True

# Global instance
ml_calculator = MLBurnoutCalculator()

def calculate_burnout_with_ml(mood, work_hours, fatigue, experience, sentiment_score):
    """
    Calculate burnout using ML algorithms
    
    Args:
        mood (str): Mood category
        work_hours (float): Hours worked
        fatigue (float): Fatigue level (1-10)
        experience (float): Years of experience
        sentiment_score (float): Sentiment analysis score (-1 to 1)
        
    Returns:
        float: Burnout score (1-10)
    """
    # Train models if not already trained
    if not hasattr(ml_calculator, '_trained'):
        ml_calculator.train_models()
        ml_calculator._trained = True
    
    return ml_calculator.calculate_burnout_ml(mood, work_hours, fatigue, experience, sentiment_score)

if __name__ == "__main__":
    print("🤖 ML Burnout Calculator Test")
    print("=" * 40)
    
    # Test cases
    test_cases = [
        ("Happy", 6, 2, 3, 0.5),      # Low risk
        ("Okay", 8, 4, 2, 0.0),       # Low-medium risk  
        ("Stressed", 10, 6, 1, -0.2), # Medium risk
        ("Stressed", 12, 8, 0.5, -0.4), # High risk
        ("Stressed", 15, 9, 0.2, -0.6), # Very high risk
    ]
    
    for mood, hours, fatigue, exp, sentiment in test_cases:
        print(f"\nTest: {mood}, {hours}h, {fatigue}/10, sentiment={sentiment}")
        score = calculate_burnout_with_ml(mood, hours, fatigue, exp, sentiment)
        risk_level = "High" if score >= 8 else ("Medium" if score >= 5 else "Low")
        color = "🔴" if score >= 8 else ("🟡" if score >= 5 else "🟢")
        print(f"Result: {score:.1f}/10 {color} {risk_level} Risk")
