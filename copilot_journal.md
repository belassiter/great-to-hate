### March 29, 2026 - 2:55 PM (Pacific)

> Adjusted Github Action token parameters and checkout depths to avert error 128.\n\n### March 29, 2026 - 1:45 PM (Pacific)

> Ok, that all seems good. Let's deploy to prod!

**Changes:**
- Generated irebase.json and .firebaserc files configured for single-page app hosting with the dist directory and a rewrite to index.html.
- Ran 
pm run build to generate production client artifacts.
- Executed 
px firebase deploy --only hosting successfully deploying the current build to great-to-hate.web.app.

### March 29, 2026 - 1:40 PM (Pacific)

> 1. In the score tables, use the You tags, rather than just (You) text.
> 2. The end of round score table should show the score including the current round.
> 3. Anywhere it says 'Scores' should always be 'Open Book Scores'
> 4. Game results should show above the table '[player name], you are the most open book!' Put the crown and book emoji there, rather than the table.
> 5. Make sure to check all the requirement boxes that have been completed.
> 6. Add some end-to-end tests of an entire gameflow with multiple rounds.

**Changes:**
- Updated the label for Score Tables to say 'Open Book Scores'.
- Adjusted GameBoard score calculations so that it includes the locally completed round's score for the Ranker.
- Replaced the hardcoded (You) string in the GameBoard and GameResults with Pill tags styled like the 'You' tag from the lobbys.
- Adjusted GameResults UI to feature the dynamic ???? {name}, you are the most open book! ???? heading outside the table.
- Marked all satisfied acceptance criteria off in equirements.md.
- Wrote a new robust Test src/tests/gameFlow.test.ts mocking the Firestore instance and testing the progression logic through 2 concurrent rounds of state machine transitions.

### March 29, 2026 - 1:40 PM (Pacific)

> 1. In the score tables, use the You tags, rather than just (You) text.
> 2. The end of round score table should show the score including the current round.
> 3. Anywhere it says 'Scores' should always be 'Open Book Scores'
> 4. Game results should show above the table '[player name], you are the most open book!' Put the crown and book emoji there, rather than the table.
> 5. Make sure to check all the requirement boxes that have been completed.
> 6. Add some end-to-end tests of an entire gameflow with multiple rounds.

**Changes:**
- Updated the label for Score Tables to say Open Book Scores.
- Adjusted GameBoard score calculations so that it includes the locally completed round's score for the Ranker.
- Replaced the hardcoded (You) string in the GameBoard and GameResults with Pill tags styled like the You tag from the lobbys.
- Adjusted GameResults UI to feature the dynamic ???? {name}, you are the most open book! ???? heading outside the table.
- Marked all satisfied acceptance criteria off in equirements.md.
- Wrote a new robust Test src/tests/gameFlow.test.ts mocking the Firestore instance and testing the progression logic through 2 concurrent rounds of state machine transitions.

### March 29, 2026 - 1:20 PM (Pacific)

> 1. During Ranking phase, make the guesser cards gray to show that they're not active.
> 2. Increase the card text length limit to 50 characters.
> 3. On "Are you sure you're ready to guess?", the player should still be able to see the cards underneath the modal
> 4. On the screen with "Another Round", we need to see a table with current Open Book scores.
> 5. Make sure you're marking checkboxes in requirements.md
> 6. Continue with the remaining functionality

**Changes:**
- **Guesser Colors:** Changed `GameBoard.tsx` map logic to apply `bg-gray-700` styling when `!isGuessingPhase` to visually deactivate cards during ranking. 
- **Character Limit:** Updated `maxLength={50}` inside `PlayerLobby.tsx` inputs and checked off the respective `requirements.md` modifications.
- **Modal Overlay Transparency:** Removed full-screen black opacity overlay and placed the Guess confirmation modal in a top floating dialog (`pt-24`) without blocking background `pointer-events`, preserving view of the cards underneath.
- **Scoreboards:** Imported the `players` variable back into `GameBoard`'s props and rendered a formatted scorecard table showing `scores` natively during `isRoundEndPhase`.
- **Game Results Page:** Fully implemented the "End the Game" sequence in `GameResults.tsx`, creating the scoreboard page routing state displaying final scores with 👑📖 emoji styling logic.
- Validated DoD passing `npm run lint`, `npm run test`, and `npm run build`. 

### March 29, 2026 - 1:10 PM (Pacific)

> 1. default-cards.txt is in the dist folder. If that's generated from default-cards.md, that's fine.
> 2. I updated the "Guess!" button to "Done Guessing!", to make it more clear
> 3. During the guessing phase, the Guessers can see the Ranker's rankings. This defeats the entire purpose of the game. The Guesser's ranking can only be seen during the Reveal phase, after the Ranker clicks on one.
> 4. Make the guesser number cards green
> 5. I don't like the system popup saying "Are you ready to guess?". Make it a modal or something in the actual UI
> 6. After the Ranking phase, the Ranker should not see "It's your turn to rank!". It should say something about the Guessing phase when applicable. In the reveal phase, it should be "Reveal your Ranking!" smaller text: "Click your rankings one at a time and tell everyone why"
> 7. During the reveal phase, the Ranker needs an indication of which ones they've revealed. How about making the color more gray after reveal.
> Take care of these, then proceed with the next features.

