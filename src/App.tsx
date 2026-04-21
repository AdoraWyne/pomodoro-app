import { useEffect, useReducer } from "react";
import "./App.css";

interface State {
  end: number;
  now: number;
  pause: boolean;
  pauseTime: number;
}

type Action = "running" | "pause" | "reset" | "skip" | "finish";

function reducer(state: State, action: Action): State {
  switch (action) {
    case "running":
      return { ...state, now: Date.now() };
    case "pause":
      if (!state.pause) {
        return {
          ...state,
          pauseTime: Date.now(),
          pause: !state.pause,
        };
      } else {
        if (state.pauseTime === 0) {
          const currentTime = Date.now();
          return {
            ...state,
            now: currentTime,
            end: state.end + currentTime,
            pause: !state.pause,
          };
        } else {
          const currentTime = Date.now();
          const pausedFor = currentTime - state.pauseTime;
          return {
            ...state,
            now: currentTime,
            end: state.end + pausedFor,
            pause: !state.pause,
          };
        }
      }
    case "reset":
      return {
        ...state,
        now: 0,
        end: 5_000,
        pause: true,
        pauseTime: 0,
      };
    case "skip":
      return {
        ...state,
        now: state.end,
        end: 5_000,
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
      <button onClick={() => dispatch("pause")}>
        {state.pause ? "Start" : "Pause"}
      </button>
      <button onClick={() => dispatch("skip")}>Skip</button>
      <button onClick={() => dispatch("reset")}>Reset</button>
    </>
  );
}

export default App;
