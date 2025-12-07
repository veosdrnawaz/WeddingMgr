import { GoogleGenAI } from "@google/genai";

// Ideally, in a real app, this is handled via a secure backend proxy.
// For this frontend demo, we access the environment variable directly.
const getClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key not found");
    }
    return new GoogleGenAI({ apiKey });
};

export const generateInviteText = async (
    coupleNames: string,
    venue: string,
    date: string,
    tone: 'Formal' | 'Casual' | 'Poetic' | 'Urdu',
    language: 'English' | 'Urdu'
): Promise<string> => {
    try {
        const ai = getClient();
        const prompt = `Write a wedding invitation for ${coupleNames} taking place at ${venue} on ${date}. 
        Tone: ${tone}. 
        Language: ${language}.
        Keep it under 100 words. Return ONLY the text of the invitation.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text || "Could not generate invite. Please try again.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Error connecting to AI service. Please check your API key.";
    }
};

export const analyzeBudget = async (budget: number, guestCount: number): Promise<string> => {
    try {
        const ai = getClient();
        const prompt = `I have a wedding budget of PKR ${budget} for ${guestCount} guests. 
        Provide a very brief breakdown (3 bullet points) of suggested allocation percentages for Venue/Food, Decor, and Photography in Pakistan context.
        Return plain text.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text || "Analysis unavailable.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Error analyzing budget.";
    }
};

export const generateReminderText = async (
    recipientName: string,
    type: 'Payment' | 'RSVP',
    language: 'English' | 'Urdu',
    contextDetails: string
): Promise<string> => {
    try {
        const ai = getClient();
        const prompt = `Write a short, polite, and professional ${type} reminder message for WhatsApp.
        Recipient: ${recipientName}.
        Language: ${language}.
        Context: ${contextDetails}.
        
        Rules:
        - If 'Payment', allow for a polite reminder about due dates or balances.
        - If 'RSVP', make it warm and asking if they can make it.
        - Keep it under 50 words.
        - Return ONLY the message text.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text || "";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return `Hi ${recipientName}, this is a reminder regarding your ${type}.`;
    }
};