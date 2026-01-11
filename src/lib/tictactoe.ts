export type Cell = "X" | "O" | null;
export type Board = Cell[];

export type Winner = "X" | "O" | "DRAW" | null;

const WIN_LINES: ReadonlyArray<ReadonlyArray<number>> = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
] as const;

export function getWinner(board: Board): Winner {
    for (const [a, b, c] of WIN_LINES) {
        const v = board[a];
        if (v && v === board[b] && v === board[c]) return v;
    }

    const isFull = board.every((cell) => cell !== null);
    return isFull ? "DRAW" : null;
}

function emptyIndexes(board: Board): number[] {
    const idx: number[] = [];
    for (let i = 0; i < board.length; i++) {
        if (board[i] === null) idx.push(i);
    }
    return idx;
}

function minimax(board: Board, isBotTurn: boolean): { score: number; move: number | null } {
    const winner = getWinner(board);

    if (winner === "O") return { score: 1, move: null };
    if (winner === "X") return { score: -1, move: null };
    if (winner === "DRAW") return { score: 0, move: null };

    const moves = emptyIndexes(board);
    let bestScore = isBotTurn ? -Infinity : Infinity;
    let bestMoves: number[] = [];

    for (const move of moves) {
        const next = board.slice();
        next[move] = isBotTurn ? "O" : "X";

        const result = minimax(next, !isBotTurn);
        const score = result.score;

        if (isBotTurn) {
            if (score > bestScore) {
                bestScore = score;
                bestMoves = [move];
            } else if (score === bestScore) {
                bestMoves.push(move);
            }
        } else {
            if (score < bestScore) {
                bestScore = score;
                bestMoves = [move];
            } else if (score === bestScore) {
                bestMoves.push(move);
            }
        }
    }

    const chosen = bestMoves[Math.floor(Math.random() * bestMoves.length)] ?? null;
    return { score: bestScore, move: chosen };
}

export function getBotMove(board: Board): number | null {
    if (getWinner(board)) return null;
    const { move } = minimax(board, true);
    return move;
}