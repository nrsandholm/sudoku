import { ChangeEvent, ReactElement, useState } from 'react';
import './Board.css';

const MAX_RETRY_COUNT = 10;

type Size = 4 | 6 | 9 | 12 | 16 | 20 | 25

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

interface InnerBox {
  columns: number
  rows: number
}

interface Dimensions {
  size: Size
  innerBox: InnerBox
}

function findDimensions(size: Size, denominator: number): Dimensions {
  if ((size / denominator) % 1 === 0) {
    const arr: number[] = [size / denominator, denominator];
    return {
      size: size,
      innerBox: {
        columns: Math.min(...arr),
        rows: Math.max(...arr),
      },
    }
  }
  return findDimensions(size, ++denominator);
}

function getDimensions(size: Size): Dimensions {
  const sqrt = Math.sqrt(size);
  if (size % sqrt === 0) {
    return {
      size: size,
      innerBox: {
        columns: sqrt,
        rows: sqrt,
      },
    }
  }
  return findDimensions(size, 3);
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

function getReservedByInnerBox(table: string[][], rowIndex: number, colIndex: number, box: InnerBox): string[] {
  const boxRowStartIndex = rowIndex - (rowIndex % box.rows);
  const boxColStartIndex = colIndex - (colIndex % box.columns);
  const taken = [];
  for (let i = rowIndex; i >= boxRowStartIndex; i--) {
    if (table[i] === undefined) {
      continue;
    }
    const endIndex =  i === rowIndex ? colIndex : boxColStartIndex + box.columns;
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
  let retryCount = 0;
  while (row.length < size && retryCount < MAX_RETRY_COUNT) {
    for (let c = 0; c < size; c++) {
      const available1 = reduce(row, all);
      const available2 = reduce(getRecervedByColumn(c), available1);
      const available3 = reduce(getReservedByInnerBox(c), available2);
      if (available3.length === 0) {
        console.log('Reset');
        row.length = 0;
        retryCount++;
        break;
      }
      const random = getRandomChar(available3);
      row.push(random);
    }
  }
  return row;
}

function generateBoard({ size, innerBox }: Dimensions): string[][] {
  const all = getAvailableChars(size);
  const table: string[][] = [];
  let retryCount = 0;
  while (table.length < size && retryCount < MAX_RETRY_COUNT) {
    const rowIndex = table.length;
    if (rowIndex === 0) {
      table.push(randomize(all));
      continue;
    }
    const _getReservedByColumn = (colIndex: number) => getReservedByColumn(table, colIndex);
    const _getReservedByInnerBox = (colIndex: number) => getReservedByInnerBox(table, rowIndex, colIndex, innerBox);
    const row = generateRow(size, all, _getReservedByColumn, _getReservedByInnerBox);
    if (row.length === 0) {
      retryCount++;
      table.pop();
    } else {
      retryCount--;
      table.push(row);
    }
  }
  if (table.length !== size) {
    window.alert('Sorry, wasn\'t able to generate a full sudoku board :(');
  }
  return table;
}

function getInnerBoxClasses(box: InnerBox, rowIndex: number, columnIndex: number): string {
  const classes = [];
  if ((columnIndex + 1) % box.columns === 0) {
    classes.push('bold-right');
  }
  if ((rowIndex + 1) % box.rows === 0) {
    classes.push('bold-bottom');
  }
  return classes.join(' ');
}

interface CellProps {
  extraClassNames: string
  correctValue: string
  hidden: boolean
  acceptedChars: string[]
}

function Cell(props: CellProps) {
  const [state, setState] = useState({
    value: props.hidden ? '' : props.correctValue
  });
  const handleChange = (input: ChangeEvent<HTMLInputElement>) => {
    setState((prevState) => {
      const value = input.target.value;
      if (!props.acceptedChars.includes(value)) {
        return { value: '' };
      }
      return { value: value };
    });
  };
  return <div className={`cell ${props.extraClassNames}`}>
    <input type='text' maxLength={1} value={state.value} disabled={!props.hidden} onChange={handleChange} />
  </div>
}

interface RowProps {
  columns: ReactElement[]
}

function Row(props: RowProps) {
  return <div className={`row`}>{props.columns}</div>
}

function Board({ size }: BoardProps) {
  const availableChars = getAvailableChars(size);
  const dimensions = getDimensions(size);
  const board: string[][] = generateBoard(dimensions);
  const rows: ReactElement[] = [];
  for (let i = 0; i < board.length; i++) {
    const columns: ReactElement[] = [];
    for (let j = 0; j < board[i].length; j++) {
      const hidden = Math.random() > 0.5 ? true : false;
      const classes = getInnerBoxClasses(dimensions.innerBox, i, j);
      columns.push(
        <Cell key={`row-${i}-cell-${j}`}
          extraClassNames={classes}
          correctValue={board[i][j]}
          hidden={hidden}
          acceptedChars={availableChars}
        />
      );
    }
    rows.push(<Row key={`row-${i}`} columns={columns} />)
  }
  return (
    <div className="board" key={`board-${size}`}>
      {rows}
    </div>
  );
}

export default Board;