// PIECES IMAGES
export const pieces = {
  black: {
    king: "/pieces/king.png",
    queen: "/pieces/queen.png",
    rook: "/pieces/rook.png",
    bishop: "/pieces/bishop.png",
    knight: "/pieces/knight.png",
    pawn: "/pieces/pawn.png",
  },
  white: {
    king: "/pieces/wking.png",
    queen: "/pieces/wqueen.png",
    rook: "/pieces/wrook.png",
    bishop: "/pieces/wbishop.png",
    knight: "/pieces/wknight.png",
    pawn: "/pieces/wpawn.png",
  },
};

// CREATE PIECE
export const createPiece = (type, color) => ({
  type,
  color,
  hasMoved: false,
});

// BOARD SETUP
export const startBoard = [
  createPiece("rook", "black"),
  createPiece("knight", "black"),
  createPiece("bishop", "black"),
  createPiece("queen", "black"),
  createPiece("king", "black"),
  createPiece("bishop", "black"),
  createPiece("knight", "black"),
  createPiece("rook", "black"),

  ...Array(8)
    .fill(null)
    .map(() => createPiece("pawn", "black")),
  ...Array(32).fill(null),

  ...Array(8)
    .fill(null)
    .map(() => createPiece("pawn", "white")),

  createPiece("rook", "white"),
  createPiece("knight", "white"),
  createPiece("bishop", "white"),
  createPiece("queen", "white"),
  createPiece("king", "white"),
  createPiece("bishop", "white"),
  createPiece("knight", "white"),
  createPiece("rook", "white"),
];

// HELPERS
export const getRow = (i) => Math.floor(i / 8);
export const getCol = (i) => i % 8;

export const clone = (b) => b.map((p) => (p ? { ...p } : null));

// PATH CHECK
export const pathClear = (from, to, b) => {
  const fr = getRow(from),
    fc = getCol(from);
  const tr = getRow(to),
    tc = getCol(to);

  const dr = Math.sign(tr - fr);
  const dc = Math.sign(tc - fc);

  let r = fr + dr;
  let c = fc + dc;

  while (r !== tr || c !== tc) {
    if (b[r * 8 + c]) return false;
    r += dr;
    c += dc;
  }
  return true;
};

// ATTACK LOGIC
export const canAttackSquare = (piece, from, to, b) => {
  if (!piece || to === -1) return false;

  const fr = getRow(from),
    fc = getCol(from);
  const tr = getRow(to),
    tc = getCol(to);

  const dr = tr - fr;
  const dc = tc - fc;

  switch (piece.type) {
    case "pawn": {
      const dir = piece.color === "white" ? -1 : 1;
      return Math.abs(dc) === 1 && dr === dir;
    }

    case "rook":
      return (dr === 0 || dc === 0) && pathClear(from, to, b);

    case "bishop":
      return Math.abs(dr) === Math.abs(dc) && pathClear(from, to, b);

    case "queen":
      return (
        (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) &&
        pathClear(from, to, b)
      );

    case "knight":
      return (
        (Math.abs(dr) === 2 && Math.abs(dc) === 1) ||
        (Math.abs(dr) === 1 && Math.abs(dc) === 2)
      );

    case "king":
      return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;

    default:
      return false;
  }
};

// MOVE FUNCTION (UPDATED PROMOTION)
export const move = (from, to, b, promotionChoice = null) => {
  const newBoard = clone(b);
  const piece = newBoard[from];

  if (!piece) return newBoard;

  const fromRow = getRow(from);
  const fromCol = getCol(from);
  const toRow = getRow(to);
  const toCol = getCol(to);

  // CASTLING
  if (piece.type === "king" && Math.abs(fromCol - toCol) === 2) {
    if (toCol === 6) {
      const rookFrom = fromRow * 8 + 7;
      const rookTo = fromRow * 8 + 5;

      newBoard[rookTo] = { ...newBoard[rookFrom], hasMoved: true };
      newBoard[rookFrom] = null;
    }

    if (toCol === 2) {
      const rookFrom = fromRow * 8;
      const rookTo = fromRow * 8 + 3;

      newBoard[rookTo] = { ...newBoard[rookFrom], hasMoved: true };
      newBoard[rookFrom] = null;
    }
  }

  // NORMAL MOVE
  newBoard[to] = { ...piece, hasMoved: true };
  newBoard[from] = null;

  const isPromotion = piece.type === "pawn" && (toRow === 0 || toRow === 7);

  const validChoices = ["queen", "rook", "bishop", "knight"];

  const finalChoice =
    promotionChoice && validChoices.includes(promotionChoice)
      ? promotionChoice
      : "queen";

  if (isPromotion) {
    newBoard[to] = {
      ...newBoard[to],
      type: finalChoice,
      hasMoved: true,
    };
  }

  return newBoard;
};

