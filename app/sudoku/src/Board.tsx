import { ReactElement } from 'react';
import './Board.css';

type Size = 9 | 16 | 25

interface BoardProps {
  size: Size
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
  return <div className={`cell ${props.extraClassNames}`}>1</div>
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