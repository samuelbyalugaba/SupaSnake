# Supa Snake 🐍

Welcome to **Supa Snake**! This is a modern, responsive twist on the classic Snake game, built with a stunning retro-neon aesthetic. Guide your glowing snake to eat the elusive cyber-rat, grow longer, unlock achievements, customize your look, and compete against players worldwide in a persistent online league.

![Supa Snake Gameplay](https://i.imgur.com/y8Z9g8A.png) 

## 🚀 Features

### Core Gameplay
- **Classic Snake, Modern Vibe**: Enjoy the simple and addictive gameplay you love, reimagined with a vibrant, glowing, retro-futuristic style.
- **Three Dynamic Difficulty Modes**:
    - **Easy**: Perfect for beginners. The food is stationary, and there are no obstacles. A chill mode to learn the ropes.
    - **Medium**: The standard snake experience. The food (a rat) now moves around the grid, making it a trickier target.
    - **Hard**: For the ultimate challenge! The food moves, and randomly generated wall obstacles appear, forcing you to navigate with precision.
- **Engaging Gameplay Mechanics**:
    - **Dynamic Speed**: The game speed increases as you "level up" by eating more food, with the difficulty curve getting steeper in medium and hard modes.
    - **Tricky AI Food**: In medium and hard modes, the rat has its own movement pattern, making it a challenging and unpredictable target.

### Player Progression & Social Features (Powered by Firebase)
- **Authentication**: Sign up and log in to save your progress and access all online features.
- **Comprehensive Stat Tracking**: Your personal profile tracks key statistics:
    - High Score
    - Total Games Played
    - Lifetime Total Score
    - **Neon Bits** (in-game currency earned by playing)
    - **League Points** (LP) for seasonal rankings
- **Extensive Achievement System**: Unlock dozens of achievements across multiple categories: Core, Grind, Score, Skill, Difficulty, and even secret "Ultimate" challenges. Achievements track your progress and notify you upon completion.
- **Cosmetics & Customization**:
    - **Unlockable Skins**: Discover and unlock a massive collection of snake skins with varying rarities: Common, Rare, Epic, Legendary, and Seasonal.
    - **Multiple Unlock Methods**: Purchase skins with Neon Bits earned in-game or unlock exclusive skins by completing specific, difficult achievements.
    - **Equip Your Style**: Show off your favorite unlocked skin in-game. Your equipped cosmetic is even visible to others on the leaderboards!
- **Nests (Clans)**:
    - **Create or Join a Nest**: Team up with friends and other players. Found your own Nest for a small fee of Neon Bits or join an existing public one.
    - **Nest Management**: As an admin, manage roles (moderator, member) and kick members. As a member, you can leave at any time.
    - **Nest Leaderboards**: Compete with other Nests for the highest cumulative score.
- **Global Chat**: Connect with the entire community in a real-time global chat, accessible directly from the main menu.

### Competitive Play
- **Supa Snake League**:
    - **Seasonal Rankings**: Compete in monthly seasons to earn League Points (LP) by playing well.
    - **Climb the Divisions**: Progress through ranks from Bronze to the coveted **Serpent King**. Each rank has a unique icon and LP requirement.
    - **Your League Profile**: A dedicated profile page shows your current rank, LP, progress to the next division, and notable achievement badges.
- **Live Leaderboards**:
    - **Player Rankings**: See how your League Points stack up against the global competition.
    - **Nest Rankings**: Check which Nests are dominating the charts based on their members' combined scores.

### Immersive Experience
- **Immersive Visuals**: A beautiful, glowing, retro-inspired theme with CRT scanlines and an animated grid background that makes you feel like you're inside the machine.
- **Sound Effects**: Audio feedback for key game events like eating food and game over, powered by Tone.js.
- **Responsive & Full-Screen**:
    - Play seamlessly on both desktop and mobile devices.
    - Immerse yourself in the action with a distraction-free full-screen mode.

## 🎮 How to Play

The goal is simple: control the snake, eat the food to grow, and avoid crashing into the walls or your own tail!

### Controls

- **Desktop**:
    - **Arrow Keys** or **WASD Keys**: Control the snake's direction.
    - **Spacebar**: Pause and resume the game.
    - **Enter**: Start the game from the main menu or restart after a "Game Over".
    - **F Key**: Toggle full-screen mode.

- **Mobile**:
    - **Swipe**: Swipe on the game canvas to change the snake's direction.
    - **On-Screen Buttons**: Use the dedicated on-screen buttons to pause/resume and enter/exit full-screen.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) components
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication, Firestore)
- **Animation & Sound**: [Tone.js](https://tonejs.github.io/) for web audio
- **PWA**: App is a fully installable Progressive Web App for offline access.

---

> All Rights Reserved. Made With 💚 @ TSJ Diversified Group