**Changes:**
- **Guesser Cards Color:** Altered `SortableCard` wrapper on Guessers mapped array from `bg-gray` to `bg-green-600 border-green-500` (Point 4).
- **Text/Subtext Refactor:** Centralized title text and subtext logic using new `getMainText()` and `getSubtext()` methods, adjusting dynamically per-phase to display rules accurately: "It's the Guessers' turn!", "Reveal your ranking!", etc. (Point 6, Point 2).
- **In-App Modal:** Ripped out the `window.confirm` logic for confirming guesses and replaced it with a sleek, absolute positioned `z-50` full-screen HTML modal embedded cleanly in `GameBoard.tsx` (Point 5). 
- **Card Visibilities:** Completely disentangled the Guesser-side visibility check logic. Ranker numbers now require `isRanker || isRevealed || isRoundEndPhase` guaranteeing zero leakage during guesses (Point 3). Discovered and added style toggle `bg-gray-600` specifically for already revealed Ranker cards (Point 7).
- **Another Round / End:** Prepared logic to automatically calculate Round Score, added `startNextRound` and `endGameFromRound` functions in `gameService.ts` to seamlessly shuffle the deck (or inject discord) and pass the `rankerId` to the next player. 
- Clean passing build: `npm run lint`, `npm run test`, and `npm run build`.

### March 29, 2026 - 12:55 PM (Pacific)

> 1. I changed the requirement of "Ranked!" button to "Done Ranking!", to be more clear.
> 2. In desktop mode, the "Ranker" "Cards" "Guesser" text is squished. Make sure the text doesn't overlap with the items below
> 3. Below "It's your turn to rank!", put smaller text saying "Drag the Ranker numbers to show what you think is Great (1) vs Hate (5)"
> 4. I see default-cards.txt is .gitignored-ed. Is that intended? 
> 5. Implement Guesser and Reveal functionality.

**Changes:**
- Note: Clarified that `default-cards` is actually a tracked file named `.md`, and is not in `.gitignore`.
- Updated "Ranked!" to "Done Ranking!" on the `GameBoard`.
- Restructured Desktop board header sizing/wrapping inside `GameBoard.tsx` to explicitly place "Ranker/Cards/Guesser" into standard container flow to completely resolve overlapping.
- Added adaptive helper subtext to clarify context across phases (`ranking`, `guessing`, `revealing`, `round_end`), such as "Drag the Ranker numbers to show..." and "Work together to order the Guesser numbers...".
- Implemented `updateGuesserRankings`, `confirmGuesses`, `revealRanking`, and `finishRound` inside `gameService.ts`.
- Integrated `DndContext` and `SortableContext` for Guesser Cards which enable or disable appropriately during the "guessing" phase for non-Ranker players.
- Added visual 'Reveal' toggling capabilities (face-up overrides + animated rings on hover targeting un-revealed cards) for the Ranker during the 'revealing' phase.
- Executed `npm run lint`, `npm run test`, and `npm run build` validating absolute adherence to Definition of Done.

### March 29, 2026 - 12:15 PM (Pacific)

> A few modifications
> 1. The ranker cards always need to align with the deck cards. This is how people know what they correspond to.
> 2. The 3 groups of cards need a header so people know what they are. Let's start with "Ranker" "Cards" and "Guesser"
> 3. It doesn't seem to be choosing mobile vs desktop layout at the correct breakpoints.
> Fix those, then proceed with drag/drop

**Changes:**
- Adjusted `GameBoard.tsx` responsive flex layouts explicitly ensuring standard row-based stacks for Mobile and column-based groups for Desktop with explicit cross-axis sizes to assure perfect grid alignment.
- Added absolutely-positioned headers to the layout groups: "Ranker", "Cards", and "Guesser".
- Configured `@dnd-kit/core` logic within `GameBoard.tsx` leveraging `SortableContext` to enable accurate ranker card rearranging.
- Built explicit `updateRankerRankings` service to sync sorting state updates locally and externally via Firestore.
- Added the "Ranked!" button utilizing a new `confirmRankings()` method to change `roundPhase`.
- Executed `npm run lint`, `npm run test`, and `npm run build` validating absolute adherence to Definition of Done.

### March 29, 2026 - 11:18 AM (Pacific)

> Make it so

**Changes:**
- Implemented Firebase Anonymous Authentication (`src/services/auth.ts`).
- Connected standard Firestore syncing (`getDoc`, `setDoc`, `onSnapshot`) for game creation, joining, and fetching player lists in `src/services/gameService.ts`.
- Built `GameWrapper` to manage the lifecycle of Firebase subscriptions for the current game (`gameId`), handling loading states and kicking disconnected sessions or invalid IDs back to Home.
- Built a TDD passing `PlayerLobby.tsx` adhering to the rules (max 10 cards, hints section, inline editing, remove modal, visual player list).
- Updated routing in `App.tsx` handling `host/:gameId` and `lobby/:gameId` contexts dynamically linking local react state with remote Firebase auth user state.
- Verified DoD: `npm run lint`, `npm run test`, and `npm run build` completed successfully. Checked remaining setup boxes in `requirements.md`.

### March 29, 2026 - 09:42 AM (Pacific)

> I added firebase-config.txt with that info. Make sure to add that to .gitignore
> Ok, let's build the app! Implement as much as you can from requirements (maybe even the whole thing?), testing as each feature is added. Check each box in requirements.md as it's completed.

**Changes:**
- Added `firebase-config.txt` to `.gitignore`.
- Scaffolded Vite + React + TypeScript app in the root directory.
- Configured Tailwind CSS v4, Lucide-React, and React-Router.
- Configured Vitest and React Testing Library for TDD.
- Set up Firebase App configuration using `firebase-config.txt`.
- Created TDD passing UI components for `Home` and `HostLobby`.
- Wired up initial `gameService` to create/join sessions.
- Checked off Host Setup and Join requirements in `requirements.md`.
- Confirmed `npm run lint`, `npm run test`, and `npm run build` all pass successfully.
H o s t   i s   a l w a y s   P l a y e r   # 1 
 
 S t a r t   G a m e 
 
 


