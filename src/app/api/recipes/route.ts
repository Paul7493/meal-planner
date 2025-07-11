import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Recipe } from "@/lib/types/recipe";

// Mock data for development
export let mockRecipes: Recipe[] = [
  {
    _id: "1",
    title: "Classic Spaghetti Carbonara",
    description: "A creamy Italian pasta dish with pancetta and egg sauce",
    ingredients: [
      { name: "Spaghetti", amount: "400", unit: "g" },
      { name: "Pancetta", amount: "150", unit: "g" },
      { name: "Eggs", amount: "4", unit: "large" },
      { name: "Parmesan", amount: "100", unit: "g" },
    ],
    instructions: [
      "Boil the spaghetti in salted water",
      "Fry the pancetta until crispy",
      "Mix eggs and cheese",
      "Combine all ingredients",
    ],
    cookingTime: 30,
    servings: 4,
    image: "https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg",
    author: {
      _id: "1",
      name: "Demo User",
      image: "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg",
    },
    difficulty: "Medium",
    createdAt: new Date().toISOString(),
  },
  {
    _id: "2",
    title: "Grilled Salmon with Asparagus",
    description: "Healthy and delicious salmon with grilled vegetables",
    ingredients: [
      { name: "Salmon fillet", amount: "500", unit: "g" },
      { name: "Asparagus", amount: "400", unit: "g" },
      { name: "Lemon", amount: "1", unit: "whole" },
      { name: "Olive oil", amount: "2", unit: "tbsp" },
    ],
    instructions: [
      "Preheat the grill",
      "Season the salmon",
      "Grill for 4-5 minutes each side",
      "Serve with grilled asparagus",
    ],
    cookingTime: 25,
    servings: 4,
    image: "https://images.pexels.com/photos/3763847/pexels-photo-3763847.jpeg",
    author: {
      _id: "1",
      name: "Demo User",
      image: "https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg",
    },
    difficulty: "Easy",
    createdAt: new Date().toISOString(),
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const difficulty = searchParams.get("difficulty");

    let filteredRecipes = [...mockRecipes];

    if (search) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (difficulty) {
      filteredRecipes = filteredRecipes.filter(recipe =>
        recipe.difficulty === difficulty
      );
    }

    return NextResponse.json(filteredRecipes);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return NextResponse.json(
      { error: "Error fetching recipes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "You must be signed in to create a recipe" },
        { status: 401 }
      );
    }

    const data = await req.json();
    const newRecipe = {
      _id: (mockRecipes.length + 1).toString(),
      ...data,
      author: {
        _id: session.user.id,
        name: session.user.name,
        image: session.user.image,
      },
      createdAt: new Date().toISOString(),
    };

    mockRecipes.push(newRecipe);

    return NextResponse.json(newRecipe, { status: 201 });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return NextResponse.json(
      { error: "Error creating recipe" },
      { status: 500 }
    );
  }
}
