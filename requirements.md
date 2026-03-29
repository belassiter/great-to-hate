# Overview
A game where a player is given 5 things to rank, and the other players collaborate to guess the ranking. Inspired by the card game First to Worst, though with some variations.

# High Level
1. The game is called "Great to Hate". 
1. I'm thinking to use a previous game I developed as a starting point. The file "sameword.html" has that game. Although the game mechanics are different, I think we may be able to reuse some components:
    1. Firebase patterns (though we'll need to make a new Firestore project)
    1. Multiplayer handling
    1. Emoji function
    1. General turn-taking sequence
    1. General aesthetic/UX
    1. Deploying to Firebase/Firestore
1. Some things will definitely need to be different
    1. New Firebase/Firestore project
    1. Need automated tests
    1. Gameplay rules
    1. Use a normal tech stack, rather than just one big html/js file

# Game flow
## Setting up a game (host)
 - [x] There's a tab for "Remote". (right now nothign for "Local", we can add that later) Note: existing behavior
 - [x] Host clicks "Create Private Game". Note: existing behavior
 - [x] Sees a 6-character game code, copy button. 
 - [x] Sees "Waiting for player(s)" if there are no other players joined
 - [x] As players join the game, host sees a table: Player #, Name, Cards Created, X. X is a button that kicks the player. The table scrolls vertically if needed. The table is at the bottom of the screen. The screen does not scroll vertically.
 - [x] Above the table, sees "Total number of custom cards created: [number]"
 - [x] Sees a toggle "Include default cards". Note: an actual toggle, not a checkbox.
 - [x] Sees a button "Start Game". It's only enabled if at least 25 cards are included and at least 2 players have joined (including the Host). If disabled because of <25 cards, on hover show tooltip "Need at least 25 cards, consider toggling default cards." If disabled because of <2 players, show tooltip "Need at least 2 players".
 - [ ] Sees a button "Add cards". This opens a modal that has the same "Add a card" behavior that's in the Game Lobby.
 - [x] Host can click on their name to edit their name
 - [x] Host is always listed as Player #1
## Joining a game
 - [x] There's a tab for "Remote"
 - [ ] Limit to exactly 8 players maximum. If an 8th player has joined, further attempts to join display an error: "Game is full".
 - [x] There's a text entry box for "Enter Game ID". Note: existing behavior
 - [x] There's a text entry box for "Name"
 - [x] There's a button "Join Game", which requires a valid GameID and a Name which hasn't joined that GameID yet. If those criteria aren't met,red text explains below the button
 - [ ] Use Firebase anonymous auth to persist player sessions. If a player reloads or disconnects, use their auth token to drop them immediately back into their seat without requiring them to re-enter their Name or GameID.
## Game Lobby
 - [x] Players that successfully "Join Game" go to the Game Lobby
 - [x] They see a list of players
 - [x] They see a button, "Add a card". Clicking it creates an empty card.
 - [x] Clicking on a card lets them edit the text. Clicking outside the card or pressing Enter saves the text. Text can be up to 30 characters, doesn't allow more to be typed.
 - [x] Each card has a red X in the upper right corner. When clicked, a modal asks "Remove this card?", with a Remove and Cancel button. Remove removes the card, Cancel closes the modal without making changes
 - [x] Player can add up to 10 cards
 - [x] Player sees hints on making cards: "Choose people, places, things, actions, and situations that people will have a strong and varying opinion on. The game is called Great to Hate, after all." "Good: pinapple on pizza, foggy days, SNL, [specific pop star], anime..." "Bad: tap water, trees, sidewalks, pizza, screaming children". "Note: it's better to not make these about real people that the players know, unless you have clear agreement on that. It's no fun hating on real people without their consent."
 - [x] Note: the Host never sees the lobby, it is just for other players
 - [x] A player sees a "You" tag next to their name. Similar to the Host tag, but green.
 - [x] A player can click on their name to edit their own name (but not other players' names)
## Starting play
 - [ ] When the host clicks "Start Game"
 - [ ] Creates a deck of cards. This includes all custom cards, and also default cards if the toggle was on. Default cards are currently stored in default-cards-md, but you're welcome to change the filetype and/or move it to a different folder. The card set has these properties for each card: Text, Source ("default" or the player's name), ID# (unique ID to reference a card internally)
 - [ ] The deck is shuffled, to have a random order
 - [ ] The list of players is shuffled, to have a random order.
 - [ ] An "Open Book" score value is kept for each player, starting at 0. 
## Playing a round
 - [x] The next player on the player list is chosen as the Ranker. All other players are Guessers.
 - [x] The five top deck cards are dealt into the play area, in a row, face-down. If the deck becomes empty, shuffle the discard pile to refresh the deck.
 - [x] Five face-down rank cards are dealt in a row above the deck cards. They are numbered 1 through 5, left to right. These are the Ranker rank cards.
 - [x] Five face-down rank cards are dealt in a row below the deck cards. They are numbered 1 through 5, left to right. These are the Guesser rank cards.
 ### Ranking
 - [x] The Ranker sees the Ranker cards and deck cards flipped. The Guessers do not see them. 
 - [x] The Ranker can drag and drop the Ranker cards to swap their positions. Each Ranker card always aligns horizontally with a deck card, each position always has a card. When dragging a card, it shows a ghost of what the card positions would be if the player released the card (i.e. swapping). If the card is released outside the Ranker row, then no changes are made.
 - [x] The Guessers can see the Ranker dragging the cards, but they appear face-down to the Guessers.
 - [ ] If the Ranker has disconnected for 30 seconds, show the Guessers a popup "The Ranker is offline. Drop them and start a new round?" "Drop them" increments the Ranker and starts a new Round. If the Ranker comes back online, the popup disappears.
 - [x] The Ranker pushes a "Done Ranking!" button when they are done ranking. After this, the Ranker can no longer move cards.
 ### Guessing
 - [ ] After "Done Ranking!" is clicked, the Guessers see the deck cards and Guesser cards flipped. The Ranker cards still appear face-down (they need to be secret)
 - [ ] The Ranker can sees the Guesser cards flipped, and sees the Guessers dragging the cards.
 - [ ] Guessers can drag and drop Guesser cards, similar to how it works for Ranker. Only one guesser can drag at a time, other players are restricted and see a "waiting for other player" message (though they can still see the cards and dragging motion)
 - [ ] A Guesser pushes a "Done Guessing!" button when they are done guessing. There is a popup asking, "Are you sure?", with buttons for "Guess!" and "Cancel"
 ### Reveal
 - [ ] After Guess is confirmed. The Ranker sees a prompt "Reveal your ranking one by one", and gets a visual indicator they they should click on any one of their Ranker cards.
 - [ ] The Ranker clicks on one of their Ranker cards, and for the Guessers that card is flipped to reveal the ranking.
 - [ ] The purpose of revealing the cards one by one is so the Ranker and Guessers can chat a bit on each answer.
 - [ ] The Ranker continues clicking on the Ranker cards until all are revealed. When all are revealed they see a button "Finish the round"
 - [ ] When Finish the Round is clicked, the score is shown to all players as a popup with "[Ranker's name]'s Open Book score is [number]", calculated as (number of Ranker-Guesser correct rankings) - (number of Ranker-Guesser incorrect rankings). So if the guessers get 3 correct and 2 incorrect, the score is 1. The popup also has buttons for "Another round" and "End the game"
 - [ ] For "Another round". Deck cards a put into a discard pile. The next player in the player list becomes the ranker. The round score is added to the Ranker's total score. A new round begins.
## Ending of game
 - [ ] For "End the game". All players see the "Game Results" screen.
 - [ ] It has a table with Player names and Open Book score. The player with the highest score has a crown emoji and book emoji by their name, and the font of their name is bolded.
 - [ ] It has a button for "New game", which sends them back to initial screen

# Visuals
 - [ ] **Vibe:** Simple but inviting.
 - [ ] **Theme:** Dark mode by default.
 - [ ] **Colors:** Purple and white (consistent with the vibe of `sameword.html`).
 - [ ] **Dragging Feedback:** The dragged card should slightly tilt while held, and valid drop targets should highlight with a glowing border.
 - [ ] **Animations:** Use smooth animations for state changes (cards dealing out, flipping over smoothly, sliding into place when swapped).
 - [ ] **Card Design & Layout (Adapting Pill Shape):** Cards are structured as "pills" or wide rectangles to optimize reading up to 30 characters.
    - **Desktop Layout:** The 5 Deck cards are laid out horizontally in a row. The 5 Ranker cards are in a row above them, and the 5 Guesser cards are in a row below them. Dragging happens horizontally.
    - **Mobile Layout:** The board rotates 90 degrees to fit the narrow screen. The 5 Deck cards are stacked vertically as wide rows. Ranker cards are placed in a column to the left, and Guesser cards in a column to the right. Dragging happens vertically (up and down).

# Tech stack
1. Use React + Vite + TypeScript.
2. Use Firebase for real-time multiplayer state and hosting:
   1. Cloud Firestore for real-time database syncing.
   2. Firebase Anonymous Auth for persisting player sessions smoothly.
   3. Firebase Hosting for deploying the static output of the Vite build.
3. Keep the frontend component-based to avoid large single-file codebases and make AI generation/troubleshooting more manageable.
4. Use Tailwind CSS for rapid responsive styling, Framer Motion for layout animations and drag-and-drop visual feedback, and `dnd-kit` for handling the drag-and-drop behavior.
5. Strict Test-Driven Development (TDD) using Vitest and React Testing Library.




