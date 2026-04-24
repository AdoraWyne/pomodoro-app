import "./App.css";
import useAppStore from "./useAppStore";
import type { Phase } from "./useAppStore";

const formatter = (n: number) => String(n).padStart(2, "0");
const transformedTimer = (seconds: number) => {
  return `${formatter(Math.floor(seconds / 60))}:${formatter(seconds % 60)}`;
};

const getPhaseStatement = (phase: Phase): string => {
  switch (phase) {
    case "focus":
      return "(focus time)";
    case "break":
      return "(short break)";
    case "long break":
      return "(long break)";
    default:
      return "";
  }
};

function App() {
  const { phase, focusSessions, seconds, isPaused, start, pause, reset, skip } =
    useAppStore();

  return (
    <>
      <h1>Pomodoro App</h1>
      <p className="session-info">
        Focus Session: {focusSessions} <span>{getPhaseStatement(phase)}</span>
      </p>
      <div className="timer-container">
        <p className="timer-display">{transformedTimer(seconds)}</p>
        <div className="button-group">
          <button onClick={() => skip()}>Skip</button>
          <button onClick={() => (isPaused ? start() : pause())}>
            {isPaused ? "Start" : "Pause"}
          </button>
          <button onClick={() => reset()}>Reset</button>
        </div>
      </div>
    </>
  );
}

export default App;
