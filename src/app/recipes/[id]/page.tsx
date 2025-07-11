"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface Recipe {
  _id: string;
  title: string;
  description: string;
  image: string;
  ingredients: {
    name: string;
    amount: string;
    unit: string;
  }[];
  instructions: string[];
  cookingTime: number;
  servings: number;
  difficulty: string;
  author: {
    _id: string;
    name: string;
    image: string;
  };
  createdAt: string;
}

export default function RecipePage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`/api/recipes/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch recipe");
        }
        const data = await response.json();
        setRecipe(data);
      } catch (error) {
        toast.error("Failed to load recipe");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Recipe Not Found</h1>
        <p>The recipe you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">{recipe.title}</h1>
          <div className="flex items-center space-x-4 text-gray-600">
            <span>{recipe.cookingTime} minutes</span>
            <span>•</span>
            <span>{recipe.servings} servings</span>
            <span>•</span>
            <span>{recipe.difficulty}</span>
          </div>
        </div>

        {/* Image */}
        <div className="aspect-video relative rounded-lg overflow-hidden">
          <img
            src={recipe.image}
            alt={recipe.title}
            className="object-cover w-full h-full"
          />
        </div>

        {/* Description */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Description</h2>
          <p className="text-gray-600">{recipe.description}</p>
        </Card>

        {/* Ingredients */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-center space-x-2">
                <span className="font-medium">{ingredient.amount}</span>
                <span>{ingredient.unit}</span>
                <span>{ingredient.name}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Instructions */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Instructions</h2>
          <ol className="space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="flex space-x-4">
                <span className="font-bold text-gray-400">{index + 1}.</span>
                <span>{instruction}</span>
              </li>
            ))}
          </ol>
        </Card>

        {/* Author Info */}
        <div className="flex items-center space-x-4">
          <img
            src={recipe.author.image}
            alt={recipe.author.name}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <p className="font-medium">{recipe.author.name}</p>
            <p className="text-sm text-gray-600">
              Posted on {new Date(recipe.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Actions */}
        {session?.user.id === recipe.author._id && (
          <div className="flex space-x-4">
            <Button variant="outline" asChild>
              <a href={`/recipes/${recipe._id}/edit`}>Edit Recipe</a>
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (confirm("Are you sure you want to delete this recipe?")) {
                  try {
                    const response = await fetch(`/api/recipes/${recipe._id}`, {
                      method: "DELETE",
                    });
                    if (!response.ok) {
                      throw new Error("Failed to delete recipe");
                    }
                    toast.success("Recipe deleted successfully");
                    window.location.href = "/recipes";
                  } catch (error) {
                    toast.error("Failed to delete recipe");
                  }
                }
              }}
            >
              Delete Recipe
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
