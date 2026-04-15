import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.GOOGLE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function analyzeIssueRisk(title: string, description: string, companySize: string = "medium") {
  if (!API_KEY) {
    return { minutes: 120, riskLevel: "medium", analysis: "AI Fallback: Standard resolution time." };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are a Senior SLA & Risk Analyst. Analyze this technical issue for a ${companySize} sized company.
      
      Issue Title: ${title}
      Issue Description: ${description}
      
      Tasks:
      1. Predict resolution time in MINUTES (be realistic, consider company size ${companySize}).
      2. Assess Risk Level: [critical, high, medium, low]. 
         - "critical" means immediate, catastrophic business impact (e.g., total system outage).
         - "high" means it could cause severe business damage or financial loss.
         - "medium" means operational disruption.
         - "low" means minor inconvenience.
      3. Provide a 1-sentence analysis of why you chose this risk level.

      Respond ONLY in valid JSON format:
      {
        "minutes": number,
        "riskLevel": "high" | "medium" | "low",
        "analysis": "string"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim().replace(/```json/g, '').replace(/```/g, '');
    
    const data = JSON.parse(text);
    return {
      minutes: Number(data.minutes) || 180,
      riskLevel: data.riskLevel || "medium",
      analysis: data.analysis || "Standard business risk."
    };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return { minutes: 180, riskLevel: "medium", analysis: "Failed to perform AI analysis." };
  }
}
