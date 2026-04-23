import { useEffect, useReducer } from "react";
import { FOCUS_SECONDS, BREAK_SECONDS, LONG_BREAK_SECONDS } from "./constants";

export type Phase = "idle" | "focus" | "break" | "long break";

interface State {
  end: number;
  now: number;
  pause: boolean;
  pauseTime: number;
  phase: Phase;
  focusSessions: number;
}

type Action = "start" | "running" | "pause" | "reset" | "skip" | "finish";

function getPhaseSeconds(phase: State["phase"]): number {
  switch (phase) {
    case "focus":
      return FOCUS_SECONDS;
    case "break":
      return BREAK_SECONDS;
    case "long break":
      return LONG_BREAK_SECONDS;
    case "idle":
      return FOCUS_SECONDS;
  }
}

function reducer(state: State, action: Action): State {
  switch (action) {
    case "start": {
      const currentTime = Date.now();
      const isFreshStart = state.pauseTime === 0;

      if (isFreshStart) {
        return {
          end: state.end + currentTime,
          now: currentTime,
          pause: false,
          pauseTime: 0,
          phase: "focus",
          focusSessions: 1,
        };
      }

      return {
        end: state.end + (currentTime - state.pauseTime),
        now: currentTime,
        pause: false,
        pauseTime: 0,
        phase: state.phase,
        focusSessions: state.focusSessions,
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
    case "reset": {
      if (state.phase === "idle") return state;

      const currentTime = Date.now();
      return {
        ...state,
        end: currentTime + getPhaseSeconds(state.phase),
        now: currentTime,
        pause: false,
        pauseTime: 0,
      };
    }
    case "skip":
      return reducer(state, "finish");
    case "finish": {
      const currentTime = Date.now();

      if (state.phase === "focus") {
        return {
          ...state,
          now: currentTime,
          end: currentTime + BREAK_SECONDS,
          pause: false,
          pauseTime: 0,
          phase: "break",
        };
      }
      if (state.phase === "break" && state.focusSessions < 4) {
        return {
          now: currentTime,
          end: currentTime + FOCUS_SECONDS,
          pause: false,
          pauseTime: 0,
          phase: "focus",
          focusSessions: state.focusSessions + 1,
        };
      }
      if (state.phase === "break" && state.focusSessions >= 4) {
        return {
          ...state,
          now: currentTime,
          end: currentTime + LONG_BREAK_SECONDS,
          pause: false,
          pauseTime: 0,
          phase: "long break",
        };
      }
      return {
        now: 0,
        end: FOCUS_SECONDS,
        pause: true,
        pauseTime: 0,
        phase: "idle",
        focusSessions: 0,
      };
    }
  }
}

const useAppStore = () => {
  const [state, dispatch] = useReducer(reducer, {
    now: 0,
    end: FOCUS_SECONDS,
    pause: true,
    pauseTime: 0,
    phase: "idle",
    focusSessions: 0,
  });

  const remainingSeconds = (state.end - state.now) / 1000;
  const isRunning = remainingSeconds > 0;
  const seconds = Math.ceil(Math.max(0, state.end - state.now) / 1000);

  // local references so names are standardised
  const isPaused = state.pause;
  const running = () => dispatch("running");
  const finish = () => dispatch("finish");

  useEffect(() => {
    if (isPaused) return;
    if (!isRunning) {
      const timeout = setTimeout(() => finish(), 1000);
      return () => clearTimeout(timeout);
    }

    const secondTimer = setInterval(() => {
      running();
    }, 100);

    return () => clearInterval(secondTimer);
  }, [isPaused, isRunning]);

  return {
    phase: state.phase,
    focusSessions: state.focusSessions,
    seconds,
    isPaused,
    start: () => dispatch("start"),
    pause: () => dispatch("pause"),
    skip: () => dispatch("skip"),
    reset: () => dispatch("reset"),
  };
};

export default useAppStore;
