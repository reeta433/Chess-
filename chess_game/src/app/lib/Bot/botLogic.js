import {
  move,
  getPossibleMoves,
  isInCheck,
  getGameStatus,
} from "../chessLogic";

const values = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000,
};

function enemy(color) {
  return color === "white" ? "black" : "white";
}

function getAllMoves(color, board) {
  const moves = [];

  for (let from = 0; from < 64; from++) {
    const piece = board[from];

    if (!piece || piece.color !== color) continue;

    const legal = getPossibleMoves(from, board);

    for (const to of legal) {
      moves.push({ from, to });
    }
  }

  return moves;
}

function evaluate(board, botColor) {
  let score = 0;

  for (let i = 0; i < 64; i++) {
    const piece = board[i];
    if (!piece) continue;

    let val = values[piece.type] || 0;

    if ([27, 28, 35, 36].includes(i)) val = val + 20;

    if (piece.color === botColor) score = score + val;
    else score = score - val;
  }

  // King Check Condition
  if (isInCheck(enemy(botColor), board)) score = score + 50;
  if (isInCheck(botColor, board)) score = score - 50;

  return score;
}

function minimax(board, depth, alpha, beta, maximizing, turnColor, botColor) {
  if (depth === 0) {
    return evaluate(board, botColor);
  }

  const status = getGameStatus(turnColor, board);

  if (status === "checkmate") {
    return maximizing ? -999999 : 999999;
  }

  if (status === "stalemate") {
    const checkScore = evaluate(board, botColor);
    if (checkScore > 200) return -500;

    if (checkScore < -200) return 500;

    return 0;
  }

  const moves = getAllMoves(turnColor, board);

  if (maximizing) {
    let best = -Infinity;

    for (const m of moves) {
      const newBoard = move(m.from, m.to, board);

      const score = minimax(
        newBoard,
        depth - 1,
        alpha,
        beta,
        false,
        enemy(turnColor),
        botColor,
      );

      best = Math.max(best, score);
      alpha = Math.max(alpha, score);

      if (beta <= alpha) break;
    }

    return best;
  } else {
    let best = Infinity;

    for (const m of moves) {
      const newBoard = move(m.from, m.to, board);

      const score = minimax(
        newBoard,
        depth - 1,
        alpha,
        beta,
        true,
        enemy(turnColor),
        botColor,
      );

      best = Math.min(best, score);
      beta = Math.min(beta, score);

      if (beta <= alpha) break;
    }

    return best;
  }
}

export function findBestMove(board, botColor) {
  const moves = getAllMoves(botColor, board);

  if (moves.length === 0) return null;

  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const m of moves) {
    const newBoard = move(m.from, m.to, board);

    const score = minimax(
      newBoard,
      3,
      -Infinity,
      Infinity,
      false,
      enemy(botColor),
      botColor,
    );

    if (score > bestScore) {
      bestScore = score;
      bestMove = m;
    }
  }

  return bestMove;
}
