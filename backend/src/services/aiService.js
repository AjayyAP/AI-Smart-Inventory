const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI;
if (process.env.AI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.AI_API_KEY);
}

// 1. Product Description Generator
exports.generateDescriptionService = async (productName, category, tags) => {
  if (!genAI) return 'AI feature disabled (No API Key).';
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    const prompt = `
      Act as a high-end e-commerce copywriter. 
      Create a professional, persuasive, and SEO-optimized product description for:
      Product Name: "${productName}"
      Category: "${category}"
      Keywords/Tags: ${tags || 'None provided'}

      Constraints:
      - Highlight key benefits.
      - Maintain a premium tone.
      - Length: 50-70 words.
      - Return ONLY the description text.
    `;
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('AI Service Error (Generate Description):', error);
    throw error;
  }
};

// 2. Smart Reorder Recommendations
exports.getReorderSuggestionsService = async (inventoryData) => {
  if (!genAI) return { recommendation: 'AI feature disabled.', items: [] };
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    const prompt = `
      You are a Supply Chain Optimization Expert.
      Analyze the following inventory data (stock level vs reorder points):
      ${JSON.stringify(inventoryData)}

      Task:
      1. Identify items critical for restocking.
      2. Provide a brief strategic summary.
      3. Return a JSON object with this exact structure:
      {
        "summary": "String explaining the restocking strategy",
        "recommendations": [
          { "sku": "String", "name": "String", "suggestedAmount": Number, "priority": "High|Medium|Low" }
        ]
      }
      IMPORTANT: Return ONLY valid JSON. No markdown backticks.
    `;
    
    let result = await model.generateContent(prompt);
    let text = result.response.text();
    // Use regex to extract JSON if AI includes conversational filler
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI failed to return valid JSON format');
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('AI Service Error (Smart Reorder):', error);
    throw error;
  }
};

// 3. Inventory Chat Assistant
exports.processChatQueryService = async (userQuery, contextData) => {
  if (!genAI) return 'AI feature disabled. Please add AI_API_KEY.';
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    const prompt = `
      You are "SmartStock AI", a senior inventory analyst and assistant for the AI Smart Inventory & Supply Chain System.
      
      Business Context:
      ${JSON.stringify(contextData)}

      User Query: "${userQuery}"

      Instructions:
      - Use the provided context data to answer accurately.
      - If you don't know the answer, say so based on current system data.
      - Be professional, helpful, and concise.
      - If the user asks about stock levels or "what should I do", refer to low stock counts provided in context.
    `;
    
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('AI Service Error (Chat):', error);
    throw error;
  }
};
