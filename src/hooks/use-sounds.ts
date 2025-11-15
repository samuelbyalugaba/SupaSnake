
"use client";

import { useState, useCallback } from 'react';
import * as Tone from 'tone';

export function useSounds() {
  const [isMuted, setIsMuted] = useState(false); // Sound is on by default now

  const playSound = useCallback(async (type: 'eat' | 'gameOver') => {
    if (!isMuted) {
      try {
        if (Tone.context.state !== 'running') {
          await Tone.start();
        }
    
        if (type === 'eat') {
          const eatSynth = new Tone.Synth({
            oscillator: { type: 'sine' },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.5 },
          }).toDestination();
          eatSynth.triggerAttackRelease('G5', '16n');
          // Clean up the synth after it's done playing
          setTimeout(() => eatSynth.dispose(), 500);
        } else if (type === 'gameOver') {
           const gameOverSynth = new Tone.NoiseSynth({
            noise: {
              type: 'brown'
            },
            envelope: {
              attack: 0.005,
              decay: 0.1,
              sustain: 0,
              release: 0.1,
            },
          }).toDestination();
          gameOverSynth.triggerAttackRelease("8n");
          setTimeout(() => gameOverSynth.dispose(), 200);
        }
      } catch (error) {
        console.error("Could not play sound:", error);
      }
    }
  }, [isMuted]);

  // This function is no longer needed but kept in case you want to add a mute button back later.
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return { isMuted, toggleMute, playSound };
}

    
