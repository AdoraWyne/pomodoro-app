import "./App.css";
import useAppStore from "./useAppStore";

const formatter = (n: number) => String(n).padStart(2, "0");
const transformedTimer = (seconds: number) => {
  return `${formatter(Math.floor(seconds / 60))}:${formatter(seconds % 60)}`;
};

function App() {
  const { seconds, isPaused, start, pause, reset, skip } = useAppStore();

  return (
    <>
      <h1>Pomodoro App</h1>
      <p>{transformedTimer(seconds)}</p>
      <button onClick={() => (isPaused ? start() : pause())}>
        {isPaused ? "Start" : "Pause"}
      </button>
      <button onClick={() => skip()}>Skip</button>
      <button onClick={() => reset()}>Reset</button>
    </>
  );
}

export default App;
