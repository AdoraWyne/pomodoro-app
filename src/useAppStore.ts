import { useReducer } from "react";
import { INITIAL_SECONDS } from "./constants";

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
        end: INITIAL_SECONDS,
        now: 0,
        pause: true,
        pauseTime: 0,
      };
    case "skip":
      return {
        end: INITIAL_SECONDS,
        now: state.end,
        pause: true,
        pauseTime: 0,
      };
    case "finish":
      return { ...state, pause: true };
  }
}

const useAppStore = () => {
  const [state, dispatch] = useReducer(reducer, {
    now: 0,
    end: INITIAL_SECONDS,
    pause: true,
    pauseTime: 0,
  });

  const remainingSeconds = (state.end - state.now) / 1000;
  const isRunning = remainingSeconds > 0;
  const seconds = Math.ceil(Math.max(0, state.end - state.now) / 1000);

  return {
    seconds,
    isPaused: state.pause,
    isRunning: isRunning,
    start: () => dispatch("start"),
    finish: () => dispatch("finish"),
    running: () => dispatch("running"),
    skip: () => dispatch("skip"),
    reset: () => dispatch("reset"),
    pause: () => dispatch("pause"),
  };
};

export default useAppStore;
