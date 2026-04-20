"""
Python Sentiment Analysis Library
A reusable Python component for sentiment analysis
"""

from textblob import TextBlob
import re
from typing import Tuple, List, Dict, Any

class PythonSentimentAnalyzer:
    """
    Advanced Sentiment Analysis using Python Libraries
    Combines TextBlob with custom rule-based analysis
    """
    
    def __init__(self):
        self.positive_words = [
            'happy', 'excited', 'great', 'awesome', 'fantastic', 'wonderful', 
            'good', 'pleased', 'satisfied', 'motivated', 'energetic', 'positive',
            'love', 'enjoy', 'comfortable', 'relaxed', 'calm', 'confident',
            'delighted', 'thrilled', 'ecstatic', 'joyful', 'content'
        ]
        
        self.negative_words = [
            'stressed', 'stress', 'overwhelmed', 'tired', 'exhausted', 'burnout', 
            'frustrated', 'angry', 'upset', 'worried', 'anxious', 'depressed', 
            'sad', 'unhappy', 'difficult', 'hard', 'struggle', 'pressure', 
            'deadline', 'urgent', 'too much', 'cant handle', 'breaking point', 
            'drowning', 'sinking', 'feel stress', 'feeling stress', 
            'feel stressed', 'feeling stressed', 'miserable', 'devastated'
        ]
        
        self.intensifiers = {
            'very': 1.5, 'extremely': 2.0, 'really': 1.3, 'so': 1.4,
            'absolutely': 1.8, 'completely': 1.6, 'totally': 1.5
        }
        
        self.negation_words = ['not', 'no', 'never', 'none', 'nothing', 'nowhere']
    
    def preprocess_text(self, text: str) -> str:
        """Preprocess text using Python string operations"""
        if not text:
            return ""
        
        # Convert to lowercase and remove special characters
        text = text.lower()
        text = re.sub(r'[^\w\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def detect_intensifiers(self, text: str) -> float:
        """Detect intensifiers in text using Python"""
        intensity_multiplier = 1.0
        words = text.split()
        
        for i, word in enumerate(words):
            if word in self.intensifiers:
                intensity_multiplier *= self.intensifiers[word]
        
        return intensity_multiplier
    
    def detect_negation(self, text: str) -> bool:
        """Detect negation using Python"""
        words = text.split()
        return any(word in self.negation_words for word in words)
    
    def analyze_with_textblob(self, text: str) -> float:
        """Use Python TextBlob library for sentiment analysis"""
        try:
            blob = TextBlob(text)
            return blob.sentiment.polarity
        except:
            return 0.0
    
    def analyze_with_keywords(self, text: str) -> Tuple[str, float]:
        """Custom keyword-based analysis using Python"""
        text = self.preprocess_text(text)
        
        positive_count = sum(1 for word in self.positive_words if word in text)
        negative_count = sum(1 for word in self.negative_words if word in text)
        
        # Check for intensifiers
        intensity = self.detect_intensifiers(text)
        
        # Check for negation
        negation = self.detect_negation(text)
        
        if positive_count > negative_count:
            score = min(0.8, positive_count * 0.15 * intensity)
            sentiment = 'Positive'
        elif negative_count > positive_count:
            score = max(-0.8, -negative_count * 0.15 * intensity)
            sentiment = 'Negative'
        else:
            score = 0.0
            sentiment = 'Neutral'
        
        # Apply negation
        if negation:
            score = -score
            sentiment = 'Positive' if score > 0 else 'Negative' if score < 0 else 'Neutral'
        
        return sentiment, score
    
    def analyze(self, text: str, verbose: bool = False) -> Tuple[str, float]:
        """
        Main sentiment analysis method combining multiple Python libraries
        
        Args:
            text (str): Text to analyze
            verbose (bool): Show detailed analysis
            
        Returns:
            Tuple[str, float]: (sentiment_label, sentiment_score)
        """
        if not text or text.strip() == '':
            return 'Neutral', 0.0
        
        # Method 1: TextBlob (Python NLP library)
        textblob_score = self.analyze_with_textblob(text)
        
        # Method 2: Custom keyword analysis
        keyword_sentiment, keyword_score = self.analyze_with_keywords(text)
        
        # Ensemble: Combine both methods
        ensemble_score = (textblob_score * 0.4) + (keyword_score * 0.6)
        
        # Determine final sentiment
        if ensemble_score > 0.15:
            final_sentiment = 'Positive'
        elif ensemble_score < -0.15:
            final_sentiment = 'Negative'
        else:
            final_sentiment = 'Neutral'
        
        if verbose:
            print(f"🐍 Python Sentiment Analysis: '{text[:50]}...'")
            print(f"   TextBlob (Python): {textblob_score:.2f}")
            print(f"   Keywords (Python): {keyword_score:.2f} ({keyword_sentiment})")
            print(f"   Ensemble: {final_sentiment} ({ensemble_score:.2f})")
        
        return final_sentiment, ensemble_score
    
    def batch_analyze(self, texts: List[str]) -> List[Tuple[str, str, float]]:
        """
        Analyze multiple texts using Python list comprehension
        
        Args:
            texts (List[str]): List of texts to analyze
            
        Returns:
            List[Tuple[str, str, float]]: List of (text, sentiment, score) tuples
        """
        return [(text, *self.analyze(text)) for text in texts]
    
    def get_statistics(self, texts: List[str]) -> Dict[str, Any]:
        """
        Get sentiment statistics using Python collections
        
        Args:
            texts (List[str]): List of texts to analyze
            
        Returns:
            Dict[str, Any]: Statistics dictionary
        """
        results = self.batch_analyze(texts)
        
        sentiments = [sentiment for _, sentiment, _ in results]
        scores = [score for _, _, score in results]
        
        stats = {
            'total_texts': len(texts),
            'positive_count': sentiments.count('Positive'),
            'negative_count': sentiments.count('Negative'),
            'neutral_count': sentiments.count('Neutral'),
            'average_score': sum(scores) / len(scores) if scores else 0,
            'max_score': max(scores) if scores else 0,
            'min_score': min(scores) if scores else 0
        }
        
        # Calculate percentages
        if stats['total_texts'] > 0:
            stats['positive_percentage'] = (stats['positive_count'] / stats['total_texts']) * 100
            stats['negative_percentage'] = (stats['negative_count'] / stats['total_texts']) * 100
            stats['neutral_percentage'] = (stats['neutral_count'] / stats['total_texts']) * 100
        
        return stats

# Easy-to-use Python function
def analyze_sentiment(text: str, verbose: bool = False) -> Tuple[str, float]:
    """
    Quick sentiment analysis using Python
    
    Args:
        text (str): Text to analyze
        verbose (bool): Show detailed analysis
        
    Returns:
        Tuple[str, float]: (sentiment_label, sentiment_score)
    """
    analyzer = PythonSentimentAnalyzer()
    return analyzer.analyze(text, verbose)

# Python decorator for sentiment analysis
def sentiment_aware(func):
    """
    Python decorator to add sentiment analysis to any function
    """
    def wrapper(text, *args, **kwargs):
        sentiment, score = analyze_sentiment(text)
        result = func(text, *args, **kwargs)
        return {
            'original_result': result,
            'sentiment': sentiment,
            'sentiment_score': score
        }
    return wrapper

if __name__ == "__main__":
    print("🐍 Python Sentiment Analysis Library")
    print("=" * 50)
    
    # Create analyzer instance
    analyzer = PythonSentimentAnalyzer()
    
    # Test with various texts
    test_texts = [
        "I feel very stressed today",
        "Python is awesome and I love coding",
        "Not happy with the workload",
        "Extremely overwhelmed with deadlines",
        "Feeling calm and focused"
    ]
    
    print("\n🔍 Individual Analysis:")
    for text in test_texts:
        sentiment, score = analyzer.analyze(text, verbose=True)
        print(f"Result: {sentiment} ({score:.2f})")
        print("-" * 40)
    
    print("\n📊 Batch Analysis:")
    batch_results = analyzer.batch_analyze(test_texts)
    for text, sentiment, score in batch_results:
        print(f"'{text}' → {sentiment} ({score:.2f})")
    
    print("\n📈 Statistics:")
    stats = analyzer.get_statistics(test_texts)
    for key, value in stats.items():
        print(f"{key}: {value}")
    
    print("\n✅ Python Sentiment Library Ready!")
    print("\nUsage examples:")
    print("from python_sentiment_lib import analyze_sentiment")
    print("sentiment, score = analyze_sentiment('I feel stress')")
    print("print(f'Sentiment: {sentiment}, Score: {score}')")
