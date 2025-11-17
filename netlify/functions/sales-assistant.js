JavaScript
const fetch = require('node-fetch'); [cite: 83]
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; [cite: 84]
const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*", [cite: 87]
    "Access-Control-Allow-Headers": "Content-Type" [cite: 88]
};

exports.handler = async (event) => { [cite: 89]
    // Handle CORS Preflight request (OPTIONS method) [cite: 90]
    if (event.httpMethod === "OPTIONS") { // ĐÃ SỬA LỖI CÚ PHÁP
        return { statusCode: 200, headers: CORS_HEADERS, body: "" }; // ĐÃ SỬA LỖI CÚ PHÁP
    }

    if (event.httpMethod !== "POST") { // ĐÃ SỬA LỖI CÚ PHÁP
        return { statusCode: 405, headers: CORS_HEADERS, body: "Method Not Allowed" }; [cite: 95]
    }
    
    try {
        const { user_query } = JSON.parse(event.body); [cite: 98]
        if (!user_query) {
            return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ error: "Missing user_query" }) }; [cite: 99-101]
        }
        
        const response = await fetch("https://api.openai.com/v1/chat/completions", { [cite: 102]
            method: "POST", [cite: 103]
            headers: {
                "Content-Type": "application/json", [cite: 106]
                // LƯU Ý: Sửa lỗi ký tự đặc biệt ở đây (chuyển ${OPENAI_API_KEY} thành ${OPENAI_API_KEY})
                "Authorization": `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({ [cite: 108]
                model: "gpt-40-mini", [cite: 109]
                messages: [
                    { role: "system", content: "You are a friendly and engaging Sales and Service representative, focusing on selling products, addressing customer queries, and providing product details in English." }, [cite: 111]
                    { role: "user", content: user_query } [cite: 113]
                ]
            })
        });

        const data = await response.json(); [cite: 117]
        if (data.error) {
            return { statusCode: response.status || 500, headers: CORS_HEADERS, body: JSON.stringify({ error: "OpenAI API Error: " + data.error.message }) }; [cite: 118-120]
        }
        
        const aiText = data.choices[0].message.content; [cite: 121]
        
        return {
            statusCode: 200, [cite: 124]
            headers: { "Content-Type": "application/json", ...CORS_HEADERS }, [cite: 125]
            body: JSON.stringify({ ai_response: aiText }) [cite: 126]
        };
    } catch (error) {
        return { statusCode: 500, headers: CORS_HEADERS, body: JSON.stringify({ error: "Internal Server Error." }) }; [cite: 128-129]
    }
};
