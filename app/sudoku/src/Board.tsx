import { ReactElement } from 'react';
import './Board.css';

type Size = 9 | 16 | 25

interface BoardProps {
  size: Size
}

function getAvailableChars(size: Size): string[] {
  return '123456789abcdefghijklmnopqrstuvwxyz'
    .substring(0, size)
    .split('');
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values_inclusive
function getRandomIntInclusive(min: number, max: number): number {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

function getRandomChar(chars: string[]): string {
  return chars[getRandomIntInclusive(0, chars.length - 1)];
}

interface Sortable {
  value: string
  sortIndex: number
}

function randomize(row: string[]): string[] {
  return [...row]
    .map<Sortable>((value) => ({ value, sortIndex: Math.random()}))
    .sort((a: Sortable, b: Sortable) => a.sortIndex - b.sortIndex)
    .map(value => value.value);
}

type GetReservedByColumn = (c: number) => string[]

function getReservedByColumn(table: string[][], index: number): string[] {
  return table.flatMap<string>((row) => row[index]);
}

type GetReservedByInnerBox = (c: number) => string[]

function getReservedByInnerBox(table: string[][], rowIndex: number, colIndex: number, box: Box): string[] {
  const boxRowStartIndex = rowIndex - (rowIndex % box.nthRow);
  const boxColStartIndex = colIndex - (colIndex % box.nthColumn);
  const taken = [];
  for (let i = rowIndex; i >= boxRowStartIndex; i--) {
    if (table[i] === undefined) {
      continue;
    }
    const endIndex =  i === rowIndex ? colIndex : boxColStartIndex + box.nthColumn;
    const takenByRow = table[i].slice(boxColStartIndex, endIndex);
    taken.push(...takenByRow);
  }
  return taken;
}

function reduce(taken: string[], available: string[]): string[] {
  return available.filter(a => !taken.includes(a));
}

function generateRow(size: Size, all: string[], getRecervedByColumn: GetReservedByColumn, getReservedByInnerBox: GetReservedByInnerBox): string[] {
  const row: string[] = [];
  while (row.length < size) {
    for (let c = 0; c < size; c++) {
      const available1 = reduce(row, all);
      const available2 = reduce(getRecervedByColumn(c), available1);
      const available3 = reduce(getReservedByInnerBox(c), available2);
      if (available3.length === 0) {
        console.log('Reset');
        row.length = 0;
        break;
      }
      const random = getRandomChar(available3);
      row.push(random);
    }
  }
  return row;
}

function generate(size: Size, box: Box): string[][] {
  const all = getAvailableChars(size);
  const table: string[][] = [];
  for (let r = 0; r < size; r++) {
    if (r === 0) {
      table.push(randomize(all));
      continue;
    }
    const _getReservedByColumn = (c: number) => getReservedByColumn(table, c);
    const _getReservedByInnerBox = (c: number) => getReservedByInnerBox(table, r, c, box);
    const row = generateRow(size, all, _getReservedByColumn, _getReservedByInnerBox);
    table.push(row);
  }
  return table;
}

interface Box {
  nthColumn: number
  nthRow: number
}

function getBoxProps(size: Size): Box {
  const sqrt = Math.sqrt(size);
  if (size % sqrt === 0) {
    return {
      nthColumn: sqrt,
      nthRow: sqrt,
    }
  }
  throw new Error('Not implemented!');
}

function getInnerBoxClasses(box: Box, rowIndex: number, columnIndex: number): string {
  const classes = [];
  if ((columnIndex + 1) % box.nthColumn === 0) {
    classes.push('bold-right');
  }
  if ((rowIndex + 1) % box.nthRow === 0) {
    classes.push('bold-bottom');
  }
  return classes.join(' ');
}

interface CellProps {
  extraClassNames: string
  value: string
}

function Cell(props: CellProps) {
  return <div className={`cell ${props.extraClassNames}`}>
    <input type='text' maxLength={1} value={props.value} />
  </div>
}

interface RowProps {
  columns: ReactElement[]
}

function Row(props: RowProps) {
  return <div className={`row`}>{props.columns}</div>
}

function Board({ size }: BoardProps) {
  const box = getBoxProps(size);
  const board: string[][] = generate(size, box);
  const rows: ReactElement[] = [];
  for (let i = 0; i < board.length; i++) {
    const columns: ReactElement[] = [];
    for (let j = 0; j < board[i].length; j++) {
      const classes = getInnerBoxClasses(box, i, j);
      columns.push(<Cell key={`${i}${j}`} extraClassNames={classes} value={board[i][j]} />)
    }
    rows.push(<Row key={i} columns={columns} />)
  }
  return (
    <div className="board">
      {rows}
    </div>
  );
}

export default Board;