"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          RecipeShare
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/recipes" className="hover:text-gray-600">
            Recipes
          </Link>
          {session ? (
            <>
              <Link href="/meal-planner" className="hover:text-gray-600">
                Meal Planner
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar>
                      <AvatarImage src={session.user?.image || ""} />
                      <AvatarFallback>
                        {session.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link href="/recipes/new">Add New Recipe</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/recipes">My Recipes</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left text-red-600"
                    >
                      Sign Out
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button
              variant="default"
              onClick={() => signIn("credentials", { callbackUrl: "/" })}
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}
