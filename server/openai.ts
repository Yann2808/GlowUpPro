import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Vous êtes une experte maquilleuse spécialisée dans la beauté des femmes africaines et afro-caribéennes. 
          Analysez les traits du visage dans l'image et fournissez des recommandations maquillage personnalisées. 
          Concentrez-vous sur la célébration de la beauté naturelle et des conseils culturellement pertinents.
          Répondez avec JSON dans ce format exact: {
            "skinTone": "description du teint (ex: 'ébène riche', 'brun doré', 'caramel chaud')",
            "faceShape": "forme du visage (ovale, rond, carré, cœur, diamant)",
            "eyeColor": "description de la couleur des yeux",
            "recommendations": {
              "foundationShade": "recommandation de teinte de fond de teint spécifique",
              "bestColors": ["tableau des couleurs qui complètent le teint"],
              "avoidColors": ["couleurs à éviter"],
              "makeupTips": ["tableau de conseils maquillage spécifiques pour cette personne"]
            }
          }`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analysez les traits du visage de cette personne et fournissez des recommandations maquillage personnalisées en vous concentrant sur son teint, la forme de son visage et la couleur de ses yeux. Considérez les standards de beauté africains et afro-caribéens."
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
    console.error("Error analyzing facial features:", error);
    throw new Error("Failed to analyze facial features: " + (error as Error).message);
  }
}

export async function generateMakeupRecommendations(
  skinTone: string, 
  faceShape: string, 
  occasion: string = "everyday"
): Promise<MakeupRecommendation[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Vous êtes une experte maquilleuse spécialisée dans la beauté des femmes africaines et afro-caribéennes. 
          Générez 3-4 recommandations de looks maquillage basées sur le teint, la forme du visage et l'occasion fournis.
          Concentrez-vous sur la célébration de la beauté naturelle et des conseils culturellement pertinents et pratiques.
          Considérez les traditions de beauté et préférences des femmes sénégalaises et ouest-africaines.
          Répondez avec un tableau JSON dans ce format exact: {
            "looks": [{
              "lookName": "nom descriptif du look",
              "difficulty": "beginner|intermediate|advanced",
              "products": [
                {
                  "type": "type de produit (fond de teint, correcteur, fard à paupières, etc.)",
                  "shade": "recommandation de teinte spécifique",
                  "application": "comment appliquer ce produit"
                }
              ],
              "steps": ["instructions étape par étape"],
              "culturalNotes": "contexte culturel ou inspiration optionnel"
            }]
          }`
        },
        {
          role: "user",
          content: `Générez des recommandations maquillage pour:
          - Teint: ${skinTone}
          - Forme du visage: ${faceShape}
          - Occasion: ${occasion}
          
          Fournissez 3-4 looks maquillage différents allant du naturel au plus spectaculaire, appropriés pour les femmes sénégalaises.`
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.looks || result.recommendations || [];
  } catch (error) {
    console.error("Error generating makeup recommendations:", error);
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
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Vous êtes une experte maquilleuse spécialisée dans l'assortiment de couleurs pour les teints africains et afro-caribéens.
          Analysez la compatibilité d'un produit maquillage avec le teint donné.
          Répondez avec JSON dans ce format exact: {
            "compatible": boolean,
            "score": nombre entre 0-10,
            "explanation": "explication détaillée de pourquoi ce produit fonctionne ou ne fonctionne pas",
            "alternativeShades": ["tableau d'options de teintes meilleures si score < 7"]
          }`
        },
        {
          role: "user",
          content: `Analysez la compatibilité de:
          - Teint: ${skinTone}
          - Type de produit: ${productType}
          - Teinte du produit: ${productShade}
          
          Évaluez à quel point cette teinte de produit fonctionnerait pour ce teint.`
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result;
  } catch (error) {
    console.error("Error analyzing product compatibility:", error);
    throw new Error("Failed to analyze product compatibility: " + (error as Error).message);
  }
}
