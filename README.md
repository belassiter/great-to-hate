# Great to Hate

**Great to Hate** is a multiplayer party game that tests how well you know your friends! Find out who is an "Open Book" and who is a complete mystery by guessing their personal rankings of user-submitted prompts.

## Play the Game
[**great-to-hate.web.app**](https://great-to-hate.web.app/)

## How It Works
Each game consists of a few simple phases:

1. **Setup & Lobby**: Players collaborate to create a deck of cards by writing down different things (prompts, objects, ideas) alongside a set of default cards.
2. **Ranking**: The active "Ranker" is dealt 5 cards from the deck. They secretly order these cards from best (1) to worst (5) based on their own preference.
3. **Guessing**: All other players (the "Guessers") work together dynamically Dragging & Dropping to guess the Ranker's exact order.
4. **Reveal & Scoring**: The Ranker reveals their true ranking one by one. Points (Open Book Scores) are awarded to the Ranker based on how accurately the Guessers predicted their choices.

## Tech Stack

This project is built to accommodate real-time state synchronization, drag-and-drop mechanics, and high-performance React UI updates.

- **Frontend Framework**: [React 19](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/) and [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State & Real-time Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore) & Anonymous Authentication
- **Drag & Drop**: [@dnd-kit/core](https://dndkit.com/)
- **Testing**: [Vitest](https://vitest.dev/) and React Testing Library
- **Hosting / CI/CD**: Firebase Hosting deployed via GitHub Actions

## Architecture Overview

The app is built entirely as a client-side Single Page Application (SPA) driven by a Firebase Firestore backend state machine.
- `Game Service` (`src/services/gameService.ts`): Implements the core game logic by mapping player events (joining, starting game, ranking updates) directly to Firestore documents representing the game's mutable state natively through `onSnapshot` listeners.
- **Drag-n-Drop Engine**: Utilizes `@dnd-kit/sortable` contexts seamlessly hooked into local-state first, sending batch modifications to Firestore upon user confirmation.
- **Data Model**: Follows a denormalized NoSQL schema representing a top-level `games` document containing arrays of cards, discard piles, and sub-collections of `players`. 

## Development Setup

If you wish to run the project locally or contribute to the development:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/belassiter/great-to-hate.git
   cd great-to-hate
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Firebase Setup**:
   You'll need a Firebase project configured with Firestore and Anonymous Authentication enabled. Populate a `firebase-config.txt` or adapt `src/services/firebase.ts` with your environment keys.

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Run Tests & Linter**:
   ```bash
   npm run test
   npm run lint
   ```

6. **Deployment**:
  ```bash
  npm run build ; npx firebase deploy
  ```
  
## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.
