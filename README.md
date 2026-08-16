# Line & Loop

A polished game of tic-tac-toe against three virtual opponents.

**[Play the live game](https://tic-tac-toe.rmlowe.chatgpt.site)**

## Features

- Easy, Medium, and Unbeatable opponents
- Match score tracking across rounds
- Alternating first player
- Responsive design for desktop and mobile
- Keyboard navigation and screen-reader labels
- Animated moves and winning-line highlights

## Opponents

- **Easy** chooses uniformly at random from the empty squares.
- **Medium** makes an optimal move 68% of the time and a random move 32% of
  the time. It usually plays competently, but deliberately leaves openings.
- **Unbeatable** uses minimax to evaluate every possible continuation. It
  assumes the player will make the strongest available reply and chooses the
  move with the best guaranteed outcome. When several moves are equally good,
  it picks randomly among them.

The player is **X** and the virtual opponent is **O**.

## Running locally

Requires Node.js 22.13 or later.

```bash
npm ci
npm run dev
```

The development server is provided by Vite. The production build and artifact
validation scripts target the Linux environment used by ChatGPT Sites and rely
on GNU `timeout`.

## Technology

- React 19 and TypeScript
- Next.js 16
- Vite and vinext
- Cloudflare Workers-compatible production output
- ChatGPT Sites hosting

The game logic runs entirely in the browser. It does not need a database or
server-side game state.

## Project structure

- `app/page.tsx` — game state, opponent strategies, and interface
- `app/globals.css` — responsive visual design and animations
- `app/layout.tsx` — document metadata and layout
- `tests/` — rendered-output checks
- `scripts/` — Sites build and artifact-validation helpers

## Licence

No open-source licence has been added yet.
