require('dotenv').config();
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ Error: API Key not found in .env file");
    process.exit(1);
}

console.log("🔍 Checking available models for your API Key...");

// Direct ga Google API ni adugutunnam (No SDK confusion)
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error("❌ API Error:", data.error.message);
        } else {
            console.log("\n✅ AVAILABLE MODELS (Copy one of these exact names):");
            console.log("-----------------------------------------------------");
            // Filter only "generateContent" supported models
            const chatModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
            chatModels.forEach(m => {
                console.log(`👉 ${m.name.replace("models/", "")}`);
            });
            console.log("-----------------------------------------------------\n");
        }
    })
    .catch(err => console.error("❌ Network Error:", err));