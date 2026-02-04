import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = (process.env.MOONSHOT_API_KEY || "sk-OW6rjyuOmvxaM9A5b2YYLHBYgcL3RANERftRaC07Q5hG6mC5").trim();

console.log("----------------------------------------");
console.log("Testing Kimi (Moonshot) API Key Validation");
console.log("----------------------------------------");
console.log(`Key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);

const client = new OpenAI({
    apiKey: apiKey,
    baseURL: "https://api.moonshot.ai/v1",
});

async function validate() {
    try {
        console.log("\nSending test request (list models)...");
        const list = await client.models.list();
        console.log("✅ API Connection Successful!");
        console.log("Available Models:", list.data.map(m => m.id).join(", "));

        console.log("\nSending test chat completion...");
        const completion = await client.chat.completions.create({
            model: "moonshot-v1-8k",
            messages: [
                { role: "system", content: "You are a helpful assistant." },
                { role: "user", content: "Hello, reply with 'API Working' if you can read this." }
            ],
            temperature: 0.3,
        });

        console.log("✅ Chat Completion Successful!");
        console.log("Response:", completion.choices[0].message.content);

    } catch (error) {
        console.error("\n❌ Validation Failed:");
        if (error instanceof OpenAI.APIError) {
            console.error(`Status: ${error.status}`);
            console.error(`Type: ${error.type}`);
            console.error(`Message: ${error.message}`);
        } else {
            console.error(error);
        }
    }
}

validate();
