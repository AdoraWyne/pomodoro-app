import { useEffect, useState } from "react";
import "./App.css";

const formatter = (n: number) => String(n).padStart(2, "0");
const transformedTimer = (second: number) => {
  return `${formatter(Math.floor(second / 60))}:${formatter(second % 60)}`;
};

function App() {
  const [now, setNow] = useState(() => Date.now()); // constantly moving
  const [end, setEnd] = useState(() => Date.now() + 60_000); // fixed , use useEnd when reset
  const [pause, setPause] = useState(false);

  const remainingSeconds = (end - now) / 1000;
  const isRunning = remainingSeconds > 0;
  const second = Math.ceil(Math.max(0, end - now) / 1000);

  const handlePause = () => {
    setPause(!pause);
  };

  useEffect(() => {
    if (!isRunning || pause) return;

    const secondTimer = setInterval(() => {
      setNow(Date.now());
    }, 100);

    return () => clearInterval(secondTimer);
  }, [isRunning, pause]);

  return (
    <>
      <h1>Pomodoro App</h1>
      <p>{transformedTimer(second)}</p>
      <button onClick={handlePause}>Pause</button>
    </>
  );
}

export default App;
