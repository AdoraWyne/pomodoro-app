import { useEffect, useState } from "react";
import "./App.css";

const formatter = (n: number) => String(n).padStart(2, "0");
const transformedTimer = (second: number) => {
  return `${formatter(Math.floor(second / 60))}:${formatter(second % 60)}`;
};

function App() {
  const [second, setSecond] = useState(5);

  useEffect(() => {
    if (second <= 0) return;

    const secondTimer = setInterval(() => {
      setSecond(second - 1);
    }, 1000);

    return () => clearInterval(secondTimer);
  }, [second]);

  return (
    <>
      <h1>Pomodoro App</h1>
      <p>{transformedTimer(second)}</p>
    </>
  );
}

export default App;
