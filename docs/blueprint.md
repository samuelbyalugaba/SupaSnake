# **App Name**: Neon Snake

## Core Features:

- Core Game Logic: Implements the fundamental Snake game mechanics: snake movement, food spawning, collision detection, score calculation, pause, resume, and restart.
- Firebase Authentication: Allows users to log in using Google or email via Firebase Authentication, enabling score submission to the leaderboard.
- Real-time Leaderboard: Displays the top 10 high scores fetched from Firestore in real-time, updating dynamically as new scores are submitted.
- Score Submission and Storage: Stores user high scores in a Firestore collection, including user ID, username, score, and timestamp.
- Responsive Canvas Scaling: Adapts the game canvas to different screen sizes, scaling appropriately for both desktop and mobile devices.
- Enhanced Controls: It uses both keyboard for desktop (arrow keys/WASD), touch input on mobile devices for swipe gestures for the core controls, spacebar and enter for pause/resume/restart functionality
- Sound Effects Tool: Plays sound effects for actions such as eating an apple (chime) and game over (buzz), controllable by the user. AI tool helps determine if the sound effects need to be added.

## Style Guidelines:

- Primary color: Neon Green (#39FF14) for the snake to emphasize the retro and digital feeling.
- Background color: Dark Black (#000000) for a stark contrast to enhance the neon elements and reduce eye strain.
- Accent color: Bright Red (#FF0000) for the apple, creating visual contrast against the neon green and black.
- Body and headline font: 'Space Grotesk' (sans-serif) for a tech-centric, modern aesthetic in the UI elements. 
- Minimalist vector icons for UI elements (e.g., pause/play), ensuring clarity and a modern look.
- Fixed header displaying score, high score, and level. Leaderboard below the game canvas.
- Smooth animations via requestAnimationFrame, with a subtle gradient fill effect for the snake segments to add depth.