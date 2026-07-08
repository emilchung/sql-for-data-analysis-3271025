import { GoogleGenAI, FunctionCallingConfigMode } from "@google/genai";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const LOG_FOOD_ITEMS_DECLARATION = {
  name: "log_food_items",
  description:
    "Record the distinct food items visible in the photo, each with an estimated portion size in grams.",
  parametersJsonSchema: {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description:
                "Short, generic food name suitable for a nutrition database lookup, e.g. 'grilled chicken breast', 'steamed white rice', 'banana'.",
            },
            estimated_grams: {
              type: "number",
              description: "Best-guess portion size in grams based on visual size cues in the photo.",
            },
            notes: {
              type: "string",
              description: "Optional short note, e.g. preparation method or visible toppings.",
            },
          },
          required: ["name", "estimated_grams"],
        },
      },
    },
    required: ["items"],
  },
};

export async function identifyFoodItems({ base64Image, mediaType }) {
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      { inlineData: { mimeType: mediaType, data: base64Image } },
      {
        text:
          "Identify each distinct food item in this photo and estimate its portion size in grams. " +
          "Use plain, generic food names that would match entries in a nutrition database. " +
          "Call log_food_items with the result.",
      },
    ],
    config: {
      tools: [{ functionDeclarations: [LOG_FOOD_ITEMS_DECLARATION] }],
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.ANY,
          allowedFunctionNames: ["log_food_items"],
        },
      },
    },
  });

  const call = response.functionCalls?.[0];
  if (!call) {
    throw new Error("Gemini did not return structured food items");
  }
  return call.args?.items ?? [];
}
