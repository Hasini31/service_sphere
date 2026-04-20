"""
Chart Generator using Python built-in libraries
Creates pie charts and scatter plots for manager portal
"""

import base64
import io
import sqlite3
import os
from datetime import datetime, timedelta
import json

# Python built-in libraries for chart generation
import math
import random

class ChartGenerator:
    """Generate charts using Python built-in libraries"""
    
    def __init__(self):
        self.colors = {
            'high': '#EF4444',
            'medium': '#F59E0B', 
            'low': '#22C55E',
            'grid': '#E5E7EB',
            'text': '#374151',
            'background': '#FFFFFF'
        }
    
    def generate_pie_chart_svg(self, data, title="Burnout Distribution"):
        """Generate pie chart using SVG (built-in)"""
        total = sum(data.values())
        if total == 0:
            return self._generate_empty_chart(title, "No data available")
        
        # Calculate angles
        angles = {}
        current_angle = -90  # Start from top
        
        for label, value in data.items():
            if value > 0:
                percentage = (value / total) * 100
                angle_span = (value / total) * 360
                angles[label] = {
                    'value': value,
                    'percentage': percentage,
                    'start_angle': current_angle,
                    'end_angle': current_angle + angle_span
                }
                current_angle += angle_span
        
        # Generate SVG pie chart
        svg_content = f'''
        <svg width="300" height="250" xmlns="http://www.w3.org/2000/svg">
            <style>
                .title {{ font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; fill: {self.colors['text']}; }}
                .legend-text {{ font-family: Arial, sans-serif; font-size: 12px; fill: {self.colors['text']}; }}
                .slice {{ stroke: white; stroke-width: 2; cursor: pointer; }}
                .slice:hover {{ opacity: 0.8; }}
            </style>
            
            <text x="150" y="20" text-anchor="middle" class="title">{title}</text>
        '''
        
        # Draw pie slices
        center_x, center_y = 120, 120
        radius = 80
        
        for label, slice_data in angles.items():
            color = self.colors.get(label.lower(), '#6B7280')
            
            # Calculate path for pie slice
            start_angle_rad = math.radians(slice_data['start_angle'])
            end_angle_rad = math.radians(slice_data['end_angle'])
            
            x1 = center_x + radius * math.cos(start_angle_rad)
            y1 = center_y + radius * math.sin(start_angle_rad)
            x2 = center_x + radius * math.cos(end_angle_rad)
            y2 = center_y + radius * math.sin(end_angle_rad)
            
            large_arc = 1 if slice_data['end_angle'] - slice_data['start_angle'] > 180 else 0
            
            path = f'''
            <path class="slice" d="M {center_x} {center_y} L {x1} {y1} A {radius} {radius} 0 {large_arc} 1 {x2} {y2} Z"
                  fill="{color}" />
            '''
            svg_content += path
        
        # Add legend
        legend_y = 220
        for i, (label, slice_data) in enumerate(angles.items()):
            color = self.colors.get(label.lower(), '#6B7280')
            legend_x = 20 + i * 90
            
            svg_content += f'''
            <rect x="{legend_x}" y="{legend_y}" width="12" height="12" fill="{color}" />
            <text x="{legend_x + 15}" y="{legend_y + 10}" class="legend-text">{label} ({slice_data['value']})</text>
            '''
        
        svg_content += '</svg>'
        
        return svg_content
    
    def generate_scatter_plot_svg(self, data, title="Work Hours vs Fatigue", dot_size=3):
        """Generate scatter plot using SVG (built-in)"""
        if not data:
            return self._generate_empty_chart(title, "No data available")
        
        # Find data ranges
        work_hours = [point['work_hours'] for point in data]
        fatigue_levels = [point['fatigue'] for point in data]
        
        min_work, max_work = min(work_hours), max(work_hours)
        min_fatigue, max_fatigue = min(fatigue_levels), max(fatigue_levels)
        
        # Add padding
        work_range = max_work - min_work or 1
        fatigue_range = max_fatigue - min_fatigue or 1
        
        min_work -= work_range * 0.1
        max_work += work_range * 0.1
        min_fatigue -= fatigue_range * 0.1
        max_fatigue += fatigue_range * 0.1
        
        # Chart dimensions
        chart_width = 250
        chart_height = 200
        margin = 40
        plot_width = chart_width - 2 * margin
        plot_height = chart_height - 2 * margin
        
        svg_content = f'''
        <svg width="{chart_width + 50}" height="{chart_height + 50}" xmlns="http://www.w3.org/2000/svg">
            <style>
                .title {{ font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; fill: {self.colors['text']}; }}
                .axis-label {{ font-family: Arial, sans-serif; font-size: 10px; fill: {self.colors['text']}; }}
                .dot {{ stroke: white; stroke-width: 1; }}
                .grid-line {{ stroke: {self.colors['grid']}; stroke-width: 0.5; stroke-dasharray: 2,2; }}
            </style>
            
            <text x="{chart_width//2 + 25}" y="20" text-anchor="middle" class="title">{title}</text>
        '''
        
        # Draw grid lines
        for i in range(5):
            y = margin + (plot_height / 4) * i
            svg_content += f'<line x1="{margin}" y1="{y}" x2="{margin + plot_width}" y2="{y}" class="grid-line" />'
            
            x = margin + (plot_width / 4) * i
            svg_content += f'<line x1="{x}" y1="{margin}" x2="{x}" y2="{margin + plot_height}" class="grid-line" />'
        
        # Draw axes
        svg_content += f'''
        <line x1="{margin}" y1="{margin}" x2="{margin}" y2="{margin + plot_height}" stroke="{self.colors['text']}" stroke-width="2" />
        <line x1="{margin}" y1="{margin + plot_height}" x2="{margin + plot_width}" y2="{margin + plot_height}" stroke="{self.colors['text']}" stroke-width="2" />
        '''
        
        # Plot data points
        for point in data:
            # Convert to chart coordinates
            x = margin + ((point['work_hours'] - min_work) / (max_work - min_work)) * plot_width
            y = margin + plot_height - ((point['fatigue'] - min_fatigue) / (max_fatigue - min_fatigue)) * plot_height
            
            color = self.colors.get(point['burnout_level'].lower(), '#6B7280')
            
            svg_content += f'''
            <circle cx="{x}" cy="{y}" r="{dot_size}" fill="{color}" class="dot" />
            '''
        
        # Add axis labels
        svg_content += f'''
        <text x="{margin + plot_width//2}" y="{chart_height + 40}" text-anchor="middle" class="axis-label">Work Hours</text>
        <text x="15" y="{margin + plot_height//2}" text-anchor="middle" transform="rotate(-90 15 {margin + plot_height//2})" class="axis-label">Fatigue Level</text>
        '''
        
        svg_content += '</svg>'
        
        return svg_content
    
    def _generate_empty_chart(self, title, message):
        """Generate empty chart placeholder"""
        return f'''
        <svg width="300" height="250" xmlns="http://www.w3.org/2000/svg">
            <style>
                .title {{ font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; fill: {self.colors['text']}; }}
                .message {{ font-family: Arial, sans-serif; font-size: 12px; fill: {self.colors['text']}; }}
            </style>
            <text x="150" y="20" text-anchor="middle" class="title">{title}</text>
            <text x="150" y="125" text-anchor="middle" class="message">{message}</text>
        </svg>
        '''
    
    def svg_to_base64(self, svg_content):
        """Convert SVG to base64 for embedding"""
        svg_bytes = svg_content.encode('utf-8')
        base64_bytes = base64.b64encode(svg_bytes)
        return base64_bytes.decode('utf-8')
    
    def generate_charts_for_manager(self):
        """Generate all charts for manager portal"""
        DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Get burnout distribution
        cursor.execute('''
            SELECT burnout_level, COUNT(*) 
            FROM records 
            WHERE employee_name != 'Test User' AND employee_name != 'honey'
            GROUP BY burnout_level
        ''')
        burnout_data = dict(cursor.fetchall())
        
        # Get scatter data
        cursor.execute('''
            SELECT work_hours, fatigue, burnout_level
            FROM records 
            WHERE employee_name != 'Test User' AND employee_name != 'honey'
        ''')
        scatter_data = []
        for row in cursor.fetchall():
            scatter_data.append({
                'work_hours': row[0],
                'fatigue': row[1],
                'burnout_level': row[2]
            })
        
        conn.close()
        
        # Generate charts
        pie_chart_svg = self.generate_pie_chart_svg(burnout_data, "Team Burnout Distribution")
        scatter_chart_svg = self.generate_scatter_plot_svg(scatter_data, "Work Hours vs Fatigue", dot_size=3)
        
        # Convert to base64
        pie_chart_base64 = self.svg_to_base64(pie_chart_svg)
        scatter_chart_base64 = self.svg_to_base64(scatter_chart_svg)
        
        return {
            'pie_chart': f'data:image/svg+xml;base64,{pie_chart_base64}',
            'scatter_chart': f'data:image/svg+xml;base64,{scatter_chart_base64}',
            'burnout_data': burnout_data,
            'scatter_data': scatter_data
        }

# Global instance
chart_generator = ChartGenerator()

def generate_manager_charts():
    """Generate charts for manager dashboard"""
    return chart_generator.generate_charts_for_manager()
