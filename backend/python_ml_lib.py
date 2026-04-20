"""
Python Machine Learning Library for Burnout Prediction
A reusable Python ML component using scikit-learn
"""

import numpy as np
import pandas as pd
from typing import Tuple, Dict, List, Any, Optional
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib
import os
from datetime import datetime

class PythonBurnoutPredictor:
    """
    Python Machine Learning Library for Burnout Prediction
    Uses scikit-learn and other Python ML libraries
    """
    
    def __init__(self):
        self.models = {
            'random_forest': RandomForestRegressor(n_estimators=100, random_state=42),
            'gradient_boosting': GradientBoostingRegressor(n_estimators=100, random_state=42),
            'linear_regression': LinearRegression(),
            'ridge': Ridge(alpha=1.0)
        }
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.best_model = None
        self.best_model_name = None
        self.feature_columns = []
        self.model_metadata = {}
    
    def preprocess_data(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Preprocess data using Python pandas and numpy
        
        Args:
            df (pd.DataFrame): Raw data
            
        Returns:
            Tuple[pd.DataFrame, pd.Series]: Features and target
        """
        print("🐍 Preprocessing data with Python pandas...")
        
        # Handle missing values using Python
        df = df.copy()
        
        # Fill numerical missing values with median
        numerical_cols = df.select_dtypes(include=[np.number]).columns
        for col in numerical_cols:
            if col != 'Burn Rate':  # Don't fill target variable
                df[col].fillna(df[col].median(), inplace=True)
        
        # Convert Date of Joining to experience years using Python datetime
        if 'Date of Joining' in df.columns:
            df['Date of Joining'] = pd.to_datetime(df['Date of Joining'], errors='coerce')
            current_date = datetime.now()
            df['experience_years'] = (current_date - df['Date of Joining']).dt.days / 365.25
            df['experience_years'].fillna(df['experience_years'].median(), inplace=True)
        
        # Encode categorical variables using Python
        categorical_columns = ['Gender', 'Company Type', 'WFH Setup Available', 'Designation']
        
        for col in categorical_columns:
            if col in df.columns:
                le = LabelEncoder()
                df[f'{col}_encoded'] = le.fit_transform(df[col].astype(str))
                self.label_encoders[col] = le
                print(f"   Encoded {col}: {dict(zip(le.classes_, le.transform(le.classes_)))}")
        
        # Select features for training
        feature_mapping = {
            'Gender': 'Gender_encoded',
            'Company Type': 'Company Type_encoded',
            'WFH Setup Available': 'WFH Setup Available_encoded',
            'Designation': 'Designation_encoded',
            'Resource Allocation': 'Resource Allocation',
            'Mental Fatigue Score': 'Mental Fatigue Score',
            'experience_years': 'experience_years'
        }
        
        # Build feature list
        self.feature_columns = []
        for display_name, col_name in feature_mapping.items():
            if col_name in df.columns:
                self.feature_columns.append(col_name)
                print(f"   Using feature: {display_name}")
        
        # Prepare target variable
        if 'Burn Rate' in df.columns:
            df['burnout_score'] = df['Burn Rate'] * 100
            target = df['burnout_score']
        else:
            raise ValueError("Burn Rate column not found!")
        
        # Remove rows with missing target
        clean_df = df[self.feature_columns + ['burnout_score']].dropna()
        
        return clean_df[self.feature_columns], clean_df['burnout_score']
    
    def train_models(self, X: pd.DataFrame, y: pd.Series) -> Dict[str, Dict[str, float]]:
        """
        Train multiple ML models using Python scikit-learn
        
        Args:
            X (pd.DataFrame): Features
            y (pd.Series): Target
            
        Returns:
            Dict[str, Dict[str, float]]: Model performance metrics
        """
        print(f"🤖 Training Python ML models with {len(X)} samples...")
        
        # Split data using Python
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        results = {}
        
        for name, model in self.models.items():
            print(f"\n📊 Training {name}...")
            
            # Choose appropriate data based on model type
            if name in ['linear_regression', 'ridge']:
                model.fit(X_train_scaled, y_train)
                y_pred = model.predict(X_test_scaled)
                train_data, test_data = X_train_scaled, X_test_scaled
            else:
                # Tree-based models don't need scaling
                model.fit(X_train, y_train)
                y_pred = model.predict(X_test)
                train_data, test_data = X_train, X_test
            
            # Calculate metrics using Python
            mse = mean_squared_error(y_test, y_pred)
            rmse = np.sqrt(mse)
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            # Cross-validation
            cv_scores = cross_val_score(model, train_data, y_train, cv=5, scoring='r2')
            
            results[name] = {
                'model': model,
                'mse': mse,
                'rmse': rmse,
                'mae': mae,
                'r2': r2,
                'cv_mean': cv_scores.mean(),
                'cv_std': cv_scores.std()
            }
            
            print(f"   RMSE: {rmse:.2f}")
            print(f"   MAE: {mae:.2f}")
            print(f"   R²: {r2:.3f}")
            print(f"   CV R²: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")
        
        # Select best model based on R² score
        self.best_model_name = max(results.keys(), key=lambda x: results[x]['r2'])
        self.best_model = results[self.best_model_name]['model']
        
        print(f"\n🏆 Best Python ML model: {self.best_model_name}")
        print(f"   R²: {results[self.best_model_name]['r2']:.3f}")
        print(f"   RMSE: {results[self.best_model_name]['rmse']:.2f}")
        
        return results
    
    def predict_burnout(self, employee_data: Dict[str, Any]) -> float:
        """
        Predict burnout for new employee data using Python
        
        Args:
            employee_data (Dict[str, Any]): Employee features
            
        Returns:
            float: Predicted burnout score (0-100)
        """
        if self.best_model is None:
            raise ValueError("No model trained yet!")
        
        # Preprocess input data using Python
        processed_data = {}
        
        # Handle categorical encoding
        for col, encoder in self.label_encoders.items():
            if col in employee_data:
                try:
                    processed_data[f'{col}_encoded'] = encoder.transform([employee_data[col]])[0]
                except:
                    processed_data[f'{col}_encoded'] = 0
        
        # Handle numerical features
        numerical_features = ['Resource Allocation', 'Mental Fatigue Score', 'experience_years']
        for feature in numerical_features:
            if feature in employee_data:
                processed_data[feature] = employee_data[feature]
        
        # Create feature array in correct order
        features = []
        for col in self.feature_columns:
            features.append(processed_data.get(col, 0))
        
        features_array = np.array([features])
        
        # Scale features if needed
        if self.best_model_name in ['linear_regression', 'ridge']:
            features_scaled = self.scaler.transform(features_array)
            prediction = self.best_model.predict(features_scaled)[0]
        else:
            prediction = self.best_model.predict(features_array)[0]
        
        return np.clip(prediction, 0, 100)
    
    def save_model(self, model_path: str = 'python_burnout_model.pkl', 
                   scaler_path: str = 'python_scaler.pkl',
                   metadata_path: str = 'python_metadata.pkl') -> None:
        """
        Save Python ML model using joblib
        
        Args:
            model_path (str): Path to save model
            scaler_path (str): Path to save scaler
            metadata_path (str): Path to save metadata
        """
        if self.best_model is None:
            raise ValueError("No model trained yet!")
        
        # Save using Python joblib
        joblib.dump(self.best_model, model_path)
        joblib.dump(self.scaler, scaler_path)
        
        # Save metadata
        metadata = {
            'feature_columns': self.feature_columns,
            'label_encoders': self.label_encoders,
            'model_type': type(self.best_model).__name__,
            'best_model_name': self.best_model_name
        }
        joblib.dump(metadata, metadata_path)
        
        print(f"\n💾 Python ML model saved:")
        print(f"   Model: {model_path}")
        print(f"   Scaler: {scaler_path}")
        print(f"   Metadata: {metadata_path}")
    
    def load_model(self, model_path: str = 'python_burnout_model.pkl',
                   scaler_path: str = 'python_scaler.pkl',
                   metadata_path: str = 'python_metadata.pkl') -> bool:
        """
        Load Python ML model using joblib
        
        Args:
            model_path (str): Path to model file
            scaler_path (str): Path to scaler file
            metadata_path (str): Path to metadata file
            
        Returns:
            bool: True if loaded successfully
        """
        if all(os.path.exists(path) for path in [model_path, scaler_path, metadata_path]):
            try:
                self.best_model = joblib.load(model_path)
                self.scaler = joblib.load(scaler_path)
                metadata = joblib.load(metadata_path)
                
                self.feature_columns = metadata['feature_columns']
                self.label_encoders = metadata['label_encoders']
                self.best_model_name = metadata.get('best_model_name', type(self.best_model).__name__)
                
                print(f"✅ Python ML model loaded: {self.best_model_name}")
                return True
            except Exception as e:
                print(f"❌ Error loading Python ML model: {e}")
        
        return False
    
    def get_feature_importance(self) -> Optional[Dict[str, float]]:
        """
        Get feature importance from Python ML model
        
        Returns:
            Optional[Dict[str, float]]: Feature importance dictionary
        """
        if self.best_model is None:
            return None
        
        if hasattr(self.best_model, 'feature_importances_'):
            importance = self.best_model.feature_importances_
            return dict(zip(self.feature_columns, importance))
        
        return None

# Easy-to-use Python function
def predict_burnout_score(employee_data: Dict[str, Any], 
                         model_path: str = 'python_burnout_model.pkl') -> float:
    """
    Quick burnout prediction using Python
    
    Args:
        employee_data (Dict[str, Any]): Employee features
        model_path (str): Path to trained model
        
    Returns:
        float: Predicted burnout score
    """
    predictor = PythonBurnoutPredictor()
    
    if predictor.load_model(model_path):
        return predictor.predict_burnout(employee_data)
    else:
        raise ValueError("Model not found or could not be loaded")

if __name__ == "__main__":
    print("🐍 Python Machine Learning Library for Burnout Prediction")
    print("=" * 60)
    
    # Example usage (would need actual data)
    print("📚 Python ML Library Features:")
    print("   • Multiple ML algorithms (Random Forest, Gradient Boosting, etc.)")
    print("   • Automatic data preprocessing with pandas")
    print("   • Feature importance analysis")
    print("   • Model persistence with joblib")
    print("   • Cross-validation and metrics")
    print("   • Easy-to-use Python API")
    
    print("\n💡 Usage Examples:")
    print("from python_ml_lib import PythonBurnoutPredictor")
    print("predictor = PythonBurnoutPredictor()")
    print("# Train model with your data")
    print("predictor.train_models(X, y)")
    print("# Predict new employee")
    print("score = predictor.predict_burnout(employee_dict)")
    
    print("\n✅ Python ML Library Ready to Use!")
