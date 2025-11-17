
import type { Cosmetic } from './types';

// The master list of all available cosmetics in the game.
export const ALL_COSMETICS: Cosmetic[] = [
    // === COMMON (Default & Low Cost) ===
    {
        id: 'default',
        name: 'Classic Neon',
        description: 'The original Supa Snake look. Timeless and always in style.',
        rarity: 'Common',
        cost: 0,
        style: {
            headGradient: { from: '#5CFF4D', to: '#00C700' },
            bodyGradient: { from: '#39FF14', to: '#00C700' },
            shadow: 'rgba(57, 255, 20, 0.7)',
        }
    },
    {
        id: 'bubblegum',
        name: 'Bubblegum',
        description: 'A sweet, vibrant pink skin that really pops.',
        rarity: 'Common',
        cost: 250,
        style: {
            headGradient: { from: '#FF69B4', to: '#FF1493' },
            bodyGradient: { from: '#FFC0CB', to: '#FF69B4' },
            shadow: 'rgba(255, 105, 180, 0.7)',
        }
    },
    {
        id: 'ocean',
        name: 'Ocean Wave',
        description: 'Ride the digital waves with this cool blue design.',
        rarity: 'Common',
        cost: 250,
        style: {
            headGradient: { from: '#1E90FF', to: '#0000CD' },
            bodyGradient: { from: '#87CEFA', to: '#1E90FF' },
            shadow: 'rgba(30, 144, 255, 0.7)',
        }
    },

    // === RARE (Higher Cost) ===
    {
        id: 'ice',
        name: 'Ice Wyrm',
        description: 'A chilling design, forged in the coldest depths of the grid.',
        rarity: 'Rare',
        cost: 500,
        style: {
            headGradient: { from: '#80FFFF', to: '#00BFFF' },
            bodyGradient: { from: '#B0E0E6', to: '#87CEEB' },
            shadow: 'rgba(128, 255, 255, 0.7)',
        }
    },
    {
        id: 'fire',
        name: 'Inferno Serpent',
        description: 'A blazing skin for those who play with fire. Handle with care.',
        rarity: 'Rare',
        cost: 500,
        style: {
            headGradient: { from: '#FFD700', to: '#FF4500' },
            bodyGradient: { from: '#FFA500', to: '#FF6347' },
            shadow: 'rgba(255, 100, 0, 0.7)',
        }
    },
    {
        id: 'forest',
        name: 'Forest Spirit',
        description: 'A natural design that feels out of place, yet perfectly at home.',
        rarity: 'Rare',
        cost: 750,
        style: {
            headGradient: { from: '#ADFF2F', to: '#32CD32' },
            bodyGradient: { from: '#90EE90', to: '#228B22' },
            shadow: 'rgba(50, 205, 50, 0.7)',
        }
    },

    // === EPIC (High Cost or Achievement-based) ===
    {
        id: 'synthwave',
        name: 'Synthwave Sunset',
        description: 'A retro-futuristic design inspired by 80s synth music.',
        rarity: 'Epic',
        cost: 1000,
        style: {
            headGradient: { from: '#FF00FF', to: '#FF007F' },
            bodyGradient: { from: '#FF00FF', to: '#9F00FF' },
            shadow: 'rgba(255, 0, 255, 0.7)',
        }
    },
    {
        id: 'ghost',
        name: 'Phantom',
        description: 'A translucent, ethereal skin for the sneakiest of snakes.',
        rarity: 'Epic',
        cost: 2000,
        style: {
            headGradient: { from: 'rgba(230, 230, 250, 0.9)', to: 'rgba(176, 196, 222, 0.8)' },
            bodyGradient: { from: 'rgba(240, 248, 255, 0.7)', to: 'rgba(211, 211, 211, 0.6)' },
            shadow: 'rgba(255, 255, 255, 0.5)',
        }
    },
    {
        id: 'hard-god-skin',
        name: 'God of the Grid',
        description: "Prove your mastery by conquering the ultimate challenge.",
        rarity: 'Epic',
        cost: 0,
        achievementId: 'hard-god',
        style: {
            headGradient: { from: '#C0C0C0', to: '#A9A9A9' },
            bodyGradient: { from: '#FFFFFF', to: '#D3D3D3' },
            shadow: 'rgba(255, 255, 255, 0.8)',
        }
    },

    // === LEGENDARY (Very High Cost or Top-Tier Achievements) ===
    {
        id: 'gold',
        name: 'Golden Viper',
        description: 'The ultimate status symbol. For the true kings of the grid.',
        rarity: 'Legendary',
        cost: 5000,
        style: {
            headGradient: { from: '#FFD700', to: '#F0E68C' },
            bodyGradient: { from: '#FFFF00', to: '#FFD700' },
            shadow: 'rgba(255, 215, 0, 0.7)',
        }
    },
    {
        id: 'ouroboros',
        name: 'Ouroboros',
        description: 'Become the serpent that eats its own tail. Unlocked by achieving maximum snake length.',
        rarity: 'Legendary',
        cost: 0,
        achievementId: 'ultra-snake',
        style: {
            headGradient: { from: '#FF00FF', to: '#00FFFF' },
            bodyGradient: { from: '#00FFFF', to: '#FF00FF' },
            shadow: 'rgba(255, 255, 255, 1)',
        }
    },
    {
        id: 'completionist-skin',
        name: 'The Completionist',
        description: 'A skin that shifts through every color, awarded for 100% completion.',
        rarity: 'Legendary',
        cost: 0,
        achievementId: 'completionist',
        style: {
            headGradient: { from: '#FF4500', to: '#1E90FF' },
            bodyGradient: { from: '#1E90FF', to: '#32CD32' },
            shadow: 'rgba(255, 255, 255, 1)',
        }
    },

    // === SEASONAL / EVENT ===
    {
        id: 'pumpkin',
        name: 'Jack-O-Serpent',
        description: 'A spooky skin for the Halloween season.',
        rarity: 'Seasonal',
        cost: 800,
        style: {
            headGradient: { from: '#FFA500', to: '#FF8C00' },
            bodyGradient: { from: '#FFD700', to: '#FFA500' },
            shadow: 'rgba(255, 165, 0, 0.7)',
        }
    },
    {
        id: 'candy-cane',
        name: 'Candy Cane',
        description: 'A festive treat to celebrate the winter holidays.',
        rarity: 'Seasonal',
        cost: 800,
        style: {
            headGradient: { from: '#FFFFFF', to: '#FF0000' },
            bodyGradient: { from: '#FF0000', to: '#FFFFFF' },
            shadow: 'rgba(255, 0, 0, 0.7)',
        }
    },
];

