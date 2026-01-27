require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 1. Setup Google Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const upload = multer({ dest: 'uploads/' });

// 2. In-Memory Database (RAM)
let resumeChunks = [];
let resumeEmbeddings = [];

console.log("🤖 AI Server Starting (Using Model: gemini-flash-latest)...");

// --- Helper: Extract Text using Gemini (Native PDF Support) ---
async function extractTextWithGemini(filePath, mimeType = "application/pdf") {
    try {
        const fileBuffer = fs.readFileSync(filePath);
        // Convert file to Base64 to send to Google
        const base64Data = fileBuffer.toString('base64');

        // 🔥 FIX: Using the model found in your list
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        
        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            },
            "Extract all the text from this document as plain text. Do not summarize, just give me the raw content."
        ]);

        return result.response.text();
    } catch (error) {
        console.error("❌ Gemini Extraction Error:", error);
        throw error;
    }
}

// --- Helper: Vector Math (Cosine Similarity) ---
function dotProduct(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        sum += a[i] * b[i];
    }
    return sum;
}

// --- Route 1: Upload PDF ---
app.post('/upload', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        console.log("📂 Processing PDF with Gemini:", req.file.originalname);

        // A. Extract Text
        const text = await extractTextWithGemini(req.file.path);
        
        if (!text) {
            return res.status(500).json({ error: "Failed to extract text from PDF" });
        }

        // B. Store Text
        resumeChunks = [text]; 

        // C. Generate Embeddings
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        resumeEmbeddings = [result.embedding.values];

        console.log("✅ PDF Processed & Embedded!");
        
        // Clean up
        fs.unlinkSync(req.file.path);

        res.json({ message: "PDF processed successfully", preview: text.substring(0, 100) + "..." });

    } catch (error) {
        console.error("❌ Error:", error);
        // Handle Rate Limits gracefully
        if (error.status === 429) {
            return res.status(429).json({ error: "Too Many Requests. Please wait 1 minute and try again." });
        }
        res.status(500).json({ error: "Failed to process PDF" });
    }
});

// --- Route 2: Chat with Resume ---
app.post('/chat', async (req, res) => {
    try {
        const { question } = req.body;
        if (!resumeChunks.length) return res.status(400).json({ error: "Please upload a PDF first!" });

        console.log("❓ Question:", question);

        // A. Embed Question
        const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const qResult = await embeddingModel.embedContent(question);
        const qEmbedding = qResult.embedding.values;

        // B. Find Best Match
        let bestScore = -1;
        let bestChunk = resumeChunks[0]; 

        for (let i = 0; i < resumeEmbeddings.length; i++) {
            const score = dotProduct(qEmbedding, resumeEmbeddings[i]);
            if (score > bestScore) {
                bestScore = score;
                bestChunk = resumeChunks[i];
            }
        }

        // C. Generate Answer
        // 🔥 FIX: Using the same model here
        const chatModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        
        const prompt = `
        You are an HR Assistant. Answer the question based strictly on the resume context below.
        
        Context:
        ${bestChunk}
        
        User Question: ${question}
        `;

        const result = await chatModel.generateContent(prompt);
        const answer = result.response.text();
        
        console.log("🤖 Answer:", answer);
        res.json({ answer: answer });

    } catch (error) {
        console.error("❌ Chat Error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});