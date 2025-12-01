// File: netlify/functions/rag-bot.js
// 1. IMPORT AND INITIALIZE
const { GoogleGenAI } = require('@google/genai');
// The SDK automatically uses the GEMINI_API_KEY environment variable.
const ai = new GoogleGenAI({});
// 2. KNOWLEDGE BASE (In-Context Learning Content)
// Students: Paste your structured policy content here.
const POLICY_KNOWLEDGE = `
 [START COMPANY POLICY]
 1. HR Policies
 1.2. Leave Policy
 • Annual Leave: 12 days/year.
 • Process: Submit request on system -> Manager approval -> HR
confirmation.

 2. IT & Security Policies
 2.1. Password Policy
 • Change password every 90 days.
 • Password minimum 8 characters (must include upper, lower, and
numbers).
 [END COMPANY POLICY]
`;
// 3. MAIN HANDLER
exports.handler = async (event) => {
 // === 3.1. FIX: Handle CORS Preflight (OPTIONS) Request ===
 // This is essential for the browser to allow the Odoo site to
communicate with Netlify.
 if (event.httpMethod === "OPTIONS") {
 return {
 statusCode: 204, // 204 No Content is standard for a successful
preflight
 headers: {
 "Access-Control-Allow-Origin": "*", // Allows access from any
domain
 "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
 "Access-Control-Allow-Headers": "Content-Type",
 "Access-Control-Max-Age": "86400",
 },
 body: ''
 };
 }
 // =======================================================

 if (event.httpMethod !== "POST") {
 return { statusCode: 405, body: "Method Not Allowed" };
 }
 try {
 const { user_query } = JSON.parse(event.body);
 // 3.2. DEFINE ROLE AND CONSTRUCT ICL PROMPT
 const system_prompt = `You are a strict internal policy assistant.
Answer employee questions ONLY based on the following policy document. If the
information is not explicitly found in the document, reply with: "Sorry, I
cannot find this information in the policy document."`;

 const full_prompt =
`${system_prompt}\n\n${POLICY_KNOWLEDGE}\n\nQuestion: ${user_query}`;

 // 3.3. CALL GEMINI API
 const response = await ai.models.generateContent({
 model: 'gemini-2.5-flash', // A fast and cost-effective model
suitable for ICL
 contents: full_prompt,
 config: {
 temperature: 0.1, // Low temperature for factual, policybased answers
 }
 });
 const bot_answer = response.text.trim();
 // 3.4. SUCCESS RESPONSE (STATUS 200) - Includes necessary CORS
headers
 return {
 statusCode: 200,
 headers: {
 "Content-Type": "application/json",
 "Access-Control-Allow-Origin": "*",
 "Access-Control-Allow-Methods": "POST, OPTIONS",
 "Access-Control-Allow-Headers": "Content-Type",
 },
 body: JSON.stringify({
 answer: bot_answer,
 }),
 };
 } catch (error) {
 console.error("Gemini API Error:", error);

 // 3.5. ERROR RESPONSE (STATUS 500) - Includes necessary CORS headers
 return {
 statusCode: 500,
 headers: {
 "Access-Control-Allow-Origin": "*",
 "Access-Control-Allow-Methods": "POST, OPTIONS",
 "Access-Control-Allow-Headers": "Content-Type",
 "Content-Type": "application/json"
 },
 body: JSON.stringify({
 error: "AI Internal Error. Please check GEMINI_API_KEY/Credit
on Netlify."
 })
 };
 }
};