// Adding more skins to reach 30+
const additionalCosmetics: Cosmetic[] = [
    // Common
    { id: 'graphite', name: 'Graphite', description: 'Sleek, simple, and serious.', rarity: 'Common', cost: 100, style: { headGradient: { from: '#696969', to: '#2F4F4F' }, bodyGradient: { from: '#A9A9A9', to: '#696969' }, shadow: 'rgba(105, 105, 105, 0.6)' } },
    { id: 'amethyst', name: 'Amethyst', description: 'A skin with a royal, purple glow.', rarity: 'Common', cost: 300, style: { headGradient: { from: '#9966CC', to: '#8A2BE2' }, bodyGradient: { from: '#BA55D3', to: '#9932CC' }, shadow: 'rgba(153, 102, 204, 0.7)' } },
    // Rare
    { id: 'toxic', name: 'Toxic Waste', description: 'Handle with extreme caution.', rarity: 'Rare', cost: 600, style: { headGradient: { from: '#ADFF2F', to: '#7FFF00' }, bodyGradient: { from: '#00FF00', to: '#32CD32' }, shadow: 'rgba(124, 252, 0, 0.7)' } },
    { id: 'cyborg', name: 'Cyborg', description: 'Part machine, all serpent.', rarity: 'Rare', cost: 800, style: { headGradient: { from: '#E0E0E0', to: '#B0B0B0' }, bodyGradient: { from: '#C0C0C0', to: '#787878' }, shadow: 'rgba(192, 192, 192, 0.7)' } },
    { id: 'holographic', name: 'Holographic', description: 'A shimmering, multi-tonal skin.', rarity: 'Rare', cost: 900, style: { headGradient: { from: '#40E0D0', to: '#EE82EE' }, bodyGradient: { from: '#EE82EE', to: '#40E0D0' }, shadow: 'rgba(200, 200, 255, 0.7)' } },
    // Epic
    { id: 'celestial', name: 'Celestial', description: 'A skin made of stardust and nebulae.', rarity: 'Epic', cost: 1500, style: { headGradient: { from: '#00008B', to: '#4B0082' }, bodyGradient: { from: '#FFFFFF', to: '#ADD8E6' }, shadow: 'rgba(75, 0, 130, 0.8)' } },
    { id: 'glitch', name: 'Glitch', description: 'An unstable, corrupted data-form.', rarity: 'Epic', cost: 1750, style: { headGradient: { from: '#FF0000', to: '#0000FF' }, bodyGradient: { from: '#00FF00', to: '#FFFF00' }, shadow: 'rgba(128, 128, 128, 0.8)' } },
    { id: 'perfect-game-skin', name: 'Perfect Run', description: 'Awarded for a flawless game on hard mode.', rarity: 'Epic', cost: 0, achievementId: 'perfect-game-hard', style: { headGradient: { from: '#00FFFF', to: '#1E90FF' }, bodyGradient: { from: '#AFEEEE', to: '#87CEEB' }, shadow: 'rgba(0, 255, 255, 0.8)' } },
    // Legendary
    { id: 'black-hole', name: 'Black Hole', description: 'Consumes all light. A skin of pure gravity.', rarity: 'Legendary', cost: 4000, style: { headGradient: { from: '#1C1C1C', to: '#000000' }, bodyGradient: { from: '#363636', to: '#1C1C1C' }, shadow: 'rgba(255, 0, 255, 0.6)' } },
    { id: 'serpent-king-skin', name: 'Serpent King', description: 'Only for those who reach the top of the leaderboards.', rarity: 'Legendary', cost: 0, achievementId: 'serpent-king', style: { headGradient: { from: '#DAA520', to: '#B8860B' }, bodyGradient: { from: '#FFD700', to: '#CDAD00' }, shadow: 'rgba(218, 165, 32, 0.9)' } },
    // Seasonal
    { id: 'valentines', name: 'Heartbreaker', description: 'For the season of love... and long snakes.', rarity: 'Seasonal', cost: 800, style: { headGradient: { from: '#FFC0CB', to: '#FF69B4' }, bodyGradient: { from: '#DB7093', to: '#FF1493' }, shadow: 'rgba(255, 20, 147, 0.7)' } },
    { id: 'new-year', name: 'Fireworks', description: 'Celebrate the new year with a bang.', rarity: 'Seasonal', cost: 800, style: { headGradient: { from: '#FFFF00', to: '#FF4500' }, bodyGradient: { from: '#00FFFF', to: '#0000FF' }, shadow: 'rgba(255, 255, 255, 0.7)' } },
    { id: 'spring-blossom', name: 'Spring Blossom', description: 'A fresh start.', rarity: 'Seasonal', cost: 800, style: { headGradient: { from: '#FFB6C1', to: '#87CEFA' }, bodyGradient: { from: '#98FB98', to: '#FFB6C1' }, shadow: 'rgba(152, 251, 152, 0.7)' } },
    { id: 'summer-solstice', name: 'Solstice', description: 'Feel the heat of the longest day.', rarity: 'Seasonal', cost: 800, style: { headGradient: { from: '#FFD700', to: '#FFA500' }, bodyGradient: { from: '#FF8C00', to: '#FF4500' }, shadow: 'rgba(255, 140, 0, 0.7)' } },
];

