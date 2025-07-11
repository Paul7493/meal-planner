import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Recipe } from "@/lib/types/recipe";
import { mockRecipes } from "../route";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const recipe = mockRecipes.find((r: Recipe) => r._id === params.id);

    if (!recipe) {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(recipe);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return NextResponse.json(
      { error: "Error fetching recipe" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "You must be signed in to update a recipe" },
        { status: 401 }
      );
    }

    const recipeIndex = mockRecipes.findIndex((r: Recipe) => r._id === params.id);
    
    if (recipeIndex === -1) {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      );
    }

    const recipe = mockRecipes[recipeIndex];
    if (recipe.author._id !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to update this recipe" },
        { status: 403 }
      );
    }

    const data = await req.json();
    const updatedRecipe: Recipe = {
      ...recipe,
      ...data,
      _id: params.id,
      author: recipe.author,
    };

    mockRecipes[recipeIndex] = updatedRecipe;

    return NextResponse.json(updatedRecipe);
  } catch (error) {
    console.error("Error updating recipe:", error);
    return NextResponse.json(
      { error: "Error updating recipe" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "You must be signed in to delete a recipe" },
        { status: 401 }
      );
    }

    const recipeIndex = mockRecipes.findIndex((r: Recipe) => r._id === params.id);
    
    if (recipeIndex === -1) {
      return NextResponse.json(
        { error: "Recipe not found" },
        { status: 404 }
      );
    }

    const recipe = mockRecipes[recipeIndex];
    if (recipe.author._id !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this recipe" },
        { status: 403 }
      );
    }

    mockRecipes.splice(recipeIndex, 1);

    return NextResponse.json(
      { message: "Recipe deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return NextResponse.json(
      { error: "Error deleting recipe" },
      { status: 500 }
    );
  }
}
