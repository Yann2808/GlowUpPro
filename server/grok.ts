import OpenAI from "openai";

const grok = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY 
});

export interface FacialAnalysisResult {
  skinTone: string;
  faceShape: string;
  eyeColor: string;
  recommendations: {
    foundationShade: string;
    bestColors: string[];
    avoidColors: string[];
    makeupTips: string[];
  };
}

export interface MakeupRecommendation {
  lookName: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  products: Array<{
    type: string;
    shade: string;
    application: string;
  }>;
  steps: string[];
  culturalNotes?: string;
}

export async function analyzeFacialFeatures(base64Image: string): Promise<FacialAnalysisResult> {
  try {
    const response = await grok.chat.completions.create({
      model: "grok-2-vision-1212",
      messages: [
        {
          role: "system",
          content: `You are an expert makeup artist specializing in beauty for African and Afro-Caribbean women. 
          Analyze the facial features in the image and provide personalized makeup recommendations. 
          Focus on celebrating natural beauty and providing culturally relevant advice.
          Respond with JSON in this exact format: {
            "skinTone": "description of skin tone (e.g., 'rich ebony', 'golden brown', 'warm caramel')",
            "faceShape": "face shape (oval, round, square, heart, diamond)",
            "eyeColor": "eye color description",
            "recommendations": {
              "foundationShade": "specific foundation shade recommendation",
              "bestColors": ["array of colors that complement the skin tone"],
              "avoidColors": ["colors to avoid"],
              "makeupTips": ["array of specific makeup tips for this person"]
            }
          }`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this person's facial features and provide personalized makeup recommendations focusing on their skin tone, face shape, and eye color. Consider African and Afro-Caribbean beauty standards and preferences."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result as FacialAnalysisResult;
  } catch (error) {
    console.error("Error analyzing facial features with Grok:", error);
    throw new Error("Failed to analyze facial features: " + (error as Error).message);
  }
}

export async function generateMakeupRecommendations(
  skinTone: string, 
  faceShape: string, 
  occasion: string = "everyday"
): Promise<MakeupRecommendation[]> {
  try {
    const response = await grok.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content: `You are an expert makeup artist specializing in beauty for African and Afro-Caribbean women. 
          Generate 3-4 makeup look recommendations based on the provided skin tone, face shape, and occasion.
          Focus on celebrating natural beauty and providing culturally relevant, practical advice.
          Consider the beauty traditions and preferences of Senegalese and West African women.
          Respond with JSON array in this exact format: [{
            "lookName": "descriptive name of the look",
            "difficulty": "beginner|intermediate|advanced",
            "products": [
              {
                "type": "product type (foundation, concealer, eyeshadow, etc.)",
                "shade": "specific shade recommendation",
                "application": "how to apply this product"
              }
            ],
            "steps": ["step-by-step instructions"],
            "culturalNotes": "optional cultural context or inspiration"
          }]`
        },
        {
          role: "user",
          content: `Generate makeup recommendations for:
          - Skin tone: ${skinTone}
          - Face shape: ${faceShape}
          - Occasion: ${occasion}
          
          Please provide 3-4 different makeup looks ranging from natural to more dramatic, appropriate for Senegalese women.`
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.recommendations || result.looks || [];
  } catch (error) {
    console.error("Error generating makeup recommendations with Grok:", error);
    throw new Error("Failed to generate makeup recommendations: " + (error as Error).message);
  }
}

export async function analyzeProductCompatibility(
  skinTone: string,
  productType: string,
  productShade: string
): Promise<{
  compatible: boolean;
  score: number;
  explanation: string;
  alternativeShades?: string[];
}> {
  try {
    const response = await grok.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        {
          role: "system",
          content: `You are an expert makeup artist specializing in color matching for African and Afro-Caribbean skin tones.
          Analyze the compatibility of a makeup product with the given skin tone.
          Respond with JSON in this exact format: {
            "compatible": boolean,
            "score": number between 0-10,
            "explanation": "detailed explanation of why this product works or doesn't work",
            "alternativeShades": ["array of better shade options if score < 7"]
          }`
        },
        {
          role: "user",
          content: `Analyze the compatibility of:
          - Skin tone: ${skinTone}
          - Product type: ${productType}
          - Product shade: ${productShade}
          
          Please evaluate how well this product shade would work for this skin tone.`
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error analyzing product compatibility with Grok:", error);
    throw new Error("Failed to analyze product compatibility: " + (error as Error).message);
  }
}