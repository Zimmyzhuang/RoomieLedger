export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

export interface Step {
  number: number;
  instruction: string;
  duration?: string;
}

export interface RecipeSource {
  creatorName?: string;
  handle?: string;
  url: string;
}

export interface Recipe {
  title: string;
  description: string;
  prepTime?: string;
  cookTime?: string;
  baseServings: number;
  ingredients: Ingredient[];
  steps: Step[];
  source: RecipeSource;
  tags?: string[];
}

export interface ExtractionError {
  message: string;
  code: "INVALID_URL" | "PRIVATE_ACCOUNT" | "NOT_RECIPE" | "RATE_LIMIT" | "TIMEOUT" | "UNKNOWN";
}
