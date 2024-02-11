import './App.css';
import Board from './Board';

function App() {
  return (
    <div className="app">
      <header className="app-header">Sudoku</header>
      <div>
        <Board size={16}></Board>
      </div>
    </div>
  );
}

export default App;