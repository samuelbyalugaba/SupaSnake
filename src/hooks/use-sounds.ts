"use client";

import { useCallback, useEffect } from 'react';
import * as Tone from 'tone';
import { useSettings } from '@/context/SettingsContext';

let audioContextStarted = false;

const startAudioContext = async () => {
    if (audioContextStarted || Tone.context.state === 'running') {
        return;
    }
    try {
        await Tone.start();
        audioContextStarted = true;
        console.log('Audio context started successfully.');
    } catch (e) {
        console.error('Could not start audio context: ', e);
    }
};

export function useSounds() {
  const { isMuted, toggleMute } = useSettings();

  useEffect(() => {
    const events: (keyof WindowEventMap)[] = ['touchstart', 'click', 'keydown'];
    const handler = () => startAudioContext();

    events.forEach(event => window.addEventListener(event, handler, { once: true }));

    return () => {
      events.forEach(event => window.removeEventListener(event, handler));
    };
  }, []);

  const playSound = useCallback(async (type: 'eat' | 'gameOver') => {
    if (isMuted) return;

    if (Tone.context.state !== 'running') {
      await startAudioContext();
    }
    
    if (Tone.context.state !== 'running') {
        console.warn("Audio context not running, sound playback aborted.");
        return;
    }
    
    try {
      if (type === 'eat') {
        const eatSynth = new Tone.Synth({
          oscillator: { type: 'sine' },
          envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.5 },
        }).toDestination();
        eatSynth.triggerAttackRelease('G5', '16n');
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
  }, [isMuted]);

  return { isMuted, toggleMute, playSound };
}
