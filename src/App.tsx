import { useEffect, useState } from "react";
import "./App.css";

const formatter = (n: number) => String(n).padStart(2, "0");
const transformedTimer = (second: number) => {
  return `${formatter(Math.floor(second / 60))}:${formatter(second % 60)}`;
};

function App() {
  const [now, setNow] = useState(0); // constantly moving
  const [end, setEnd] = useState(60_000); // fixed
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

  const handleSkip = () => {
    setNow(end);
    setEnd(60_000);
    setPause(true);
    setPauseTime(0);
  };

  const handleReset = () => {
    setNow(0);
    setEnd(60_000);
    setPause(true);
    setPauseTime(0);
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
      <button onClick={handlePause}>{pause ? "Start" : "Pause"}</button>
      <button onClick={handleSkip}>Skip</button>
      <button onClick={handleReset}>Reset</button>
    </>
  );
}

export default App;
