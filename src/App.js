/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// IMPORTAR LAS IMÁGENES
import maillotAmarillo from './images/maillot-amarillo.jpg';
import maillotVerde from './images/maillot-verde.jpg';
import maillotLunares from './images/maillot-lunares.jpg';
import maillotBlanco from './images/maillot-blanco.jpg';
import trofeo from './images/trofeo.jpeg';
import bicicleta from './images/bicicleta.jpg';
import montana from './images/montana.jpg';
import logo from './images/logo.png';
import campeon from './images/campeon.jpg';

function App() {
  // Mapeo de números a imágenes del Tour
  const imageMap = {
    1: maillotAmarillo,
    2: maillotVerde,
    3: maillotLunares,
    4: maillotBlanco,
    5: trofeo,
    6: bicicleta,
    7: montana,
    8: logo,
    9: campeon
  };

  // Nombres para la leyenda
  const imageNames = {
    1: 'Maillot Amarillo',
    2: 'Maillot Verde',
    3: 'Maillot Lunares',
    4: 'Maillot Blanco',
    5: 'Trofeo',
    6: 'Bicicleta',
    7: 'Montaña',
    8: 'Logo',
    9: 'Último Campeón'
  };

  // Tablero solución
  const solvedBoard = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9]
  ];

  // Estados del juego
  const [board, setBoard] = useState([]);
  const [initialBoard, setInitialBoard] = useState([]);
  const [errors, setErrors] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [time, setTime] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [errorCells, setErrorCells] = useState({});
  const [showVictoryModal, setShowVictoryModal] = useState(false); // Nuevo estado para el modal
  
  const timerRef = useRef(null);

  // Función para generar un puzzle
  const generatePuzzle = () => {
    const puzzle = solvedBoard.map(row => [...row]);
    for (let i = 0; i < 40; i++) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      puzzle[row][col] = null;
    }
    return puzzle;
  };

  // Inicializar juego
  const initGame = () => {
    const newPuzzle = generatePuzzle();
    setBoard(newPuzzle);
    setInitialBoard(newPuzzle.map(row => [...row]));
    setErrors(0);
    setTime(0);
    setGameStarted(false);
    setGameCompleted(false);
    setErrorCells({});
    setShowVictoryModal(false);
    stopTimer();
  };

  // Temporizador
  const startTimer = () => {
    if (!gameStarted && !gameCompleted) {
      setGameStarted(true);
      timerRef.current = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setGameStarted(false);
  };

  // Formatear tiempo (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Contar celdas vacías
  const countEmptyCells = () => {
    return board.flat().filter(cell => cell === null).length;
  };

  // Verificar si una celda es correcta
  const isCellCorrect = (row, col, value) => {
    if (value === null || value === undefined) return true;
    return value === solvedBoard[row][col];
  };

  // Verificar errores en todo el tablero
  const checkAllErrors = () => {
    const newErrorCells = {};
    let errorCount = 0;
    
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const value = board[i][j];
        if (value !== null && !isCellCorrect(i, j, value) && initialBoard[i][j] === null) {
          newErrorCells[`${i}-${j}`] = true;
          errorCount++;
        }
      }
    }
    
    setErrorCells(newErrorCells);
    return errorCount;
  };

  // Manejar cambio en las celdas
  const handleCellChange = (row, col, value) => {
    if (initialBoard[row][col] !== null || gameCompleted) return;

    if (!gameStarted && !gameCompleted) {
      startTimer();
    }

    const newBoard = board.map(row => [...row]);
    const oldValue = newBoard[row][col];
    
    if (value === '') {
      newBoard[row][col] = null;
    } else {
      let numValue = null;
      if (!isNaN(value) && value >= 1 && value <= 9) {
        numValue = parseInt(value);
      } else {
        for (let [num, name] of Object.entries(imageNames)) {
          if (name.toLowerCase().includes(value.toLowerCase())) {
            numValue = parseInt(num);
            break;
          }
        }
      }
      newBoard[row][col] = numValue;
    }
    
    setBoard(newBoard);

    const newValue = newBoard[row][col];
    if (newValue !== null && !isCellCorrect(row, col, newValue)) {
      if (oldValue === null || isCellCorrect(row, col, oldValue)) {
        setErrors(prev => prev + 1);
      }
    }

    setTimeout(() => {
      checkAllErrors();
    }, 0);
  };

  // Verificar si el tablero está completo - MODIFICADO para mostrar modal
  const checkBoard = () => {
    const currentErrors = checkAllErrors();
    
    let complete = true;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] === null || board[i][j] !== solvedBoard[i][j]) {
          complete = false;
          break;
        }
      }
    }
    
    if (complete && currentErrors === 0) {
      stopTimer();
      setGameCompleted(true);
      setShowVictoryModal(true); // Mostrar modal de victoria
    } else {
      alert(`Aún no está completo. Errores: ${currentErrors} ⚠️ Sigue pedaleando 🚴`);
    }
  };

  // Cerrar modal
  const closeVictoryModal = () => {
    setShowVictoryModal(false);
  };

  // Mostrar solución
  const solveBoard = () => {
    setBoard(solvedBoard.map(row => [...row]));
    setErrorCells({});
    if (!gameCompleted) {
      stopTimer();
    }
  };

  // Nuevo juego
  const newGame = () => {
    initGame();
  };

  // Efectos
  useEffect(() => {
    initGame();
    return () => stopTimer();
  }, []);

  useEffect(() => {
    if (gameStarted) {
      checkAllErrors();
    }
  }, [board]);

  // Renderizar una celda
  const renderCell = (row, col) => {
    const value = board[row][col];
    const isInitial = initialBoard[row][col] !== null;
    const hasError = errorCells[`${row}-${col}`];
    const isCorrect = value !== null && isCellCorrect(row, col, value);

    let cellClass = "cell";
    if (isInitial) cellClass += " initial";
    if (hasError && !isInitial) cellClass += " error";
    if (!hasError && value !== null && !isInitial && isCorrect) cellClass += " correct";

    if (isInitial) {
      return (
        <div className={cellClass} key={`${row}-${col}`}>
          <img 
            src={imageMap[value]} 
            alt={imageNames[value]}
            className="cell-image"
            title={imageNames[value]}
          />
        </div>
      );
    } else {
      return (
        <div className={cellClass} key={`${row}-${col}`}>
          {value ? (
            <img 
              src={imageMap[value]} 
              alt={imageNames[value]}
              className="cell-image"
              title={imageNames[value]}
              onClick={() => {
                const input = prompt('Ingresa el número (1-9) o nombre del elemento:', '');
                if (input) handleCellChange(row, col, input);
              }}
            />
          ) : (
            <button 
              className="cell-button"
              onClick={() => {
                const input = prompt('Ingresa el número (1-9) o nombre del elemento:', '');
                if (input) handleCellChange(row, col, input);
              }}
              title="Haz clic para agregar un elemento"
            >
              ?
            </button>
          )}
        </div>
      );
    }
  };

  return (
    <div className="app">
      <h1>🚴‍♂️ TOUR SUDOKU 🚴‍♀️</h1>
      <p>Llena el sudoku con elementos del Tour de Francia</p>
      
      {/* Panel de estadísticas */}
      <div className="stats-panel">
        <div className="stat-item">
          <span className="stat-label">⏱️ Tiempo</span>
          <span className="stat-value">{formatTime(time)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">❌ Errores</span>
          <span className="stat-value">{errors}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">⬜ Restantes</span>
          <span className="stat-value">{countEmptyCells()}</span>
        </div>
      </div>

      {/* Tablero de Sudoku */}
      <div className="sudoku-grid">
        {board.map((row, rowIndex) => (
          <div className="row" key={rowIndex}>
            {row.map((_, colIndex) => renderCell(rowIndex, colIndex))}
          </div>
        ))}
      </div>
      
      {/* Controles */}
      <div className="controls">
        <button onClick={newGame}>Nuevo Puzzle 🚴</button>
        <button onClick={checkBoard}>Verificar ✅</button>
        <button onClick={solveBoard}>Ver Solución 🔍</button>
      </div>
      
      {/* Leyenda de imágenes */}
      <div className="legend">
        <h3>Elementos del Tour de Francia:</h3>
        <div className="legend-items">
          {Object.entries(imageMap).map(([num, img]) => (
            <div key={num} className="legend-item">
              <img src={img} alt={imageNames[num]} className="legend-image" />
              <span>{imageNames[num]}</span>
              <small>({num})</small>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DE VICTORIA - con imagen del trofeo */}
      {showVictoryModal && (
        <div className="modal-overlay" onClick={closeVictoryModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeVictoryModal}>×</button>
            
            <div className="modal-header">
              <h2>🏆 ¡CAMPEÓN! 🏆</h2>
            </div>
            
            <div className="modal-body">
              <img 
                src={trofeo} 
                alt="Trofeo del Tour de Francia" 
                className="modal-trophy"
              />
              
              <div className="victory-stats">
                <p className="victory-message-large">
                  ¡FELICIDADES!
                </p>
                <p className="victory-message-sub">
                  Has completado el Tour Sudoku
                </p>
                <div className="victory-details">
                  <div className="victory-stat">
                    <span>⏱️ Tiempo</span>
                    <strong>{formatTime(time)}</strong>
                  </div>
                  <div className="victory-stat">
                    <span>❌ Errores</span>
                    <strong>{errors}</strong>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="modal-button" onClick={newGame}>
                Nuevo Juego 🚴
              </button>
              <button className="modal-button secondary" onClick={closeVictoryModal}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;