import { useEffect, useState } from "react";
import "./App.css";

const formatter = (n: number) => String(n).padStart(2, "0");
const transformedTimer = (second: number) => {
  return `${formatter(Math.floor(second / 60))}:${formatter(second % 60)}`;
};

function App() {
  const [now, setNow] = useState(() => Date.now()); // constantly moving
  const [end, setEnd] = useState(() => Date.now() + 5000); // fixed , use useEnd when reset

  const remainingSeconds = (end - now) / 1000;
  const isRunning = remainingSeconds > 0;
  const second = Math.ceil(Math.max(0, end - now) / 1000);

  useEffect(() => {
    if (!isRunning) return;

    const secondTimer = setInterval(() => {
      setNow(Date.now());
    }, 100);

    return () => clearInterval(secondTimer);
  }, [isRunning]);

  return (
    <>
      <h1>Pomodoro App</h1>
      <p>{transformedTimer(second)}</p>
    </>
  );
}

export default App;
