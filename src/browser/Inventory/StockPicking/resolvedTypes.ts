import {
  StockPickingFindAllQuery,
  StockMoveFindByPickingIdQuery,
  StockMoveLineFindByStockMoveIdQuery
} from "./types";

type StockPickingsType = StockPickingFindAllQuery["pickings"]["edges"];
type StockPickingType = StockPickingsType[number];
type StockMovesType = StockMoveFindByPickingIdQuery["picking"]["stock_moves"]["edges"];
type StockMoveType = StockMovesType[number];
type StockMoveLinesType = StockMoveLineFindByStockMoveIdQuery["picking"]["stock_move"]["move_lines"]["edges"];
type StockMoveLineType = StockMoveLinesType[number];

export { StockPickingType, StockPickingsType, StockMovesType, StockMoveType, StockMoveLinesType, StockMoveLineType };
