import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  // This would typically fetch from the database
  const featuredRecipes = [
    {
      id: 1,
      title: "Classic Spaghetti Carbonara",
      description: "A creamy Italian pasta dish with pancetta and egg sauce",
      image: "https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg",
      cookingTime: 30,
    },
    {
      id: 2,
      title: "Grilled Salmon with Asparagus",
      description: "Healthy and delicious salmon with grilled vegetables",
      image: "https://images.pexels.com/photos/3763847/pexels-photo-3763847.jpeg",
      cookingTime: 25,
    },
    {
      id: 3,
      title: "Chocolate Lava Cake",
      description: "Decadent dessert with a molten chocolate center",
      image: "https://images.pexels.com/photos/3026804/pexels-photo-3026804.jpeg",
      cookingTime: 20,
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-12">
        <h1 className="text-4xl font-bold">Share Your Recipes & Plan Your Meals</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover delicious recipes from our community and organize your weekly meals with ease.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/recipes">
            <Button size="lg">Browse Recipes</Button>
          </Link>
          <Link href="/meal-planner">
            <Button size="lg" variant="outline">Plan Your Meals</Button>
          </Link>
        </div>
      </section>

      {/* Featured Recipes */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Featured Recipes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredRecipes.map((recipe) => (
            <Card key={recipe.id}>
              <CardHeader>
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </CardHeader>
              <CardContent>
                <CardTitle className="mb-2">{recipe.title}</CardTitle>
                <p className="text-gray-600">{recipe.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {recipe.cookingTime} mins
                </span>
                <Link href={`/recipes/${recipe.id}`}>
                  <Button variant="outline">View Recipe</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">Share Your Recipes</h3>
          <p className="text-gray-600">
            Upload and share your favorite recipes with our community.
          </p>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">Plan Your Meals</h3>
          <p className="text-gray-600">
            Create weekly meal plans and generate shopping lists automatically.
          </p>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold">Save Favorites</h3>
          <p className="text-gray-600">
            Save your favorite recipes and access them anytime.
          </p>
        </div>
      </section>
    </div>
  );
}
