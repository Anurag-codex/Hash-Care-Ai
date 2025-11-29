
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || ''; 

let ai: GoogleGenAI | null = null;

try {
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
} catch (e) {
  console.warn("Failed to initialize Gemini Client", e);
}

const cleanText = (text: string) => {
  return text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '').trim();
};

export const getChatResponse = async (message: string, context?: string): Promise<string> => {
  if (!ai) {
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    return "I've analyzed your input. Based on your current vitals and history, I recommend maintaining your current hydration levels. Would you like me to schedule a reminder for your next medication?";
  }

  try {
    const model = 'gemini-2.5-flash';
    const response = await ai.models.generateContent({
      model,
      contents: `System: You are HashCare AI, a helpful, empathetic, and professional medical health assistant. Keep responses concise and plain text (ABSOLUTELY NO MARKDOWN, NO BOLDING **).
      Context: ${context || 'User is a 45-year-old patient with mild hypertension.'}
      User: ${message}`,
    });
    return cleanText(response.text || "I'm having trouble processing that request right now.");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm currently offline. Please check your internet connection or API configuration.";
  }
};

export const getHealthBotResponse = async (message: string, language: string): Promise<string> => {
    if (!ai) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return "I am a simulated health bot. Please check your API key to enable real responses.";
    }

    try {
        const model = 'gemini-2.5-flash';
        const prompt = `
        System: You are a responsible AI Health Assistant. 
        Your Rules:
        1. Provide general health and wellness advice ONLY.
        2. DO NOT provide specific medical diagnoses or prescriptions.
        3. Always advise the user to consult a real doctor for serious symptoms.
        4. Keep responses concise (under 3 sentences if possible).
        5. Respond IN THE LANGUAGE: ${language} (Detect if user uses a different language and adapt, but prefer ${language}).
        6. Do NOT use markdown, bolding, or special characters. Plain text only.
        
        User Query: ${message}
        `;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });
        return cleanText(response.text || "I cannot answer that right now.");
    } catch (e) {
        console.error("Health Bot Error", e);
        return "Service currently unavailable.";
    }
};

export const getDailyTip = async (): Promise<string> => {
    if (!ai) {
        return "Drink at least 8 glasses of water today to improve kidney function.";
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Give me a short, single sentence health tip for a dashboard. Do not use bold formatting or markdown.",
        });
        return cleanText(response.text || "Stay active and hydrated!");
    } catch (e) {
        return "Take a deep breath and relax for 5 minutes.";
    }
}

export const getHospitalsNear = async (lat: number, lng: number): Promise<any[]> => {
    if (!ai) return [];
    try {
        const prompt = `Find 4 real hospitals near latitude ${lat}, longitude ${lng} using Google Maps. 
        Return ONLY a raw JSON array (no markdown, no code blocks, just the array) where each object has these fields:
        - id: number (random)
        - name: string (real name found)
        - distance: string (estimated distance)
        - rating: number (real or estimated)
        - bedsAvailable: number (random between 0-20)
        - waitList: number (random minutes)
        - specialties: array of strings (e.g. ["Cardiology", "General"])
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{googleMaps: {}}],
            }
        });
        
        let text = response.text || "[]";
        text = cleanText(text).replace(/json/gi, '');
        
        // Find the first [ and last ]
        const firstBracket = text.indexOf('[');
        const lastBracket = text.lastIndexOf(']');
        
        if (firstBracket !== -1 && lastBracket !== -1) {
             text = text.substring(firstBracket, lastBracket + 1);
        }

        try {
            const data = JSON.parse(text);
            return Array.isArray(data) ? data : [];
        } catch (parseError) {
            console.warn("Failed to parse hospital JSON", parseError);
            return [];
        }

    } catch (e) {
        console.error("Hospital Fetch Error", e);
        return [];
    }
}

export const getHealthNews = async (): Promise<any[]> => {
    if (!ai) return [];
    try {
        const prompt = `Search for the top 5 latest health news headlines specifically from "Times of India" (TOI Health), "The Hindu", or "NDTV Health" within the last 48 hours.
        Return ONLY a raw JSON array (no markdown, no code blocks). 
        The JSON objects must have:
        - title: string (The headline)
        - desc: string (A very short 1-sentence summary)
        - source: string (e.g., "Times of India")
        - link: string (The direct URL to the article found in search)
        - time: string (e.g., "2h ago")
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            }
        });

        let text = response.text || "[]";
        text = cleanText(text).replace(/json/gi, '');
        
        const firstBracket = text.indexOf('[');
        const lastBracket = text.lastIndexOf(']');
        
        if (firstBracket !== -1 && lastBracket !== -1) {
             text = text.substring(firstBracket, lastBracket + 1);
        }

        try {
            const data = JSON.parse(text);
            return Array.isArray(data) ? data : [];
        } catch (parseError) {
            console.warn("Failed to parse news JSON", parseError);
            return [];
        }

    } catch (e) {
        console.error("News Fetch Error", e);
        return [];
    }
}

// --- NEW: Medical Intelligence Agents ---

// 1. Analyze Medical Document (Image/PDF simulated)
export const analyzeMedicalImage = async (imageBase64: string): Promise<any> => {
    if (!ai) throw new Error("AI not initialized");
    try {
        const prompt = `
        Analyze this medical document image (prescription, lab report, or scan).
        Extract the following in strict JSON format:
        {
            "docType": "string (e.g., 'Lab Report', 'Prescription')",
            "date": "string (YYYY-MM-DD if found, else today)",
            "summary": "string (2 sentence summary)",
            "abnormalities": ["string array of abnormal values or warnings"],
            "actionItems": [
                {
                    "type": "medication | test | appointment | instruction",
                    "detail": "string (e.g. 'Take Metformin 500mg')",
                    "priority": "high | medium | low"
                }
            ]
        }
        If you cannot read it, return {"error": "unreadable"}.
        DO NOT USE MARKDOWN. RAW JSON ONLY.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Vision model
            contents: [
                {
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: imageBase64
                    }
                },
                { text: prompt }
            ]
        });

        let text = response.text || "{}";
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (e) {
        console.error("Medical Vision Error", e);
        return { error: "Failed to analyze document" };
    }
};

// 2. Conversation Memory Parser
export const analyzeMedicalText = async (transcript: string): Promise<any> => {
    if (!ai) throw new Error("AI not initialized");
    try {
        const prompt = `
        Analyze this doctor-patient conversation transcript or text note.
        Identify implicitly or explicitly stated medical instructions.
        Return strict JSON:
        {
            "insights": [
                {
                    "type": "instruction | medication | lifestyle",
                    "text": "string",
                    "confidence": number (0-100)
                }
            ],
            "missedActions": ["string array of things the patient might have forgotten to do based on context"]
        }
        Transcript: "${transcript}"
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        let text = response.text || "{}";
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(text);
    } catch (e) {
        console.error("Medical Text Error", e);
        return { error: "Failed to parse text" };
    }
};
