"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type Ingredient = {
  name: string;
  amount: string;
  unit: string;
};

export default function NewRecipePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", amount: "", unit: "" },
  ]);
  const [instructions, setInstructions] = useState<string[]>([""]);

  if (!session) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to create a recipe.</p>
      </div>
    );
  }

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "", unit: "" }]);
  };

  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string
  ) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, ""]);
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const recipe = {
        title: formData.get("title"),
        description: formData.get("description"),
        image: formData.get("image"),
        cookingTime: Number(formData.get("cookingTime")),
        servings: Number(formData.get("servings")),
        difficulty: formData.get("difficulty"),
        ingredients: ingredients.filter((ing) => ing.name && ing.amount && ing.unit),
        instructions: instructions.filter((inst) => inst.trim()),
        author: session.user.id,
      };

      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipe),
      });

      if (!response.ok) {
        throw new Error("Failed to create recipe");
      }

      toast.success("Recipe created successfully!");
      router.push("/recipes");
    } catch (error) {
      toast.error("Failed to create recipe. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Create New Recipe</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Recipe Title</Label>
          <Input id="title" name="title" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Image URL</Label>
          <Input id="image" name="image" type="url" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cookingTime">Cooking Time (minutes)</Label>
            <Input
              id="cookingTime"
              name="cookingTime"
              type="number"
              min="1"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="servings">Servings</Label>
            <Input
              id="servings"
              name="servings"
              type="number"
              min="1"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select name="difficulty" required>
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Easy">Easy</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label>Ingredients</Label>
          {ingredients.map((ingredient, index) => (
            <div key={index} className="grid grid-cols-3 gap-2">
              <Input
                placeholder="Name"
                value={ingredient.name}
                onChange={(e) =>
                  handleIngredientChange(index, "name", e.target.value)
                }
                required
              />
              <Input
                placeholder="Amount"
                value={ingredient.amount}
                onChange={(e) =>
                  handleIngredientChange(index, "amount", e.target.value)
                }
                required
              />
              <Input
                placeholder="Unit"
                value={ingredient.unit}
                onChange={(e) =>
                  handleIngredientChange(index, "unit", e.target.value)
                }
                required
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={handleAddIngredient}
          >
            Add Ingredient
          </Button>
        </div>

        <div className="space-y-4">
          <Label>Instructions</Label>
          {instructions.map((instruction, index) => (
            <div key={index}>
              <Textarea
                placeholder={`Step ${index + 1}`}
                value={instruction}
                onChange={(e) =>
                  handleInstructionChange(index, e.target.value)
                }
                required
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={handleAddInstruction}
          >
            Add Step
          </Button>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Recipe"}
        </Button>
      </form>
    </div>
  );
}
