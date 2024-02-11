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

function getValuesByColumn(table: string[][], index: number): string[] {
  return table.flatMap<string>((row) => row[index]);
}

function reduce(taken: string[], available: string[]): string[] {
  return available.filter(a => !taken.includes(a));
}

function generate(size: Size): string[][] {
  const all = getAvailableChars(size);
  const table: string[][] = [];
  for (let r = 0; r < size; r++) {
    if (r === 0) {
      table.push(randomize(all));
      continue;
    }
    const row: string[] = [];
    for (let c = 0; c < size; c++) {
      const reduced1 = reduce(row, all);
      const reduced2 = reduce(getValuesByColumn(table, c), reduced1);
      const random = getRandomChar(reduced2);
      row.push(random);
    }
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

function getBoldedClass(box: Box, rowIndex: number, columnIndex: number): string {
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
}

function Cell(props: CellProps) {
  return <div className={`cell ${props.extraClassNames}`}>
    <input type='text' maxLength={1} />
  </div>
}

interface RowProps {
  columns: ReactElement[]
}

function Row(props: RowProps) {
  return <div className={`row`}>{props.columns}</div>
}

function Board({ size }: BoardProps) {
  const box = getBoxProps(size)
  const rows: ReactElement[] = [];
  for (let i = 0; i < size; i++) {
    const columns: ReactElement[] = [];
    for (let j = 0; j < size; j++) {
      const classes = getBoldedClass(box, i, j);
      columns.push(<Cell extraClassNames={classes} />)
    }
    rows.push(<Row columns={columns} />)
  }
  return (
    <div className="board">
      {rows}
    </div>
  );
}

export default Board;