"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import * as Tone from 'tone';

export function useSounds() {
  const [isMuted, setIsMuted] = useState(true);
  
  const synths = useRef<{
    eatSynth: Tone.Synth | null;
    gameOverSynth: Tone.NoiseSynth | null;
  }>({ eatSynth: null, gameOverSynth: null });

  useEffect(() => {
    // Initialize synths on the client after mount
    synths.current.eatSynth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.5 },
    }).toDestination();
    
    synths.current.gameOverSynth = new Tone.NoiseSynth({
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

    return () => {
      if (synths.current.eatSynth) {
        synths.current.eatSynth.dispose();
      }
      if (synths.current.gameOverSynth) {
        synths.current.gameOverSynth.dispose();
      }
    }
  }, []);

  const playSound = useCallback(async (type: 'eat' | 'gameOver') => {
    if (!isMuted) {
      try {
        if (Tone.context.state !== 'running') {
          await Tone.start();
        }
    
        if (type === 'eat' && synths.current.eatSynth) {
          // Stop any previous sound to avoid timing errors
          synths.current.eatSynth.triggerRelease();
          synths.current.eatSynth.triggerAttackRelease('G5', '16n');
        } else if (type === 'gameOver' && synths.current.gameOverSynth) {
          synths.current.gameOverSynth.triggerAttackRelease("8n");
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
