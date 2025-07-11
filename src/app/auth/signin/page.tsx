"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to RecipeShare</CardTitle>
          <CardDescription>
            Sign in to share recipes and plan your meals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full"
            onClick={() => signIn("credentials", { callbackUrl: "/" })}
          >
            Sign in with Demo Account
          </Button>
          <p className="text-center text-sm text-gray-500">
            This is a demo version with a mock authentication system
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
