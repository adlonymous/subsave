/**
 * Gemini AI Service for Subscription Pricing Analysis
 * Analyzes subscription pricing and recommends optimal payment duration
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI lazily
let genAI: GoogleGenerativeAI | null = null;

const getGeminiAPIKey = () => {
  // Try to get from environment variables
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('EXPO_PUBLIC_GEMINI_API_KEY is not set. Gemini AI features will be disabled.');
    return null;
  }
  return apiKey;
};

const getGeminiAI = () => {
  if (!genAI) {
    const apiKey = getGeminiAPIKey();
    if (!apiKey) {
      throw new Error('Gemini API key is not available. Please set EXPO_PUBLIC_GEMINI_API_KEY in your .env file.');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
};

export interface PricingOption {
  duration: 'monthly' | 'quarterly' | 'yearly';
  price: number;
  totalAnnualCost: number;
  savings: number;
  recommendation: string;
}

export interface SubscriptionAnalysis {
  serviceName: string;
  pricingOptions: PricingOption[];
  recommendedOption: PricingOption;
  reasoning: string;
  vaultYieldBenefit: number;
}

/**
 * Analyze subscription pricing and recommend optimal duration
 */
export async function analyzeSubscriptionPricing(
  serviceName: string,
  monthlyPrice?: number
): Promise<SubscriptionAnalysis> {
  try {
    const ai = getGeminiAI();
    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a financial advisor helping users optimize their subscription payments. 
Provide accurate pricing information for "${serviceName}" based on current market rates.

CRITICAL: Return ONLY valid JSON. No markdown, no explanations, no additional text.

IMPORTANT: Only include pricing options that actually exist for this service. Many services only offer monthly plans.

Context:
- User has a vault with 7% APY (Annual Percentage Yield)
- Use your knowledge of current pricing for this service
- Only include real pricing options (don't make up quarterly/yearly if they don't exist)
- Consider the opportunity cost of paying upfront vs monthly
- Factor in the 7% APY when money is kept in the vault

${monthlyPrice ? `Given monthly price: $${monthlyPrice}` : 'Provide current pricing for this service'}

Please provide:
1. Only the pricing options that actually exist for this service
2. If only monthly plans exist, clearly state that
3. If multiple tiers exist, list all available options
4. Total annual cost for each option
5. Savings compared to monthly payments (if applicable)
6. Recommendation considering the 7% APY vault
7. Reasoning for the recommendation

Return ONLY this JSON structure:
{
  "serviceName": "${serviceName}",
  "pricingOptions": [
    {
      "duration": "monthly",
      "price": 15.99,
      "totalAnnualCost": 191.88,
      "savings": 0,
      "recommendation": "Standard monthly billing"
    }
  ],
  "recommendedOption": {
    "duration": "monthly",
    "price": 15.99,
    "totalAnnualCost": 191.88,
    "savings": 0,
    "recommendation": "Only monthly plans available"
  },
  "reasoning": "This service only offers monthly billing. No quarterly or yearly discounts are available.",
  "vaultYieldBenefit": 0
}

Provide accurate, current pricing information for "${serviceName}".
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean and extract JSON from the response
    let cleanedText = text.trim();
    
    // Remove any markdown formatting or extra text
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }
    
    // Remove any trailing characters that might break JSON parsing
    cleanedText = cleanedText.replace(/[^}]*$/, '');

    // Parse the JSON response with error handling
    let analysis: SubscriptionAnalysis;
    try {
      analysis = JSON.parse(cleanedText) as SubscriptionAnalysis;
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Raw response:', text);
      console.error('Cleaned text:', cleanedText);
      throw new Error('Failed to parse AI response as JSON');
    }
    
    return analysis;
  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Fallback analysis if Gemini fails
    return createFallbackAnalysis(serviceName, monthlyPrice);
  }
}

/**
 * Create fallback analysis when Gemini API fails
 */
function createFallbackAnalysis(serviceName: string, monthlyPrice?: number): SubscriptionAnalysis {
  const basePrice = monthlyPrice || 15.99;
  
  // Default to monthly-only plans for most services
  const pricingOptions: PricingOption[] = [
    {
      duration: 'monthly',
      price: basePrice,
      totalAnnualCost: basePrice * 12,
      savings: 0,
      recommendation: 'Only monthly plans available'
    }
  ];

  const recommendedOption = pricingOptions[0]; // Monthly is the only option
  const vaultYieldBenefit = 0; // No upfront payment, so no opportunity cost

  return {
    serviceName,
    pricingOptions,
    recommendedOption,
    reasoning: `This service only offers monthly billing. No quarterly or yearly discounts are available. The monthly cost is $${basePrice}.`,
    vaultYieldBenefit
  };
}

/**
 * Get quick pricing recommendation for a service
 */
export async function getQuickPricingRecommendation(serviceName: string): Promise<{
  recommendedDuration: string;
  savings: number;
  reasoning: string;
}> {
  try {
    const analysis = await analyzeSubscriptionPricing(serviceName);
    
    return {
      recommendedDuration: analysis.recommendedOption.duration,
      savings: analysis.recommendedOption.savings,
      reasoning: analysis.reasoning
    };
  } catch (error) {
    console.error('Quick pricing recommendation failed:', error);
    
    return {
      recommendedDuration: 'yearly',
      savings: 0,
      reasoning: 'Unable to analyze pricing. Defaulting to yearly recommendation.'
    };
  }
}
