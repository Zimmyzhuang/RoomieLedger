import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import type { Recipe } from "@/types/recipe";

const client = new Anthropic();

const INSTAGRAM_URL_PATTERN =
  /^https?:\/\/(www\.)?(instagram\.com|instagr\.am)\/(reel|p|reels)\/[\w-]+/i;

const EXTRACTION_PROMPT = `You are a recipe extraction expert. I'm going to give you an Instagram Reel URL. Use web search to find the content of this reel (caption, comments, any available info). Then extract a complete cooking recipe from whatever you find.

IMPORTANT: Respond with ONLY a valid JSON object, no markdown, no backticks, no explanation. If you cannot find a recipe, return {"error": "reason"}.

JSON schema:
{
  "title": "Recipe name",
  "description": "1-2 sentence description",
  "prepTime": "e.g. 15 min",
  "cookTime": "e.g. 30 min",
  "baseServings": 4,
  "ingredients": [{"name": "ingredient name", "amount": 1.5, "unit": "cups"}],
  "steps": [{"number": 1, "instruction": "Step text here", "duration": "optional time"}],
  "source": {"creatorName": "Name if found", "handle": "@handle if found", "url": "THE_URL"},
  "tags": ["tag1", "tag2"]
}

Rules:
- amounts must be numbers (use decimals: 0.5 not "1/2")
- unit should be: cups, tbsp, tsp, oz, lb, g, kg, ml, L, cloves, pieces, slices, or "" for countable items
- steps should be clear, actionable, and numbered
- If the caption is vague, use your cooking knowledge to fill in reasonable details
- Include ALL ingredients mentioned or implied
- ONLY output JSON, nothing else`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { message: "URL is required", code: "INVALID_URL" },
        { status: 400 }
      );
    }

    if (!INSTAGRAM_URL_PATTERN.test(url.trim())) {
      return NextResponse.json(
        {
          message:
            "Please provide a valid Instagram Reel or Post URL (e.g. https://www.instagram.com/reel/...)",
          code: "INVALID_URL",
        },
        { status: 400 }
      );
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [
        {
          role: "user",
          content: `${EXTRACTION_PROMPT}\n\nURL: ${url.trim()}`,
        },
      ],
    });

    const textContent = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    if (!textContent) {
      return NextResponse.json(
        { message: "No response received from AI", code: "UNKNOWN" },
        { status: 502 }
      );
    }

    const cleaned = textContent
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    let recipe: Recipe;
    try {
      recipe = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        recipe = JSON.parse(match[0]);
      } else {
        return NextResponse.json(
          {
            message: "Could not parse recipe from AI response",
            code: "UNKNOWN",
          },
          { status: 502 }
        );
      }
    }

    if ("error" in recipe && (recipe as Record<string, unknown>).error) {
      const errorMsg = (recipe as Record<string, unknown>).error as string;
      const isPrivate =
        errorMsg.toLowerCase().includes("private") ||
        errorMsg.toLowerCase().includes("not accessible");
      const isNotRecipe =
        errorMsg.toLowerCase().includes("no recipe") ||
        errorMsg.toLowerCase().includes("not a recipe");

      return NextResponse.json(
        {
          message: errorMsg,
          code: isPrivate
            ? "PRIVATE_ACCOUNT"
            : isNotRecipe
              ? "NOT_RECIPE"
              : "UNKNOWN",
        },
        { status: 422 }
      );
    }

    recipe.source = {
      ...recipe.source,
      url: url.trim(),
    };

    return NextResponse.json(recipe);
  } catch (error: unknown) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        {
          message:
            "We're experiencing high demand. Please try again in a moment.",
          code: "RATE_LIMIT",
        },
        { status: 429 }
      );
    }

    if (error instanceof Anthropic.APIConnectionError) {
      return NextResponse.json(
        {
          message: "Could not connect to the AI service. Please try again.",
          code: "TIMEOUT",
        },
        { status: 504 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ message, code: "UNKNOWN" }, { status: 500 });
  }
}
