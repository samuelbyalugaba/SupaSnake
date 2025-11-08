'use server';

/**
 * @fileOverview This file defines a Genkit flow for an AI chatbot for the Neon Snake game.
 * The chatbot can answer questions about game rules, strategies, and mechanics.
 *
 * - `askSnakeChatbot` - A function that takes a user's question and returns a text response.
 * - `SnakeChatbotInput` - The input type for the `askSnakeChatbot` function.
 * - `SnakeChatbotOutput` - The return type for the `askSnakeChatbot` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SnakeChatbotInputSchema = z.object({
  question: z.string().describe("The user's question about the Neon Snake game."),
});
export type SnakeChatbotInput = z.infer<typeof SnakeChatbotInputSchema>;

const SnakeChatbotOutputSchema = z.object({
  answer: z.string().describe("The chatbot's answer to the user's question."),
});
export type SnakeChatbotOutput = z.infer<typeof SnakeChatbotOutputSchema>;

export async function askSnakeChatbot(input: SnakeChatbotInput): Promise<SnakeChatbotOutput> {
  return snakeChatbotFlow(input);
}

const snakeChatbotPrompt = ai.definePrompt({
  name: 'snakeChatbotPrompt',
  input: {schema: SnakeChatbotInputSchema},
  output: {schema: SnakeChatbotOutputSchema},
  prompt: `You are a helpful and friendly AI chatbot for a game called "Supa Snake". Your goal is to answer player questions about the game.

Game Information:
- The game is a classic snake game with a neon theme.
- Players control a snake to eat red apples.
- Eating an apple makes the snake longer and increases the score by 10 points.
- The game has 5 levels. To level up, the player must eat 5 apples.
- Leveling up increases the snake's speed.
- The game ends if the snake hits the wall or runs into its own body.
- Players can save their high scores to a global leaderboard if they are logged in.

Your tone should be encouraging and informative. Keep your answers concise and easy to understand.

Player's question: "{{question}}"

Based on the game information, provide a helpful answer.
`,
});

const snakeChatbotFlow = ai.defineFlow(
  {
    name: 'snakeChatbotFlow',
    inputSchema: SnakeChatbotInputSchema,
    outputSchema: SnakeChatbotOutputSchema,
  },
  async input => {
    const {output} = await snakeChatbotPrompt(input);
    return output!;
  }
);
