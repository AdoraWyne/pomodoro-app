import { useEffect, useReducer } from "react";
import "./App.css";

interface State {
  end: number;
  now: number;
  pause: boolean;
  pauseTime: number;
}

type Action = "start" | "running" | "pause" | "reset" | "skip" | "finish";

function reducer(state: State, action: Action): State {
  switch (action) {
    case "start": {
      const currentTime = Date.now();
      const pausedFor =
        state.pauseTime === 0 ? currentTime : currentTime - state.pauseTime;

      return {
        ...state,
        end: state.end + pausedFor,
        now: currentTime,
        pause: false,
        pauseTime: 0,
      };
    }
    case "running":
      return { ...state, now: Date.now() };
    case "pause":
      return {
        ...state,
        pauseTime: Date.now(),
        pause: true,
      };
    case "reset":
      return {
        ...state,
        end: 5_000,
        now: 0,
        pause: true,
        pauseTime: 0,
      };
    case "skip":
      return {
        ...state,
        end: 5_000,
        now: state.end,
        pause: true,
        pauseTime: 0,
      };
    case "finish":
      return { ...state, pause: true };
  }
}

const formatter = (n: number) => String(n).padStart(2, "0");
const transformedTimer = (second: number) => {
  return `${formatter(Math.floor(second / 60))}:${formatter(second % 60)}`;
};

function App() {
  const [state, dispatch] = useReducer(reducer, {
    now: 0,
    end: 5_000,
    pause: true,
    pauseTime: 0,
  });

  const remainingSeconds = (state.end - state.now) / 1000;
  const isRunning = remainingSeconds > 0;
  const second = Math.ceil(Math.max(0, state.end - state.now) / 1000);

  useEffect(() => {
    if (state.pause) return;
    if (!isRunning) {
      dispatch("finish");
      return;
    }

    const secondTimer = setInterval(() => {
      dispatch("running");
    }, 100);

    return () => clearInterval(secondTimer);
  }, [isRunning, state.pause]);

  return (
    <>
      <h1>Pomodoro App</h1>
      <p>{transformedTimer(second)}</p>
      <button onClick={() => dispatch(state.pause ? "start" : "pause")}>
        {state.pause ? "Start" : "Pause"}
      </button>
      <button onClick={() => dispatch("skip")}>Skip</button>
      <button onClick={() => dispatch("reset")}>Reset</button>
    </>
  );
}

export default App;
