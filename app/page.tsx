"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Mark = "X" | "O";
type Cell = Mark | null;
type Difficulty = "Easy" | "Medium" | "Unbeatable";

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function result(board: Cell[]) {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return { winner: null, line: board.every(Boolean) ? [] : null };
}

function minimax(board: Cell[], maximizing: boolean): number {
  const outcome = result(board);
  if (outcome.winner === "O") return 10;
  if (outcome.winner === "X") return -10;
  if (outcome.line) return 0;

  const scores: number[] = [];
  board.forEach((cell, index) => {
    if (!cell) {
      const next = [...board];
      next[index] = maximizing ? "O" : "X";
      scores.push(minimax(next, !maximizing));
    }
  });
  return maximizing ? Math.max(...scores) : Math.min(...scores);
}

function bestMove(board: Cell[], difficulty: Difficulty) {
  const open = board.map((cell, i) => (cell ? -1 : i)).filter((i) => i >= 0);
  if (difficulty === "Easy") return open[Math.floor(Math.random() * open.length)];

  // Medium plays perfectly most of the time, but leaves the occasional opening.
  if (difficulty === "Medium" && Math.random() < 0.32) {
    return open[Math.floor(Math.random() * open.length)];
  }

  let highest = -Infinity;
  let choices: number[] = [];
  for (const index of open) {
    const next = [...board];
    next[index] = "O";
    const score = minimax(next, false);
    if (score > highest) {
      highest = score;
      choices = [index];
    } else if (score === highest) choices.push(index);
  }
  return choices[Math.floor(Math.random() * choices.length)];
}

export default function Home() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [thinking, setThinking] = useState(false);
  const [score, setScore] = useState({ you: 0, draws: 0, rival: 0 });
  const [starter, setStarter] = useState<Mark>("X");
  const scoredBoard = useRef<string | null>(null);
  const roundId = useRef(0);
  const outcome = useMemo(() => result(board), [board]);
  const finished = outcome.line !== null;

  const status = outcome.winner === "X"
    ? "You found the line. Nicely played."
    : outcome.winner === "O"
      ? "Your rival takes this one."
      : outcome.line
        ? "A hard-fought draw."
        : thinking
          ? "Your rival is thinking…"
          : "Your move — place an X.";

  useEffect(() => {
    if (!finished || scoredBoard.current === board.join("-")) return;
    scoredBoard.current = board.join("-");
    setScore((current) => outcome.winner === "X"
      ? { ...current, you: current.you + 1 }
      : outcome.winner === "O"
        ? { ...current, rival: current.rival + 1 }
        : { ...current, draws: current.draws + 1 });
  }, [board, finished, outcome.winner]);

  function rivalTurn(nextBoard: Cell[]) {
    const activeRound = roundId.current;
    setThinking(true);
    window.setTimeout(() => {
      if (activeRound !== roundId.current) return;
      const index = bestMove(nextBoard, difficulty);
      if (index !== undefined) {
        const moved = [...nextBoard];
        moved[index] = "O";
        setBoard(moved);
      }
      setThinking(false);
    }, 460);
  }

  function play(index: number) {
    if (board[index] || thinking || finished) return;
    const next = [...board];
    next[index] = "X";
    setBoard(next);
    if (result(next).line === null) rivalTurn(next);
  }

  function newRound() {
    roundId.current += 1;
    setThinking(false);
    scoredBoard.current = null;
    const nextStarter = starter === "X" ? "O" : "X";
    setStarter(nextStarter);
    const empty: Cell[] = Array(9).fill(null);
    setBoard(empty);
    if (nextStarter === "O") rivalTurn(empty);
  }

  function changeDifficulty(next: Difficulty) {
    if (thinking) return;
    roundId.current += 1;
    setDifficulty(next);
    scoredBoard.current = null;
    setStarter("X");
    setBoard(Array(9).fill(null));
  }

  return (
    <main>
      <div className="paper-grain" aria-hidden="true" />
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Line and Loop home">
          <span className="brand-mark"><i /><i /><i /><i /></span>
          <span>Line <em>&</em> Loop</span>
        </a>
        <p>Three in a row. Simple in theory.</p>
      </header>

      <section className="game-shell" id="top">
        <div className="intro">
          <span className="eyebrow">A small battle of wits</span>
          <h1>Outthink<br />the <em>machine.</em></h1>
          <p className="lede">You&apos;re the crosses. Your quiet, calculating rival is the circles. Find the line before it does.</p>

          <div className="difficulty" aria-label="Choose opponent difficulty">
            <span>Opponent</span>
            <div className="segmented">
              {(["Easy", "Medium", "Unbeatable"] as Difficulty[]).map((level) => (
                <button
                  key={level}
                  className={difficulty === level ? "active" : ""}
                  onClick={() => changeDifficulty(level)}
                  aria-pressed={difficulty === level}
                >{level}</button>
              ))}
            </div>
          </div>

          <div className="scorecard" aria-label="Match score">
            <div><strong>{score.you}</strong><span><b className="x-mini">×</b> You</span></div>
            <div><strong>{score.draws}</strong><span>Draws</span></div>
            <div><strong>{score.rival}</strong><span><b className="o-mini" /> Rival</span></div>
          </div>
        </div>

        <div className="game-area">
          <div className="turn-row">
            <div className={`pulse ${thinking ? "thinking" : ""}`} />
            <p aria-live="polite">{status}</p>
            <span>Round {score.you + score.draws + score.rival + 1}</span>
          </div>

          <div className={`board ${thinking ? "is-thinking" : ""}`} role="grid" aria-label="Tic-tac-toe board">
            {board.map((cell, index) => (
              <button
                key={index}
                className={`cell ${cell ? `marked ${cell.toLowerCase()}` : ""} ${outcome.line?.includes(index) ? "winning" : ""}`}
                onClick={() => play(index)}
                disabled={Boolean(cell) || thinking || finished}
                aria-label={cell ? `Square ${index + 1}: ${cell === "X" ? "you" : "rival"}` : `Play square ${index + 1}`}
                role="gridcell"
              >
                {cell === "X" && <span className="mark-x" aria-hidden="true" />}
                {cell === "O" && <span className="mark-o" aria-hidden="true" />}
              </button>
            ))}
          </div>

          <div className="game-actions">
            <button className="new-round" onClick={newRound}>
              <span>New round</span><b aria-hidden="true">↗</b>
            </button>
            <button className="reset-score" onClick={() => { setScore({ you: 0, draws: 0, rival: 0 }); scoredBoard.current = finished ? board.join("-") : null; }}>
              Reset score
            </button>
          </div>
          <p className="hint">Tip: rounds alternate who goes first.</p>
        </div>
      </section>

      <footer><span>Built for friendly rivalry.</span><span>✦ No accounts. No fuss. Just play.</span></footer>
    </main>
  );
}
