// Local development server for Kimi API testing
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase limit for base64 images
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Chat Endpoint
app.post('/api/chat-medicine', async (req, res) => {
    try {
        const { messages, medicineContext } = req.body;
        const apiKey = process.env.MOONSHOT_API_KEY;

        const client = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://api.moonshot.ai/v1",
        });

        const systemPrompt = `You are a helpful medical assistant AI provided by MediInfo.
    
    The user has just scanned a medicine with the following details:
    Name: ${medicineContext?.name || 'Unknown'}
    Primary Use: ${medicineContext?.primary_use || 'Unknown'}
    Ingredients: ${medicineContext?.ingredients || 'Unknown'}
    
    Answer the user's follow-up questions about THIS SPECIFIC medicine.
    - Be concise, clear, and safe.
    - If asked about dosage or serious side effects, advise consulting a doctor.
    - Use simple language.`;

        const response = await client.chat.completions.create({
            model: "moonshot-v1-8k",
            messages: [
                { role: "system", content: systemPrompt },
                ...messages
            ],
            temperature: 0.5,
        });

        res.json({
            role: 'assistant',
            content: response.choices[0].message.content
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Analyze Endpoint
app.post('/api/analyze-medicine', async (req, res) => {
    try {
        const { imageData } = req.body;

        if (!imageData) {
            return res.status(400).json({ error: 'No image data provided' });
        }

        const apiKey = process.env.MOONSHOT_API_KEY;
        if (!apiKey) {
            console.error('MOONSHOT_API_KEY is missing');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        // Debug logging (masking key)
        console.log(`Using API Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
        console.log(`Using Base URL: https://api.moonshot.ai/v1`);
        console.log(`Model: moonshot-v1-8k-vision-preview`);

        // Initialize OpenAI client for Moonshot/Kimi
        const client = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://api.moonshot.ai/v1",
        });

        const base64Image = imageData.includes('base64,')
            ? imageData.split('base64,')[1]
            : imageData;

        console.log("Sending request to Kimi API...");

        const response = await client.chat.completions.create({
            model: "moonshot-v1-8k-vision-preview",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful medical assistant AI. Analyze the image provided and extract medicine details."
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Analyze this image carefully. Today is ${new Date().toLocaleDateString()}.
Determine if it shows a medicine, pharmaceutical product, or medication packaging. Look for EXPIRY DATES.

If it IS a medicine, return a JSON object with:
{
  "is_medicine": true,
  "confidence": 95,
  "name": "Exact medicine name",
  "manufacturer": "Company/Brand name if visible, else null",
  "primary_use": "Primary use (max 20 words)",
  "ingredients": "Active ingredients/composition",
  "precautions": "Key precautions or warnings (max 15 words, else null)",
  "generic_alternatives": [
    {"name": "Generic 1", "type": "Standard Generic", "price_inr": 50},
    {"name": "Generic 2", "type": "Premium Generic", "price_inr": 80}
  ],
  "expiry_date": "Extracted date text or null",
  "expiry_status": "One of: 'expired', 'expiring_soon', 'valid', 'unknown'"
}

If it is NOT a medicine, return:
{
  "is_medicine": false,
  "message": "Not a medicine explanation"
}

IMPORTANT: Return ONLY valid JSON. Do not wrap in markdown blocks like \`\`\`json ... \`\`\``
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`
                            }
                        }
                    ]
                }
            ],
            temperature: 0.3,
        });

        const content = response.choices[0].message.content;
        console.log("Kimi Response:", content);

        // Parse JSON
        let medicineData;
        try {
            // Find JSON object in text (sometimes models add "Here is the JSON" prefix)
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                medicineData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("No JSON structure found");
            }
        } catch (e) {
            console.error("JSON Parse Error:", e);
            // Fallback if parsing fails but maybe it's simple text
            medicineData = { is_medicine: false, message: "Could not interpret AI response." };
        }

        res.json(medicineData);

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: error.message || 'Failed to analyze image' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 API Server running at http://localhost:${PORT}`);
});
