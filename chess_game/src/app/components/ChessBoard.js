"use client";

import { useState, useEffect } from "react";
import "../styles/chess.css";

import { findBestMove } from "../lib/Bot/botLogic";

import {
  startBoard,
  pieces,
  move,
  getGameStatus,
  isValidMove,
  isLegalMove,
  getPossibleMoves,
  getMoveStats,
} from "../lib/chessLogic";

export default function ChessBoard() {
  const [board, setBoard] = useState(startBoard);
  const [selected, setSelected] = useState(null);
  const [turn, setTurn] = useState("white");
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [status, setStatus] = useState("playing");

  const [stats, setStats] = useState({
    whiteMoves: 0,
    blackMoves: 0,
    totalMoves: 0,
  });

  const updateStats = (b) => {
    setStats(getMoveStats(b));
  };

  const runBotMove = (currentBoard) => {
    const botMove = findBestMove(currentBoard, "black");

    if (!botMove) {
      setStatus(getGameStatus("black", currentBoard));
      return;
    }

    setTimeout(() => {
      setBoard((prevBoard) => {
        const updatedBoard = move(botMove.from, botMove.to, prevBoard);

        setTurn("white");
        setStatus(getGameStatus("white", updatedBoard));
        updateStats(updatedBoard);

        return updatedBoard;
      });
    }, 500);
  };

  const handleClick = (i) => {
    if (status !== "playing") return;
    if (turn !== "white") return;

    const piece = board[i];

    // select piece
    if (selected === null) {
      if (!piece || piece.color !== "white") return;

      setSelected(i);
      setPossibleMoves(getPossibleMoves(i, board));
      return;
    }

    // deselect
    if (selected === i) {
      setSelected(null);
      setPossibleMoves([]);
      return;
    }

    const selectedPiece = board[selected];

    // switch selection
    if (piece && piece.color === "white") {
      setSelected(i);
      setPossibleMoves(getPossibleMoves(i, board));
      return;
    }

    if (!selectedPiece) return;

    // validate move
    if (!isValidMove(selectedPiece, selected, i, board)) return;
    if (!isLegalMove(selected, i, board)) return;

    setBoard((prevBoard) => {
      const updatedBoard = move(selected, i, prevBoard);

      setSelected(null);
      setPossibleMoves([]);
      setTurn("black");
      setStatus(getGameStatus("black", updatedBoard));
      updateStats(updatedBoard);

      setTimeout(() => {
        runBotMove(updatedBoard);
      }, 300);

      return updatedBoard;
    });
  };

  const img = (p) => (p ? pieces[p.color][p.type] : "");

  useEffect(() => {
    updateStats(startBoard);
  }, []);

  useEffect(() => {
    console.log("Move Stats:");
    console.log("White Moves:", stats.whiteMoves);
    console.log("Black Moves:", stats.blackMoves);
    console.log("Total Moves:", stats.totalMoves);
  }, [stats]);

  return (
    <div className="chess-container">
      <h2 className="status">
        {status === "playing" && `Turn: ${turn}`}
        {status === "checkmate" &&
          `Checkmate! ${turn === "white" ? "Black" : "White"} wins`}
        {status === "stalemate" && "Draw (Stalemate)"}
      </h2>

      <div className="board">
        {board.map((p, i) => {
          const row = Math.floor(i / 8);
          const col = i % 8;
          const light = (row + col) % 2 === 0;

          return (
            <div
              key={i}
              className={`square ${light ? "light" : "dark"}`}
              onClick={() => handleClick(i)}
            >
              {p && <img src={img(p)} className="piece" alt="" />}
              {possibleMoves.includes(i) && <div className="dot" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
