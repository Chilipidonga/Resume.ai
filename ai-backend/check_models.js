require('dotenv').config();
const apiKey = process.env.GEMINI_API_KEY;

async function checkModels() {
  console.log("🔍 Searching for models...");
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    if (data.error) {
      console.error("❌ Error:", data.error.message);
      return;
    }

    // Eesari List motham print cheddam!
    console.log("\n✅ AVAILABLE MODELS LIST (Menu Card):");
    console.log("-----------------------------------");
    const names = data.models.map(m => m.name.replace('models/', ''));
    console.log(names); // <--- This will show everything
    console.log("-----------------------------------");

  } catch (error) {
    console.error("Connection Failed:", error.message);
  }
}

checkModels();