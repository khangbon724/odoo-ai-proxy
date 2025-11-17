JavaScript
const fetch = require('node-fetch');
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Key is secure here! [cite: 36]
const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*", // Allows Odoo domain to access [cite: 38]
    "Access-Control-Allow-Headers": "Content-Type" [cite: 39]
};

exports.handler = async (event) => {
    // Handle CORS Preflight request (OPTIONS method) [cite: 41]
    if (event.httpMethod === "OPTIONS") { // ĐÃ SỬA LỖI CÚ PHÁP
        return { statusCode: 200, headers: CORS_HEADERS, body: "" }; // ĐÃ SỬA LỖI CÚ PHÁP
    }

    if (event.httpMethod !== "POST") { // ĐÃ SỬA LỖI CÚ PHÁP
        return { statusCode: 405, headers: CORS_HEADERS, body: "Method Not Allowed" }; [cite: 47]
    }
    
    try {
        const { user_query } = JSON.parse(event.body); [cite: 49]
        if (!user_query) {
            return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Missing user_query" }) }; [cite: 50-52]
        }
        
        const response = await fetch("https://api.openai.com/v1/chat/completions", { [cite: 53]
            method: "POST", [cite: 54]
            headers: {
                "Content-Type": "application/json", [cite: 57]
                // LƯU Ý: Sửa lỗi ký tự đặc biệt ở đây (chuyển ${OΡΕΝΑΙ_ΑΡΙ_ΚEY} thành ${OPENAI_API_KEY})
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({ [cite: 59]
                model: "gpt-40-mini", [cite: 60]
                messages: [
                    { role: "system", content: "You are a professional Human Resources assistant, providing concise and accurate information about company policies, hiring, and employee benefits in English." }, [cite: 62]
                    { role: "user", content: user_query } [cite: 65]
                ]
            })
        });

        const data = await response.json(); [cite: 67]
        if (data.error) {
            return { statusCode: response.status || 500, headers: CORS_HEADERS, body: JSON.stringify({ error: "OpenAI API Error: " + data.error.message }) }; [cite: 68-70]
        }
        
        const aiText = data.choices[0].message.content; [cite: 71]
        
        return {
            statusCode: 200, [cite: 74]
            headers: { "Content-Type": "application/json", ...CORS_HEADERS }, [cite: 75]
            body: JSON.stringify({ ai_response: aiText }) [cite: 75]
        };
    } catch (error) {
        return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: "Internal Server Error." }) }; [cite: 77-78]
    }
};
