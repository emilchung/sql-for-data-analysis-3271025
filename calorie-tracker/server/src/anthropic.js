import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const IDENTIFY_FOOD_TOOL = {
  name: "log_food_items",
  description:
    "Record the distinct food items visible in the photo, each with an estimated portion size in grams.",
  input_schema: {
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
  const message = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    tools: [IDENTIFY_FOOD_TOOL],
    tool_choice: { type: "tool", name: "log_food_items" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Image,
            },
          },
          {
            type: "text",
            text:
              "Identify each distinct food item in this photo and estimate its portion size in grams. " +
              "Use plain, generic food names that would match entries in a nutrition database.",
          },
        ],
      },
    ],
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse) {
    throw new Error("Claude did not return structured food items");
  }
  return toolUse.input.items ?? [];
}
