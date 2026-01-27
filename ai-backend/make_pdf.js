const PDFDocument = require('pdfkit');
const fs = require('fs');

// Create a document
const doc = new PDFDocument();

// Pipe its output to a file named 'valid_resume.pdf'
doc.pipe(fs.createWriteStream('valid_resume.pdf'));

// Add Content (Raghava's Details)
doc.fontSize(25).text('RESUME OF RAGHAVA', { align: 'center' });
doc.moveDown();

doc.fontSize(14).text('ROLE: MERN Stack Developer');
doc.text('LOCATION: Hyderabad, India');
doc.moveDown();

doc.text('SKILLS:');
doc.text('- MongoDB, Express, React, Node.js');
doc.text('- Generative AI, LLMs, Vector Databases');
doc.text('- JavaScript, Python');
doc.moveDown();

doc.text('EXPERIENCE:');
doc.text('- Built an AI-Powered Resume Chatbot using MERN Stack.');
doc.text('- Created RAG Applications using Google Gemini API.');

// Finalize PDF file
doc.end();

console.log("✅ Success! Created 'valid_resume.pdf'. Please upload THIS file.");