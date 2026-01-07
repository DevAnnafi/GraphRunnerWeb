# 🎮 Graph Runner

A challenging web-based game where you navigate through dynamic obstacles using pathfinding algorithms. Collect all checkpoints while avoiding intelligent enemies that hunt you down!

![Game Screenshot](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

## 🚀 Features

- **30 Progressively Challenging Levels** - Each level introduces new enemies and obstacles
- **Intelligent AI Enemies** - Red enemies use Dijkstra's pathfinding algorithm to hunt you
- **Rail Enemies** - Orange enemies patrol predefined paths
- **Safe Zones** - Green areas where enemies can't harm you
- **Checkpoint System** - Collect all checkpoints to complete each level
- **Sound Effects** - Audio feedback for checkpoints, level completion, and game over
- **Responsive Controls** - Smooth keyboard controls (Arrow keys or WASD)

## 🎯 How to Play

### Objective
Navigate your blue player character through the level, collect all red/yellow checkpoints, and avoid enemies!

### Controls
- **Arrow Keys** or **WASD** - Move your character
- **Sound Toggle** - Click the 🔊/🔇 button to enable/disable sound

### Game Elements
- 🔵 **Blue Circle** - Your player character
- 🔴 **Red Circles** - Smart enemies that chase you using pathfinding
- 🟠 **Orange Circles** - Rail enemies that patrol fixed paths
- 🟢 **Green Zones** - Safe areas where enemies can't hurt you
- 🔴 **Red Circles (Large)** - Uncollected checkpoints
- 🟡 **Yellow Circles (Large)** - Collected checkpoints

### Strategy Tips
1. **Use Safe Zones** - Plan your route to utilize green safe zones strategically
2. **Watch Enemy Patterns** - Rail enemies follow predictable paths
3. **Avoid Corners** - Smart enemies can trap you in corners
4. **Speed Increases** - Enemies get faster in higher levels
5. **Plan Your Route** - Think ahead about which checkpoint to collect first

## 🛠️ Installation

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Setup

1. **Create Next.js Project**
```bash
npx create-next-app@latest graph-runner-nextjs
```

Select these options:
- TypeScript: No
- ESLint: Yes
- Tailwind CSS: **Yes** ✓
- `src/` directory: Yes
- App Router: **Yes** ✓
- Customize import alias: No

2. **Navigate to Project**
```bash
cd graph-runner-nextjs
```

3. **Install Dependencies**
```bash
npm install
```

4. **Create Component**
Create `src/components/GraphRunner.jsx` and paste the game component code.

5. **Update Main Page**
Replace `src/app/page.js` with:
```jsx
import GraphRunner from '@/components/GraphRunner';

export default function Home() {
  return <GraphRunner />;
}
```

6. **Update Global Styles**
Replace `src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}
```

7. **Run Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000` to play!

## 📁 Project Structure

```
graph-runner-nextjs/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.js
│   │   └── page.js
├── package.json
├── tailwind.config.js
└── README.md
```

## 🎨 Technical Details

### Technologies Used
- **Next.js 14+** - React framework with App Router
- **React 18+** - UI library with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **Canvas API** - For game rendering
- **Web Audio API** - For sound effects

### Key Features
- **Dijkstra's Algorithm** - Used for enemy pathfinding
- **Grid-based Movement** - 20x15 grid system (40px cells)
- **60 FPS Game Loop** - Smooth animation using setInterval
- **Client-side Rendering** - Uses 'use client' directive for browser APIs

### Game Configuration
Each level has configurable:
- **Adaptive Enemies** - Number, position, speed, and radius
- **Rail Enemies** - Path arrays and movement speed
- **Safe Zones** - Position and size
- **Checkpoints** - Position and unique IDs

### 🧩 Handcrafted Levels (1–10)

The first 10 levels are manually tuned to teach mechanics, movement discipline, and safe-zone usage.

| Level | Adaptive Enemies | Rail Enemies | Checkpoints | Difficulty |
|------:|------------------|--------------|-------------|------------|
| 1     | 1 | 1 | 1 | ⭐ |
| 2     | 2 | 1 | 1 | ⭐⭐ |
| 3     | 3 | 2 | 2 | ⭐⭐ |
| 4     | 4 | 3 | 3 | ⭐⭐⭐ |
| 5     | 5 | 3 | 3 | ⭐⭐⭐ |
| 6     | 6 | 4 | 4 | ⭐⭐⭐⭐ |
| 7     | 7 | 4 | 5 | ⭐⭐⭐⭐ |
| 8     | 8 | 5 | 6 | ⭐⭐⭐⭐⭐ |
| 9     | 9 | 5 | 7 | ⭐⭐⭐⭐⭐ |
| 10    | 10 | 6 | 8 | ⭐⭐⭐⭐⭐ |

These levels introduce:
- Dijkstra-based enemy pursuit
- Rail-based movement patterns
- Checkpoint chaining and combo multipliers
- Safe-zone positioning and respawn strategy

---

### 🔁 Procedural Scaling Levels (11–29)

Levels 11–29 are generated dynamically using a difficulty curve that scales:

- Enemy count
- Enemy speed
- Rail density
- Checkpoint count
- Safe-zone size
- Time pressure

| Level Range | Adaptive Enemies | Rail Enemies | Checkpoints | Difficulty |
|-------------|------------------|--------------|-------------|------------|
| 11–13 | 10–11 | 6–7 | 8 | ⭐⭐⭐⭐⭐ |
| 14–16 | 11 | 7 | 8–9 | ⭐⭐⭐⭐⭐ |
| 17–19 | 11–12 | 7 | 9 | ⭐⭐⭐⭐⭐⭐ |
| 20–22 | 12 | 8 | 9 | ⭐⭐⭐⭐⭐⭐ |
| 23–25 | 12 | 8 | 9 | ⭐⭐⭐⭐⭐⭐⭐ |
| 26–29 | 12 | 8 | 9 | ⭐⭐⭐⭐⭐⭐⭐ |

These levels emphasize:
- Route optimization under pressure
- Predictive movement against pathfinding enemies
- Efficient checkpoint chaining for score multipliers
- Precision positioning with shrinking safe zones

---

### 🔥 Final Challenge — Level 30

**Level 30 is intentionally designed as an “impossible but doable” skill check.**

| Level | Adaptive Enemies | Rail Enemies | Checkpoints | Difficulty |
|------:|------------------|--------------|-------------|------------|
| 30 | 15–18 | 9–10 | 9 | ⭐⭐⭐⭐⭐⭐⭐⭐ |

**What makes Level 30 different:**
- Extreme enemy density
- Minimal safe-zone margin
- High-speed pursuit and overlapping rail patterns
- Tight time constraints
- No randomness — success is entirely execution- and strategy-based

---

## 🐛 Troubleshooting

**Issue: "document is not defined" error**
- Solution: Ensure `'use client';` is at the top of GraphRunner.jsx

**Issue: Canvas not rendering**
- Solution: Check that the component is client-side rendered

**Issue: No sound playing**
- Solution: Some browsers require user interaction before playing audio. Click the sound toggle after starting.

**Issue: Tailwind styles not working**
- Solution: Verify `tailwind.config.js` includes correct content paths

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Deploy with one click!

### Build for Production
```bash
npm run build
npm start
```

## 📝 License

MIT License - Feel free to use this project for learning and fun!

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Add new levels
- Improve enemy AI
- Add power-ups
- Create new game mechanics
- Fix bugs

## 🎯 Future Enhancements

- [ ] Add power-ups (speed boost, invisibility, etc.)
- [ ] Implement a level editor
- [ ] Add multiplayer mode
- [ ] Create mobile touch controls
- [ ] Add particle effects
- [ ] Implement a scoring system with combos
- [ ] Add achievements and unlockables
- [ ] Create a tutorial mode

## 👏 Credits

Created with ❤️ using Next.js, React, and Canvas API

---

**Enjoy playing Graph Runner!** 🎮✨