ALL_COSMETICS.push(...additionalCosmetics);
// Add even more to reach 30+
const finalAdditions: Cosmetic[] = [
    { id: 'matrix', name: 'The Matrix', description: 'Digital rain in snake form.', rarity: 'Epic', cost: 1200, style: { headGradient: { from: '#39FF14', to: '#00C700' }, bodyGradient: { from: '#000000', to: '#004d00' }, shadow: 'rgba(0, 255, 0, 0.7)' } },
    { id: 'marble', name: 'Marble', description: 'Sculpted from the finest digital stone.', rarity: 'Rare', cost: 700, style: { headGradient: { from: '#F5F5F5', to: '#DCDCDC' }, bodyGradient: { from: '#DCDCDC', to: '#C0C0C0' }, shadow: 'rgba(220, 220, 220, 0.6)' } },
    { id: 'emerald', name: 'Emerald', description: 'A precious gem, slithering on the grid.', rarity: 'Rare', cost: 850, style: { headGradient: { from: '#50C878', to: '#009E60' }, bodyGradient: { from: '#00A86B', to: '#007A57' }, shadow: 'rgba(80, 200, 120, 0.7)' } },
    { id: 'ruby', name: 'Ruby', description: 'A deep red, captivating and dangerous.', rarity: 'Rare', cost: 850, style: { headGradient: { from: '#E0115F', to: '#B00000' }, bodyGradient: { from: '#D00000', to: '#9B0000' }, shadow: 'rgba(224, 17, 95, 0.7)' } },
    { id: 'sapphire', name: 'Sapphire', description: 'A brilliant blue, like the deepest ocean.', rarity: 'Rare', cost: 850, style: { headGradient: { from: '#0F52BA', to: '#002366' }, bodyGradient: { from: '#0033A0', to: '#001440' }, shadow: 'rgba(15, 82, 186, 0.7)' } },
];
ALL_COSMETICS.push(...finalAdditions);

