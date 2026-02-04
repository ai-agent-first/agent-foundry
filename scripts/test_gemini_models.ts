
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function listModels() {
    const key = process.env.VITE_GEMINI_API_KEY;
    if (!key) {
        console.error("No API Key found in .env.local");
        return;
    }
    console.log("Using Key ending in:", key.slice(-4));

    try {
        const ai = new GoogleGenAI({ apiKey: key });
        // NOTE: The new SDK structure might be different. 
        // If ai.models.list() exists:
        if (ai.models && ai.models.list) {
            console.log("Fetching models...");
            const response = await ai.models.list();
            console.log("Available Models:");
            // response might be separate or have .models
            const models = response.models || response;
            if (Array.isArray(models)) {
                models.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
            } else {
                console.log(models);
            }
        } else {
            console.log("SDK structure mismatch, trying fallback...");
            console.log(ai);
        }
    } catch (error) {
        console.error("Error listing models:", error.message);
        if (error.response) console.error(error.response);
    }
}

listModels();
