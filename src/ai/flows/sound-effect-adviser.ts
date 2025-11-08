'use server';

/**
 * @fileOverview This file defines a Genkit flow for advising on sound effects in the Neon Snake game.
 *  The flow analyzes the game state and user preferences (if available) to suggest the most suitable sound effect.
 *
 * - `getSoundEffectAdvice` - A function that suggests sound effects based on the game state.
 * - `SoundEffectAdviceInput` - The input type for the `getSoundEffectAdvice` function.
 * - `SoundEffectAdviceOutput` - The return type for the `getSoundEffectAdvice` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SoundEffectAdviceInputSchema = z.object({
  gameState: z.string().describe('A JSON string representing the current game state, including score, level, snake length, and game status (e.g., running, paused, game over).'),
  userPreferences: z.string().optional().describe('Optional JSON string with user preferences for sound effects, such as desired intensity or type of sounds.'),
});
export type SoundEffectAdviceInput = z.infer<typeof SoundEffectAdviceInputSchema>;

const SoundEffectAdviceOutputSchema = z.object({
  suggestedSoundEffect: z.string().nullable().describe('The name of the suggested sound effect (e.g., chime, buzz, levelUp) or null if no sound effect is recommended.'),
  reason: z.string().describe('A brief explanation of why the suggested sound effect is appropriate for the current game state.'),
});
export type SoundEffectAdviceOutput = z.infer<typeof SoundEffectAdviceOutputSchema>;

export async function getSoundEffectAdvice(input: SoundEffectAdviceInput): Promise<SoundEffectAdviceOutput> {
  return soundEffectAdviceFlow(input);
}

const soundEffectAdvicePrompt = ai.definePrompt({
  name: 'soundEffectAdvicePrompt',
  input: {schema: SoundEffectAdviceInputSchema},
  output: {schema: SoundEffectAdviceOutputSchema},
  prompt: `You are an AI sound effect advisor for the Neon Snake game. Analyze the game state and user preferences (if provided) to recommend a sound effect that enhances the player experience.\

Game State: {{{gameState}}}
User Preferences: {{{userPreferences}}}

Consider the following:
- A \"chime\" sound effect when the snake eats an apple.
- A \"buzz\" sound effect when the game is over.
- A \"levelUp\" sound effect when the player reaches a new level.

Based on the current game state and user preferences, suggest a sound effect and explain your reasoning. If no sound effect is appropriate, return null for suggestedSoundEffect.\

Output in JSON format:
{
  \"suggestedSoundEffect\": \"<sound effect name or null>\",
  \"reason\": \"<explanation>\"
}
`,
});

const soundEffectAdviceFlow = ai.defineFlow(
  {
    name: 'soundEffectAdviceFlow',
    inputSchema: SoundEffectAdviceInputSchema,
    outputSchema: SoundEffectAdviceOutputSchema,
  },
  async input => {
    try {
      // Parse game state and user preferences (if provided)
      const gameState = JSON.parse(input.gameState);
      const userPreferences = input.userPreferences ? JSON.parse(input.userPreferences) : {};

      const {output} = await soundEffectAdvicePrompt(input);
      return output!;
    } catch (error) {
      console.error('Error processing sound effect advice:', error);
      return {
        suggestedSoundEffect: null,
        reason: 'An error occurred while processing the game state.',
      };
    }
  }
);
