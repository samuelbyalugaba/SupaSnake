"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export default function HowToPlayPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="bg-card/50 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="text-primary" />
            How to Play
          </CardTitle>
          <CardDescription>The rules of the game.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert">
            <h3>Controls</h3>
            <ul>
              <li><strong>Desktop:</strong> Use Arrow Keys or WASD to move. Use Spacebar to pause.</li>
              <li><strong>Mobile:</strong> Swipe to control the snake.</li>
            </ul>
            <h3>Objective</h3>
            <p>Guide the snake to eat the food and grow longer. Avoid hitting the walls or your own tail!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}