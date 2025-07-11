import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from "@/lib/db";
import { MealPlan } from "@/lib/models/MealPlan";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "You must be signed in to view meal plans" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const query = {
      user: session.user.id,
      ...(startDate && endDate && {
        startDate: { $lte: new Date(endDate) },
        endDate: { $gte: new Date(startDate) },
      }),
    };

    const mealPlan = await MealPlan.findOne(query)
      .populate({
        path: "meals.recipe",
        select: "title image cookingTime",
      });

    return NextResponse.json(mealPlan || { meals: [] });
  } catch (error) {
    console.error("Error fetching meal plans:", error);
    return NextResponse.json(
      { error: "Error fetching meal plans" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "You must be signed in to create a meal plan" },
        { status: 401 }
      );
    }

    await dbConnect();

    const data = await req.json();
    const mealPlan = await MealPlan.create({
      ...data,
      user: session.user.id,
      meals: [{
        date: data.date,
        type: data.type,
        recipe: data.recipe,
      }],
    });

    const populatedMealPlan = await MealPlan.findById(mealPlan._id)
      .populate({
        path: "meals.recipe",
        select: "title image cookingTime",
      });

    return NextResponse.json(populatedMealPlan, { status: 201 });
  } catch (error) {
    console.error("Error creating meal plan:", error);
    return NextResponse.json(
      { error: "Error creating meal plan" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "You must be signed in to update a meal plan" },
        { status: 401 }
      );
    }

    await dbConnect();

    const data = await req.json();
    const { id, ...updateData } = data;

    const mealPlan = await MealPlan.findById(id);

    if (!mealPlan) {
      return NextResponse.json(
        { error: "Meal plan not found" },
        { status: 404 }
      );
    }

    if (mealPlan.user.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to update this meal plan" },
        { status: 403 }
      );
    }

    // Add new meal to the meals array
    mealPlan.meals.push({
      date: updateData.date,
      type: updateData.type,
      recipe: updateData.recipe,
    });

    await mealPlan.save();

    const updatedMealPlan = await MealPlan.findById(id)
      .populate({
        path: "meals.recipe",
        select: "title image cookingTime",
      });

    return NextResponse.json(updatedMealPlan);
  } catch (error) {
    console.error("Error updating meal plan:", error);
    return NextResponse.json(
      { error: "Error updating meal plan" },
      { status: 500 }
    );
  }
}
