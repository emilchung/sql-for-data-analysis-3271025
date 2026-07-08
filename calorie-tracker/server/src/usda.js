const USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1";

function getApiKey() {
  return process.env.USDA_API_KEY || "DEMO_KEY";
}

function caloriesPer100gFromFood(food) {
  const energy = food.foodNutrients?.find(
    (n) => n.nutrientName === "Energy" && n.unitName === "KCAL"
  );
  return energy ? energy.value : null;
}

export async function lookupCaloriesPer100g(foodName) {
  const url = new URL(`${USDA_BASE_URL}/foods/search`);
  url.searchParams.set("query", foodName);
  url.searchParams.set("pageSize", "5");
  url.searchParams.set("dataType", "Foundation,SR Legacy");
  url.searchParams.set("api_key", getApiKey());

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`USDA lookup failed for "${foodName}": ${response.status}`);
  }
  const data = await response.json();
  const foods = data.foods ?? [];

  for (const food of foods) {
    const perHundredGrams = caloriesPer100gFromFood(food);
    if (perHundredGrams != null) {
      return { caloriesPer100g: perHundredGrams, matchedName: food.description };
    }
  }
  return null;
}
