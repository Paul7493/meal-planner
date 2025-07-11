export interface Recipe {
  _id: string;
  title: string;
  description: string;
  ingredients: {
    name: string;
    amount: string;
    unit: string;
  }[];
  instructions: string[];
  cookingTime: number;
  servings: number;
  image: string;
  author: {
    _id: string;
    name: string | null;
    image: string | null;
  };
  difficulty: "Easy" | "Medium" | "Hard";
  createdAt: string;
}
