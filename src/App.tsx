import { FC, memo, useEffect, useRef, useState } from "react";
import "./App.css";

const COLUMNS = 200;
const ROWS = 200;

const globalMap: number[][] = Array.from(Array(ROWS).fill(Array.from(Array(COLUMNS)).fill(0)));

const mapUtils = (mapObj: number[][]) => {
  const leftTop = (row: number, column: number): boolean => !!mapObj[row - 1]?.[column - 1];
  const top = (row: number, column: number): boolean => !!mapObj[row - 1]?.[column];
  const rightTop = (row: number, column: number): boolean => !!mapObj[row - 1]?.[column + 1];

  const right = (row: number, column: number): boolean => !!mapObj[row]?.[column + 1];
  const bottomRight = (row: number, column: number): boolean => !!mapObj[row + 1]?.[column + 1];
  const bottom = (row: number, column: number): boolean => !!mapObj[row + 1]?.[column];

  const bottomLeft = (row: number, column: number): boolean => !!mapObj[row + 1]?.[column - 1];
  const left = (row: number, column: number): boolean => !!mapObj[row]?.[column - 1];

  return {
    leftTop,
    top,
    rightTop,
    right,
    bottomRight,
    bottom,
    bottomLeft,
    left,
  };
};

function App() {
  const livedRef = useRef<Record<string, boolean>>({});
  const deadRef = useRef<Record<string, boolean>>({});
  const [map, setMap] = useState<number[][]>(globalMap);
  const mapRef = useRef(globalMap);

  const init = () => {
    const qwe = mapRef.current.map((row) => row.map(() => +(Math.random() < 0.4)));
    mapRef.current = qwe;
    setMap(mapRef.current);
  };

  const isLive = (row: number, column: number): boolean => {
    if (livedRef.current[`${row}_${column}`]) {
      return false;
    }

    const utils = mapUtils(mapRef.current);

    const numberOfNearest = Object.values(utils).reduce((acc, util) => {
      acc += +util(row, column);
      return acc;
    }, 0);

    return numberOfNearest > 3;
  };

  const isDead = (row: number, column: number): boolean => {
    if (deadRef.current[`${row}_${column}`]) {
      return false;
    }

    const utils = mapUtils(mapRef.current);

    const numberOfNearest = Object.values(utils).reduce((acc, util) => {
      acc += +util(row, column);
      return acc;
    }, 0);

    return numberOfNearest <= 1;
  };

  const liveUpdate = () => {
    livedRef.current = {};
    mapRef.current = mapRef.current.map((row, rowIndex) =>
      row.map((_, columnIndex) => {
        if (isLive(rowIndex, columnIndex)) {
          livedRef.current[`${rowIndex}_${columnIndex}`] = true;
          return 1;
        }
        return +isLive(rowIndex, columnIndex);
      })
    );
    setMap(mapRef.current);
  };

  const deathUpdate = () => {
    deadRef.current = {};
    mapRef.current = mapRef.current.map((row, rowIndex) =>
      row.map((cellVal, columnIndex) => {
        if (isDead(rowIndex, columnIndex)) {
          deadRef.current[`${rowIndex}_${columnIndex}`] = true;
          return 0;
        }
        return isDead(rowIndex, columnIndex) ? 0 : cellVal;
      })
    );

    setMap(mapRef.current);
  };

  useEffect(() => {
    init();

    const interval = setInterval(() => {
      livedRef.current = {};
      deadRef.current = {};
      liveUpdate();
      setTimeout(() => {
        deathUpdate();
      }, 500);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="App">
      <div className="playground">
        {map.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <div key={colIndex} className={cell ? "cell cell-live" : "cell"} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
