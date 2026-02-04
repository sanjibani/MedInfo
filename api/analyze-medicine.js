import OpenAI from 'openai';

export const config = {
    runtime: 'edge', // Kimi API calls are lightweight enough for Edge
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers: { 'Content-Type': 'application/json' } }
        );
    }

    try {
        const { imageData } = await req.json();

        if (!imageData) {
            return new Response(
                JSON.stringify({ error: 'No image data provided' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const apiKey = process.env.MOONSHOT_API_KEY;
        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: 'Server configuration error' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Initialize OpenAI client for Moonshot/Kimi
        const client = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://api.moonshot.ai/v1",
        });

        // Extract base64 (remove prefix if present)
        const base64Image = imageData.includes('base64,')
            ? imageData.split('base64,')[1]
            : imageData;

        const response = await client.chat.completions.create({
            model: "moonshot-v1-8k-vision-preview", // Using vision preview model
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

IMPORTANT: valid JSON only. Do not wrap in markdown code blocks.`
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

        // Cleaner JSON parsing
        let medicineData;
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            medicineData = jsonMatch ? JSON.parse(jsonMatch[0]) : { is_medicine: false, message: "Could not parse response" };
        } catch (e) {
            console.error("JSON Parse Error:", e);
            medicineData = { is_medicine: false, message: "Error parsing AI response" };
        }

        return new Response(JSON.stringify(medicineData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Kimi API Error:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Failed to analyze image' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
