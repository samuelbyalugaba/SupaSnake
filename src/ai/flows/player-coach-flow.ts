'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing player coaching in the Neon Snake game.
 * The flow analyzes the game state to offer tips, encouragement, or feedback.
 *
 * - `getPlayerCoachAdvice` - A function that provides coaching advice based on the game state.
 * - `PlayerCoachAdviceInput` - The input type for the `getPlayerCoachAdvice` function.
 * - `PlayerCoachAdviceOutput` - The return type for the `getPlayerCoachAdvice` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PlayerCoachAdviceInputSchema = z.object({
  score: z.number().describe("The player's current score."),
  level: z.number().describe("The current game level."),
  snakeLength: z.number().describe("The current length of the snake."),
  status: z.string().describe("The current status of the game (e.g., 'RUNNING', 'GAME_OVER')."),
  foodEatenThisLevel: z.number().describe("The amount of food eaten in the current level."),
});
export type PlayerCoachAdviceInput = z.infer<typeof PlayerCoachAdviceInputSchema>;

const PlayerCoachAdviceOutputSchema = z.object({
  title: z.string().describe("A short, catchy title for the advice (e.g., 'Level Up Alert!', 'Good Hustle!')."),
  message: z.string().describe('The coaching message for the player. Should be encouraging and context-aware.'),
});
export type PlayerCoachAdviceOutput = z.infer<typeof PlayerCoachAdviceOutputSchema>;

export async function getPlayerCoachAdvice(input: PlayerCoachAdviceInput): Promise<PlayerCoachAdviceOutput> {
  return playerCoachFlow(input);
}

const playerCoachPrompt = ai.definePrompt({
  name: 'playerCoachPrompt',
  input: {schema: PlayerCoachAdviceInputSchema},
  output: {schema: PlayerCoachAdviceOutputSchema},
  prompt: `You are an AI Player Coach for the Neon Snake game. Your goal is to provide encouraging and helpful tips to the player based on their current game state. Keep your messages short, fun, and positive.

Analyze the provided game state:
- Score: {{score}}
- Level: {{level}}
- Snake Length: {{snakeLength}}
- Food Eaten This Level: {{foodEatenThisLevel}}
- Status: {{status}}

Here are some scenarios and the type of message you should generate:
- If status is 'GAME_OVER': Provide a positive wrap-up. Mention their score and encourage them to try again.
- If the player is 1-2 food items away from leveling up: Alert them that they are close to the next level.
- If the player's score crosses a major milestone (e.g., every 50 or 100 points): Congratulate them.
- If the snake is getting very long: Comment on how long their snake is and remind them to be careful.
- If the game is just starting: Give them a simple "Good luck!" message.

Based on the game state, generate a title and a message for the player.
`,
});

const playerCoachFlow = ai.defineFlow(
  {
    name: 'playerCoachFlow',
    inputSchema: PlayerCoachAdviceInputSchema,
    outputSchema: PlayerCoachAdviceOutputSchema,
  },
  async input => {
    try {
      const {output} = await playerCoachPrompt(input);
      return output!;
    } catch (error) {
      console.error('Error processing player coach advice:', error);
      return {
        title: 'Coach is Stumped',
        message: 'I seem to be at a loss for words, but keep up the great work!',
      };
    }
  }
);
