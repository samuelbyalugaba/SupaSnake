"use client";

import { useState, useCallback, useEffect } from 'react';
import * as Tone from 'tone';

export function useSounds() {
  const [isMuted, setIsMuted] = useState(true);

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
          eatSynth.triggerAttackRelease('G5', '16n', Tone.now());
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
          gameOverSynth.triggerAttackRelease("8n", Tone.now());
          setTimeout(() => gameOverSynth.dispose(), 200);
        }
      } catch (error) {
        console.error("Could not play sound:", error);
      }
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return { isMuted, toggleMute, playSound };
}
