import OpenAI from 'openai';

export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers: { 'Content-Type': 'application/json' } }
        );
    }

    try {
        const { messages, medicineContext } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return new Response(
                JSON.stringify({ error: 'Invalid messages format' }),
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

        const client = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://api.moonshot.ai/v1",
        });

        // Construct system prompt with medicine context
        const systemPrompt = `You are a helpful medical assistant AI provided by MediInfo.
    
    The user has just scanned a medicine with the following details:
    Name: ${medicineContext?.name || 'Unknown'}
    Primary Use: ${medicineContext?.primary_use || 'Unknown'}
    Ingredients: ${medicineContext?.ingredients || 'Unknown'}
    
    Answer the user's follow-up questions about THIS SPECIFIC medicine.
    - Be concise, clear, and safe.
    - If asked about dosage or serious side effects, advise consulting a doctor.
    - Do not invent facts. If unsure, say so.
    - Use simple language (avoid complex medical jargon).
    `;

        const response = await client.chat.completions.create({
            model: "moonshot-v1-8k", // Chat doesn't need vision, so standard 8k is fine (and faster/cheaper)
            messages: [
                { role: "system", content: systemPrompt },
                ...messages
            ],
            temperature: 0.5,
        });

        return new Response(JSON.stringify({
            role: 'assistant',
            content: response.choices[0].message.content
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Chat API Error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to generate response' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
