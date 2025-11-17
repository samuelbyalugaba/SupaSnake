
import type { Achievement } from './types';

// This is the static definition of all possible achievements in the game.
// User progress will be stored separately in Firestore.
export const ALL_ACHIEVEMENTS: Achievement[] = [
  // =============================================
  // ========== 1. CORE & ONBOARDING =============
  // =============================================
  {
    id: 'first-bite',
    name: 'First Bite',
    description: 'Eat your first cyber-rat.',
    icon: 'Rat',
    category: 'Core',
    target: 1,
  },
  {
    id: 'first-game',
    name: 'Welcome to the Grid',
    description: 'Complete your first game.',
    icon: 'Play',
    category: 'Core',
    target: 1,
  },
    {
    id: 'double-digits',
    name: 'Double Digits',
    description: 'Reach a snake length of 10.',
    icon: 'GitCommitHorizontal',
    category: 'Core',
    target: 10,
  },
  {
    id: 'first-chat',
    name: 'Social Serpent',
    description: 'Send your first message in the global chat.',
    icon: 'MessageSquare',
    category: 'Core',
    target: 1,
  },
  {
    id: 'full-screen',
    name: 'Full Immersion',
    description: 'Play a game in full-screen mode.',
    icon: 'Maximize',
    category: 'Core',
    target: 1,
  },
    {
    id: 'change-username',
    name: 'Identity Crisis',
    description: 'Change your username in the settings.',
    icon: 'UserCog',
    category: 'Meta',
    isSecret: true,
    target: 1,
  },


  // =============================================
  // ========== 2. GRINDING (Tiered) =============
  // =============================================
  // Games Played
  { id: 'play-10', name: 'Snake Enthusiast', description: 'Play 10 games.', icon: 'Gamepad2', category: 'Grind', target: 10 },
  { id: 'play-50', name: 'Grid Veteran', description: 'Play 50 games.', icon: 'Gamepad2', category: 'Grind', target: 50 },
  { id: 'play-100', name: 'Arcade Regular', description: 'Play 100 games.', icon: 'Ticket', category: 'Grind', target: 100 },
  { id: 'play-250', name: 'This Game Is My Personality', description: 'Play 250 games.', icon: 'Heart', category: 'Grind', target: 250 },
  { id: 'play-500', name: 'Part of the Machine', description: 'Play 500 games.', icon: 'Cpu', category: 'Grind', target: 500 },

  // Food Eaten
  { id: 'eat-50', name: 'Rat Exterminator', description: 'Eat 50 total cyber-rats.', icon: 'Rat', category: 'Grind', target: 50 },
  { id: 'eat-250', name: 'Gourmand', description: 'Eat 250 total cyber-rats.', icon: 'Rat', category: 'Grind', target: 250 },
  { id: 'eat-1000', name: 'Gluttonous Beast', description: 'Eat 1,000 total cyber-rats.', icon: 'Trash2', category: 'Grind', target: 1000 },
  
  // Total Score
  { id: 'total-score-1k', name: 'Point Collector', description: 'Reach a cumulative score of 1,000.', icon: 'TrendingUp', category: 'Grind', target: 1000 },
  { id: 'total-score-10k', name: 'Score Farmer', description: 'Reach a cumulative score of 10,000.', icon: 'TrendingUp', category: 'Grind', target: 10000 },
  { id: 'total-score-50k', name: 'High-Score Hoarder', description: 'Reach a cumulative score of 50,000.', icon: 'TrendingUp', category: 'Grind', target: 50000 },

  // Snake Length
  { id: 'long-snake', name: 'So Long!', description: 'Grow your snake to a length of 20.', icon: 'Spline', category: 'Length', target: 20 },
  { id: 'very-long-snake', name: 'Long Boi', description: 'Grow your snake to a length of 30.', icon: 'Spline', category: 'Length', target: 30 },
  { id: 'mega-snake', name: 'Mega Snake', description: 'Grow your snake to a length of 40.', icon: 'Spline', category: 'Length', target: 40 },
  { id: 'ultra-snake', name: 'Ouroboros', description: 'Grow your snake to a length of 50. You are a legend.', icon: 'Infinity', category: 'Length', target: 50 },

  // =============================================
  // ========== 3. SINGLE-RUN SCORE ==============
  // =============================================
  { id: 'score-100', name: 'Centurion', description: 'Score 100 points in a single game.', icon: 'Award', category: 'Score', target: 100 },
  { id: 'score-200', name: 'Double Century', description: 'Score 200 points in a single game.', icon: 'Award', category: 'Score', target: 200 },
  { id: 'score-300', name: 'Triple Threat', description: 'Score 300 points in a single game.', icon: 'Award', category: 'Score', target: 300 },
  { id: 'score-400', name: 'Quad Damage', description: 'Score 400 points in a single game.', icon: 'Award', category: 'Score', target: 400 },
  { id: 'score-500', name: 'High-Score Hero', description: 'Score 500 points in a single game.', icon: 'Trophy', category: 'Score', target: 500 },
  { id: 'score-750', name: 'Unstoppable', description: 'Score 750 points in a single game.', icon: 'Trophy', category: 'Score', target: 750 },
  { id: 'score-1000', name: 'Perfection', description: 'Score 1,000 points in a single game.', icon: 'Gem', category: 'Score', target: 1000 },

  // =============================================
  // ========== 4. DIFFICULTY MASTERY ============
  // =============================================
  // Easy
  { id: 'easy-victory', name: 'Easy Peasy', description: 'Score over 150 on Easy.', icon: 'ShieldCheck', category: 'Difficulty', target: 150 },
  { id: 'easy-mastery', name: 'Easy Mode Perfected', description: 'Score over 300 on Easy.', icon: 'ShieldCheck', category: 'Difficulty', target: 300 },

  // Medium
  { id: 'medium-master', name: 'Skilled Serpent', description: 'Score over 200 on Medium.', icon: 'Sword', category: 'Difficulty', target: 200 },
  { id: 'medium-legend', name: 'Medium Mode Legend', description: 'Score over 400 on Medium.', icon: 'Sword', category: 'Difficulty', target: 400 },

  // Hard
  { id: 'hard-legend', name: 'Neon Legend', description: 'Score over 150 on Hard.', icon: 'Skull', category: 'Difficulty', target: 150 },
  { id: 'hard-god', name: 'Hard Mode God', description: 'Score over 300 on Hard.', icon: 'Skull', category: 'Difficulty', target: 300 },
  { id: 'perfect-game-hard', name: 'Deity', description: 'Score over 500 points on Hard mode.', icon: 'Sparkles', category: 'Ultimate', target: 500, isSecret: true },


  // =============================================
  // ========== 5. SKILL & PRECISION =============
  // =============================================
  {
    id: 'no-bumps-allowed',
    name: 'Wall Avoider',
    description: 'Survive 60 seconds without hitting a wall.',
    icon: 'ShieldOff',
    category: 'Skill',
    target: 60,
  },
  {
    id: 'master-of-momentum',
    name: 'Master of Momentum',
    description: 'Eat 3 food items in under 10 seconds.',
    icon: 'Zap',
    category: 'Skill',
    target: 3,
  },
  {
    id: 'clean-sweep',
    name: 'Clean Sweep',
    description: 'Eat food within 2 seconds of it spawning (Medium or Hard).',
    icon: 'Sparkles',
    category: 'Skill',
    target: 1,
  },
  {
    id: 'ghost-mode',
    name: 'Ghost Mode',
    description: 'Avoid the moving food for 20 seconds on Medium or Hard.',
    icon: 'Ghost',
    category: 'Skill',
    isSecret: true,
    target: 20,
  },
  {
    id: 'obstacle-pro',
    name: 'Obstacle Pro',
    description: 'Score over 200 on Hard difficulty.',
    icon: 'Network',
    category: 'Difficulty',
    target: 200,
  },
  {
    id: 'serpent-surgeon',
    name: 'Serpent Surgeon',
    description: 'Navigate through a 1-tile gap without crashing.',
    icon: 'MoveVertical',
    category: 'Skill',
    target: 1,
    isSecret: true,
  },
  {
    id: 'secret-wall-hugger',
    name: 'The Wall Whisperer',
    description: 'Win a game on Medium without ever hitting an outer wall.',
    icon: 'Wind',
    category: 'Skill',
    target: 1,
    isSecret: true,
  },
  {
    id: 'box-trap-escape',
    name: 'Miracle Recovery',
    description: 'Escape a situation where you are boxed in on 3 sides.',
    icon: 'BoxSelect',
    category: 'Skill',
    target: 1,
    isSecret: true,
  },
  {
    id: 'one-tile-life',
    name: 'Claustrophobic',
    description: 'Score over 100 with the snake filling over 75% of the board.',
    icon: 'Grid',
    category: 'Skill',
    target: 1,
    isSecret: true,
  },
  {
    id: 'ultra-instinct',
    name: 'Right is Wrong',
    description: 'Score 50 points without ever turning right.',
    icon: 'ArrowLeft',
    category: 'Skill',
    target: 1,
    isSecret: true,
  },
  
  // =============================================
  // ========== 6. ENDURANCE & META ==============
  // =============================================
  {
    id: 'snake-architect',
    name: 'Snake Architect',
    description: 'Survive for 4 minutes in one session.',
    icon: 'Timer',
    category: 'Endurance',
    target: 240,
  },
  {
    id: 'marathon-runner',
    name: 'Marathon Runner',
    description: 'Survive for 6 minutes in one session.',
    icon: 'Timer',
    category: 'Endurance',
    target: 360,
  },
  {
    id: 'daily-grinder',
    name: 'Daily Grinder',
    description: 'Play the game on 3 consecutive days.',
    icon: 'CalendarDays',
    category: 'Meta',
    target: 3,
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'View your Profile page 5 times.',
    icon: 'LineChart',
    category: 'Meta',
    target: 5,
    isSecret: true,
  },
  {
    id: 'explorer-badge',
    name: 'Explorer',
    description: 'Open every page in the navbar at least once.',
    icon: 'Map',
    category: 'Meta',
    target: 1,
  },
  {
    id: 'collection-hunter-1',
    name: 'Collection Hunter',
    description: 'Unlock 10 achievements.',
    icon: 'Trophy',
    category: 'Meta',
    target: 10,
  },
  {
    id: 'collection-hunter-2',
    name: 'Trophy Collector',
    description: 'Unlock 25 achievements.',
    icon: 'Trophy',
    category: 'Meta',
    target: 25,
  },
  {
    id: 'collection-hunter-3',
    name: 'Hoarder',
    description: 'Unlock 50 achievements.',
    icon: 'Archive',
    category: 'Meta',
    target: 50,
  },
  {
    id: 'completionist',
    name: '100% Completionist',
    description: 'Unlock all other achievements.',
    icon: 'Crown',
    category: 'Ultimate',
    target: 100, // This will be the total number of achievements - 1
  },

  // =============================================
  // ========== 7. ULTIMATE & MISC ================
  // =============================================
  {
    id: 'serpent-king',
    name: 'The Serpent King',
    description: 'Hit a global leaderboard Top 10 position.',
    icon: 'Gem',
    category: 'Ultimate',
    target: 1,
    isSecret: true,
  },
  {
    id: 'sweaty-gamer-mode',
    name: 'Sweaty Gamer Mode',
    description: 'Reach Speed Tier 5.',
    icon: 'Flame',
    category: 'Ultimate',
    target: 5,
  },
  {
    id: 'speed-demon-max',
    name: 'Maximum Overdrive',
    description: 'Reach the maximum speed on Hard mode.',
    icon: 'Gauge',
    category: 'Ultimate',
    target: 1,
  },
  { id: 'score-streak-5', name: 'Appetizer', description: 'Eat 5 food items without missing any.', icon: 'Star', category: 'Skill', target: 5 },
  { id: 'score-streak-10', name: 'Main Course', description: 'Eat 10 food items without missing any.', icon: 'Star', category: 'Skill', target: 10 },
  { id: 'score-streak-20', name: 'Dessert', description: 'Eat 20 food items without missing any.', icon: 'Star', category: 'Skill', target: 20 },
  { id: 'survival-2-min', name: 'Survivor', description: 'Survive for 2 minutes in a single game.', icon: 'Clock', category: 'Endurance', target: 120 },
  { id: 'survival-5-min', name: 'Endurance Runner', description: 'Survive for 5 minutes in a single game.', icon: 'Clock', category: 'Endurance', target: 300 },
  { id: 'close-call-5', name: 'Daredevil', description: 'Have 5 near-misses with your own tail in one game.', icon: 'CircleDotDashed', category: 'Skill', target: 5 },
  { id: 'close-call-10', name: 'Adrenaline Junkie', description: 'Have 10 near-misses with your own tail in one game.', icon: 'CircleDotDashed', category: 'Skill', target: 10 },
  { id: 'no-pause-win', name: 'Focused', description: 'Win a game on any difficulty without pausing.', icon: 'Eye', category: 'Skill', target: 1 },
  { id: 'first-hard-win', name: 'Hardened', description: 'Win your first game on Hard difficulty.', icon: 'Medal', category: 'Difficulty', target: 1 },
  { id: 'all-difficulties-win', name: 'Trifecta', description: 'Win a game on each difficulty level.', icon: 'Swords', category: 'Difficulty', target: 1 },
  { id: 'total-tiles-1k', name: 'Wanderer', description: 'Travel 1,000 tiles in total.', icon: 'Footprints', category: 'Grind', target: 1000 },
  { id: 'total-tiles-10k', name: 'Explorer Extraordinaire', description: 'Travel 10,000 tiles in total.', icon: 'Footprints', category: 'Grind', target: 10000 },
  { id: 'total-tiles-100k',name: 'Globetrotter', description: 'Travel 100,000 tiles in total.', icon: 'Footprints', category: 'Grind', target: 100000 },
  { id: 'hugging-the-wall', name: 'Wall Hugger', description: 'Spend 30 seconds moving along the outer walls.', icon: 'PanelRight', category: 'Skill', target: 30 },
  { id: 'minimalist-easy', name: 'Minimalist (Easy)', description: 'Win on Easy with a score under 150.', icon: 'MinusSquare', category: 'Skill', target: 1, isSecret: true },
  { id: 'minimalist-medium',name: 'Minimalist (Medium)', description: 'Win on Medium with a score under 100.', icon: 'MinusSquare', category: 'Skill', target: 1, isSecret: true },
  { id: 'around-the-world', name: 'Around the World', description: 'Circle the entire border of the map.', icon: 'Globe', category: 'Skill', target: 1 },
  { id: 'pacifist-30s', name: 'Pacifist', description: 'Survive for 30 seconds without eating any food.', icon: 'Peace', category: 'Skill', target: 30, isSecret: true },
  { id: 'no-left-turn', name: 'Zoolander', description: 'Score 50 points without turning left.', icon: 'ArrowRight', category: 'Skill', target: 50, isSecret: true },
  { id: 'only-up-down', name: 'Vertical Limit', description: 'Score 30 points using only up and down controls.', icon: 'ArrowUpDown', category: 'Skill', target: 30, isSecret: true },
  { id: 'only-left-right', name: 'Horizontal Line', description: 'Score 30 points using only left and right controls.', icon: 'ArrowLeftRight', category: 'Skill', target: 30, isSecret: true },
  { id: 'speed-tier-3', name: 'Need for Speed', description: 'Reach Speed Tier 3.', icon: 'Gauge', category: 'Skill', target: 3 },
  { id: 'speed-tier-4', name: 'Ludicrous Speed', description: 'Reach Speed Tier 4.', icon: 'Skill', category: 'Skill', target: 4 },
  { id: 'no-food-for-1-min', name: 'Fasting', description: 'Survive for 1 minute without eating food.', icon: 'Cat', category: 'Endurance', target: 60, isSecret: true },
  { id: 'first-secret', name: 'Secret Hunter', description: 'Unlock your first secret achievement.', icon: 'Key', category: 'Meta', target: 1 },
  { id: 'all-secrets', name: 'Master of Secrets', description: 'Unlock all secret achievements.', icon: 'Key', category: 'Meta', target: 15 }, // Adjust target based on final count
  { id: 'total-time-1hr', name: 'Time Sink', description: 'Play for a total of 1 hour.', icon: 'Hourglass', category: 'Grind', target: 3600 },
  { id: 'total-time-5hr', name: 'Time Bender', description: 'Play for a total of 5 hours.', icon: 'Hourglass', category: 'Grind', target: 18000 },
  { id: 'total-time-10hr', name: 'Time Lord', description: 'Play for a total of 10 hours.', icon: 'Hourglass', category: 'Grind', target: 36000 },
  { id: 'perfect-corners', name: 'Corner Master', description: 'Visit all four corners of the map in a single game.', icon: 'Copyleft', category: 'Skill', target: 1 },
  { id: 'chat-contributor', name: 'Chatterbox', description: 'Send 20 messages in global chat.', icon: 'MessagesSquare', category: 'Meta', target: 20 },
  { id: 'zen-master', name: 'Zen Master', description: 'Win a game on Easy without ever speeding up.', icon: 'Anchor', category: 'Skill', target: 1, isSecret: true },
  { id: 'obstacle-clutch', name: 'Clutch', description: 'Survive a near-miss with an obstacle on Hard.', icon: 'AlertTriangle', category: 'Skill', target: 1 },
  { id: 'snake-art', name: 'Snakecasso', description: 'Create a pattern that fills two opposite corners.', icon: 'Paintbrush', category: 'Skill', target: 1, isSecret: true },
  { id: 'symmetric-snake', name: 'Symmetry', description: 'Create a perfectly symmetrical snake shape.', icon: 'Scaling', category: 'Skill', target: 1, isSecret: true },
  { id: 'full-row', name: 'Line Them Up', description: 'Fill an entire row or column with your snake.', icon: 'AlignVerticalJustifyStart', category: 'Skill', target: 1 },
  { id: 'full-grid-almost', name: 'Gridlock', description: 'Fill 90% of the grid with your snake.', icon: 'Grid3x3', category: 'Ultimate', target: 1 },
  { id: 'reset-progress', name: 'A Fresh Start', description: 'Reset your achievement progress.', icon: 'RotateCcw', category: 'Meta', target: 1, isSecret: true },
  { id: 'theme-switcher', name: 'Fashionista', description: 'Try out all available themes.', icon: 'Palette', category: 'Meta', target: 3 },
  { id: 'no-down-turn', name: 'Only Up', description: 'Score 50 points without ever turning down.', icon: 'ArrowUp', category: 'Skill', target: 50, isSecret: true },
  { id: 'rat-trick', name: 'Rat Trick', description: 'Eat 3 rats in 3 seconds.', icon: 'Zap', category: 'Skill', target: 3 },
  { id: 'play-at-midnight', name: 'Night Owl', description: 'Play a game between midnight and 3 AM.', icon: 'Moon', category: 'Meta', target: 1, isSecret: true },
  { id: 'play-on-weekend', name: 'Weekend Warrior', description: 'Play 10 games during a single weekend.', icon: 'Calendar', category: 'Meta', target: 10 },
  { id: 'profile-customizer', name: 'Profile Pro', description: 'Set a custom username and check your profile.', icon: 'UserCircle', category: 'Meta', target: 1 },
  { id: 'leaderboard-watcher',name: 'Aspiring', description: 'Check the leaderboards page 10 times.', icon: 'BarChart2', category: 'Meta', target: 10 },
  { id: 'first-death-by-wall', name: 'First Contact', description: 'Die by hitting a wall for the first time.', icon: 'Building', category: 'Core', target: 1 },
  { id: 'first-death-by-self', name: 'Self-Destruct', description: 'Die by running into yourself for the first time.', icon: 'Disc', category: 'Core', target: 1 },
  { id: 'first-death-by-obstacle', name: 'Calculated Risk', description: 'Die by hitting an obstacle on Hard mode.', icon: 'AppWindow', category: 'Core', target: 1 },
  { id: 'ten-deaths', name: 'Learning the Ropes', description: 'Die 10 times.', icon: 'Skull', category: 'Grind', target: 10 },
  { id: 'hundred-deaths', name: 'Master of Failure', description: 'Die 100 times. You are persistent!', icon: 'Bomb', category: 'Grind', target: 100, isSecret: true },
];
