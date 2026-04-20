import { useEffect, useState } from "react";
import "./App.css";

const formatter = (n: number) => String(n).padStart(2, "0");
const transformedTimer = (second: number) => {
  return `${formatter(Math.floor(second / 60))}:${formatter(second % 60)}`;
};

function App() {
  const [now, setNow] = useState(0); // constantly moving
  const [end, setEnd] = useState(60_000); // fixed , use useEnd when reset
  const [pause, setPause] = useState(true);
  const [pauseTime, setPauseTime] = useState(0);

  const remainingSeconds = (end - now) / 1000;
  const isRunning = remainingSeconds > 0;
  const second = Math.ceil(Math.max(0, end - now) / 1000);

  const handlePause = () => {
    if (!pause) {
      // going into pause state
      setPauseTime(Date.now());
    } else {
      // going into start state
      if (pauseTime === 0) {
        const currentTime = Date.now();
        setNow(currentTime);
        setEnd((prev) => prev + currentTime);
      } else {
        const currentTime = Date.now();
        const pausedFor = currentTime - pauseTime;
        setNow(currentTime);
        setEnd((prev) => prev + pausedFor);
      }
    }

    setPause(!pause);
  };

  const handleReset = () => {
    const currentTime = Date.now();
    setNow(currentTime);
    setEnd(currentTime + 60_000);
    setPause(false);
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
      <button onClick={handleReset}>Reset</button>
    </>
  );
}

export default App;