export const isValidMove = (piece, from, to, b) => {
  if (!piece) return false;

  const target = b[to];
  if (target && target.color === piece.color) return false;

  const fr = getRow(from),
    fc = getCol(from);
  const tr = getRow(to),
    tc = getCol(to);

  const dr = tr - fr;
  const dc = tc - fc;

  switch (piece.type) {
    case "pawn": {
      const dir = piece.color === "white" ? -1 : 1;
      const startRow = piece.color === "white" ? 6 : 1;

      const oneStep = from + dir * 8;
      const twoStep = from + dir * 16;

      if (to === oneStep && !b[to]) return true;

      if (fr === startRow && to === twoStep && !b[oneStep] && !b[to])
        return true;

      if (
        Math.abs(dc) === 1 &&
        to === oneStep + dc &&
        target &&
        target.color !== piece.color
      )
        return true;

      return false;
    }

    case "rook":
      return (dr === 0 || dc === 0) && pathClear(from, to, b);

    case "bishop":
      return Math.abs(dr) === Math.abs(dc) && pathClear(from, to, b);

    case "queen":
      return (
        (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) &&
        pathClear(from, to, b)
      );

    case "knight":
      return (
        (Math.abs(dr) === 2 && Math.abs(dc) === 1) ||
        (Math.abs(dr) === 1 && Math.abs(dc) === 2)
      );

    case "king": {
      if (Math.abs(dr) <= 1 && Math.abs(dc) <= 1) return true;

      if (!piece.hasMoved && dr === 0 && Math.abs(dc) === 2) {
        const rookCol = dc > 0 ? 7 : 0;
        const rookIndex = fr * 8 + rookCol;
        const rook = b[rookIndex];

        if (
          rook &&
          rook.type === "rook" &&
          !rook.hasMoved &&
          pathClear(from, rookIndex, b)
        ) {
          return true;
        }
      }

      return false;
    }

    default:
      return false;
  }
};

export const findKing = (color, b) =>
  b.findIndex((p) => p?.type === "king" && p.color === color);

export const isInCheck = (color, b) => {
  const kingPos = findKing(color, b);

  return b.some((p, i) => {
    if (!p || p.color === color) return false;
    return canAttackSquare(p, i, kingPos, b);
  });
};

export const isLegalMove = (from, to, board) => {
  const piece = board[from];
  const temp = move(from, to, board);
  return !isInCheck(piece.color, temp);
};

export const hasAnyLegalMoves = (color, b) => {
  for (let from = 0; from < 64; from++) {
    const piece = b[from];
    if (!piece || piece.color !== color) continue;

    for (let to = 0; to < 64; to++) {
      if (
        isValidMove(piece, from, to, b) &&
        !isInCheck(color, move(from, to, b))
      ) {
        return true;
      }
    }
  }
  return false;
};

export const insufficientPiece = (board) => {
  const existPieces = board.filter((p) => p !== null);

  return (
    existPieces.length === 2 && existPieces.every((p) => p.type === "king")
  );
};
// Game status
export const getGameStatus = (color, b) => {
  const check = isInCheck(color, b);
  const moves = hasAnyLegalMoves(color, b);

  if (check && !moves) return "checkmate";
  if (!check && !moves) return "stalemate";
  if (insufficientPiece(b)) return "stalemate";

  return "playing";
};

// Possible Moves
export const getPossibleMoves = (from, board) => {
  const piece = board[from];
  if (!piece) return [];

  const moves = [];

  for (let t = 0; t < 64; t++) {
    if (isValidMove(piece, from, t, board) && isLegalMove(from, t, board)) {
      moves.push(t);
    }
  }

  return moves;
};

// Move Count
export const getColorMoveCount = (color, board) => {
  let count = 0;

  for (let from = 0; from < 64; from++) {
    const piece = board[from];

    if (!piece || piece.color !== color) continue;

    count = count + getPossibleMoves(from, board).length;
  }

  return count;
};

// Stats
export const getMoveStats = (board) => {
  const whiteMoves = getColorMoveCount("white", board);
  const blackMoves = getColorMoveCount("black", board);

  return {
    whiteMoves,
    blackMoves,
    totalMoves: whiteMoves + blackMoves,
  };
};
