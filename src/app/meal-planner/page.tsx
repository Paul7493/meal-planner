"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Recipe {
  _id: string;
  title: string;
  image: string;
  cookingTime: number;
}

interface MealPlan {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  meals: {
    date: string;
    type: "Breakfast" | "Lunch" | "Dinner" | "Snack";
    recipe: Recipe;
  }[];
}

const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

export default function MealPlannerPage() {
  const { data: session } = useSession();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());

  useEffect(() => {
    if (session) {
      fetchRecipes();
      fetchMealPlan();
    }
  }, [session, selectedWeek]);

  const fetchRecipes = async () => {
    try {
      const response = await fetch("/api/recipes");
      if (!response.ok) throw new Error("Failed to fetch recipes");
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      toast.error("Failed to load recipes");
    }
  };

  const fetchMealPlan = async () => {
    try {
      const startDate = getWeekStartDate(selectedWeek);
      const endDate = getWeekEndDate(selectedWeek);
      const response = await fetch(
        `/api/meal-plans?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      if (!response.ok) throw new Error("Failed to fetch meal plan");
      const data = await response.json();
      setMealPlan(data);
    } catch (error) {
      toast.error("Failed to load meal plan");
    }
  };

  const getWeekStartDate = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const getWeekEndDate = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + 6;
    return new Date(d.setDate(diff));
  };

  const handleAddMeal = async (date: Date, type: string, recipeId: string) => {
    try {
      const payload = {
        date: date.toISOString(),
        type,
        recipe: recipeId,
      };

      const response = await fetch("/api/meal-plans", {
        method: mealPlan ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          startDate: getWeekStartDate(selectedWeek).toISOString(),
          endDate: getWeekEndDate(selectedWeek).toISOString(),
          ...(mealPlan && { id: mealPlan._id }),
        }),
      });

      if (!response.ok) throw new Error("Failed to update meal plan");
      await fetchMealPlan();
      toast.success("Meal plan updated");
    } catch (error) {
      toast.error("Failed to update meal plan");
    }
  };

  if (!session) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
        <p>You need to be signed in to use the meal planner.</p>
      </div>
    );
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(selectedWeek);
    date.setDate(date.getDate() - date.getDay() + i);
    return date;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Meal Planner</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              const newDate = new Date(selectedWeek);
              newDate.setDate(newDate.getDate() - 7);
              setSelectedWeek(newDate);
            }}
          >
            Previous Week
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const newDate = new Date(selectedWeek);
              newDate.setDate(newDate.getDate() + 7);
              setSelectedWeek(newDate);
            }}
          >
            Next Week
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-4">
        <div className="col-span-1"></div>
        {weekDays.map((date) => (
          <div key={date.toISOString()} className="col-span-1 text-center">
            <div className="font-semibold">
              {date.toLocaleDateString("en-US", { weekday: "short" })}
            </div>
            <div className="text-sm text-gray-600">
              {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
          </div>
        ))}

        {MEAL_TYPES.map((type) => (
          <>
            <div key={type} className="col-span-1 font-semibold">
              {type}
            </div>
            {weekDays.map((date) => (
              <Card key={`${date.toISOString()}-${type}`} className="col-span-1">
                <CardContent className="p-2">
                  {mealPlan?.meals.find(
                    (meal) =>
                      new Date(meal.date).toDateString() === date.toDateString() &&
                      meal.type === type
                  ) ? (
                    <div className="space-y-2">
                      <img
                        src={
                          mealPlan.meals.find(
                            (meal) =>
                              new Date(meal.date).toDateString() ===
                                date.toDateString() && meal.type === type
                          )?.recipe.image
                        }
                        alt="Recipe"
                        className="w-full h-20 object-cover rounded"
                      />
                      <p className="text-sm">
                        {
                          mealPlan.meals.find(
                            (meal) =>
                              new Date(meal.date).toDateString() ===
                                date.toDateString() && meal.type === type
                          )?.recipe.title
                        }
                      </p>
                    </div>
                  ) : (
                    <Select
                      onValueChange={(recipeId) =>
                        handleAddMeal(date, type, recipeId)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Add meal" />
                      </SelectTrigger>
                      <SelectContent>
                        {recipes.map((recipe) => (
                          <SelectItem key={recipe._id} value={recipe._id}>
                            {recipe.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </CardContent>
              </Card>
            ))}
          </>
        ))}
      </div>
    </div>
  );
}
