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

// Démonstration avec des résultats prédéfinis adaptés à la beauté africaine
export async function analyzeFacialFeatures(base64Image: string): Promise<FacialAnalysisResult> {
  // Simulation d'un délai d'analyse
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const demoResults: FacialAnalysisResult[] = [
    {
      skinTone: "Teint ébène riche et lumineux",
      faceShape: "ovale",
      eyeColor: "brun profond",
      recommendations: {
        foundationShade: "Teinte riche ébène - Fenty Beauty 498 ou MAC NW58",
        bestColors: [
          "Or cuivré", "Rouge terre de Sienne", "Violet prune", 
          "Vert émeraude", "Orange corail", "Jaune doré"
        ],
        avoidColors: [
          "Rose pâle", "Beige clair", "Bleu pastel"
        ],
        makeupTips: [
          "Utilisez un highlighter doré pour sublimer vos pommettes",
          "Les rouges à lèvres orangés et corail vous mettront en valeur",
          "Osez les fards à paupières métalliques cuivrés",
          "Un contouring subtil avec une poudre bronze sublimera votre visage"
        ]
      }
    },
    {
      skinTone: "Teint caramel doré chaleureux",
      faceShape: "rond",
      eyeColor: "noisette",
      recommendations: {
        foundationShade: "Teinte caramel - Fenty Beauty 360 ou MAC NC50",
        bestColors: [
          "Bronze doré", "Terracotta", "Bordeaux", 
          "Vert kaki", "Orange brûlé", "Prune"
        ],
        avoidColors: [
          "Rose bonbon", "Argent froid", "Bleu glacier"
        ],
        makeupTips: [
          "Structurez votre visage avec un contouring doux",
          "Les tons chauds comme le bronze sublimeront vos yeux",
          "Optez pour des rouges à lèvres dans les tons berry",
          "Un blush pêche donnera de l'éclat à votre teint"
        ]
      }
    },
    {
      skinTone: "Teint chocolat au lait velouté",
      faceShape: "carré",
      eyeColor: "brun ambré",
      recommendations: {
        foundationShade: "Teinte chocolat - Fenty Beauty 440 ou MAC NW55",
        bestColors: [
          "Cuivre rose", "Burgundy", "Doré antique", 
          "Violet améthyste", "Rouge cerise", "Marron glacé"
        ],
        avoidColors: [
          "Blanc nacré", "Rose poudrée", "Gris clair"
        ],
        makeupTips: [
          "Adoucissez les angles avec un contouring rond",
          "Les fards cuivrés feront ressortir l'ambre de vos yeux",
          "Privilégiez les rouges à lèvres dans les tons wine",
          "Un highlighter rose-doré illuminera parfaitement votre teint"
        ]
      }
    }
  ];
  
  // Retourne un résultat aléatoire parmi les démos
  const randomIndex = Math.floor(Math.random() * demoResults.length);
  return demoResults[randomIndex];
}

export async function generateMakeupRecommendations(
  skinTone: string, 
  faceShape: string, 
  occasion: string = "everyday"
): Promise<MakeupRecommendation[]> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const demoRecommendations: MakeupRecommendation[] = [
    {
      lookName: "Look Naturel Sénégalais",
      difficulty: "beginner",
      products: [
        {
          type: "Foundation",
          shade: "Adapté à votre teint",
          application: "Appliquez avec une éponge humide en tapotant"
        },
        {
          type: "Mascara",
          shade: "Brun chocolat",
          application: "Brossez les cils de la racine aux pointes"
        },
        {
          type: "Rouge à lèvres",
          shade: "Nude rosé",
          application: "Appliquez directement ou avec un pinceau"
        }
      ],
      steps: [
        "Hydratez votre peau avec une crème adaptée",
        "Appliquez la foundation uniformément",
        "Ajoutez une touche de mascara",
        "Terminez avec le rouge à lèvres nude"
      ],
      culturalNotes: "Look inspiré de la beauté naturelle sénégalaise, parfait pour le quotidien"
    },
    {
      lookName: "Look Soirée Élégante",
      difficulty: "intermediate",
      products: [
        {
          type: "Fard à paupières",
          shade: "Cuivré métallique",
          application: "Estompez sur toute la paupière mobile"
        },
        {
          type: "Eyeliner",
          shade: "Noir intense",
          application: "Tracez une ligne fine le long des cils supérieurs"
        },
        {
          type: "Rouge à lèvres",
          shade: "Rouge bordeaux",
          application: "Précision avec un pinceau à lèvres"
        }
      ],
      steps: [
        "Préparez les yeux avec une base",
        "Appliquez le fard cuivré",
        "Tracez l'eyeliner",
        "Intensifiez avec du mascara",
        "Appliquez le rouge bordeaux"
      ],
      culturalNotes: "Look sophistiqué inspiré des couleurs terre d'Afrique"
    },
    {
      lookName: "Look Festival Coloré",
      difficulty: "advanced",
      products: [
        {
          type: "Fards à paupières",
          shade: "Palette multicolore (or, orange, violet)",
          application: "Créez un dégradé coloré"
        },
        {
          type: "Highlighter",
          shade: "Doré intense",
          application: "Illuminez pommettes, nez et front"
        },
        {
          type: "Rouge à lèvres",
          shade: "Orange corail brillant",
          application: "Couleur pleine avec gloss"
        }
      ],
      steps: [
        "Créez une base parfaite",
        "Travaillez le dégradé coloré sur les yeux",
        "Ajoutez de l'intensité avec l'eyeliner",
        "Illuminez avec le highlighter",
        "Finalisez avec les lèvres colorées"
      ],
      culturalNotes: "Look vibrant célébrant la joie et les couleurs de l'Afrique de l'Ouest"
    }
  ];
  
  return demoRecommendations;
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
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    compatible: true,
    score: 8.5,
    explanation: `Cette teinte ${productShade} se marie parfaitement avec votre ${skinTone}. Les sous-tons chauds de ce produit complètent naturellement votre carnation.`,
    alternativeShades: ["Teinte similaire plus intense", "Version plus subtile", "Variante avec reflets dorés"]
  };
}