// test-lib.js
try {
    const pdf = require('pdf-parse');
    console.log("✅ Library Loaded Successfully!");
    console.log("👉 Type:", typeof pdf);
    console.log("👉 Content:", pdf);
    
    if (typeof pdf === 'function') {
        console.log("🎉 SUCCESS: The library is a function. It should work!");
    } else {
        console.log("❌ FAILURE: The library is NOT a function. Re-install needed.");
    }
} catch (error) {
    console.log("❌ CRITICAL ERROR: Library not found!");
    console.log(error.message);
}