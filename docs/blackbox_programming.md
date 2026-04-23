# Blackbox Programming

According to [Wikipedia](https://en.wikipedia.org/wiki/Black_box), black box is:

> In science, computing, and engineering, a black box is a system which can be viewed in terms of its inputs and outputs (or transfer characteristics), without any knowledge of its internal workings.

My simple interpretation is abstraction. You hide the internal details behind a clean interface so users only interact through inputs and outputs — they don't need to know (or care) how it works inside.
And most likely you are already doing this daily.

Example:

- You unlock your smart phone, you don't really care about what mechanism to unlock your phone. All you care is you can unlock your phone to do your important daily dose of doom scrolling.
- The technology or method to unlock your phone is the black box in this case.

# In Practice

Let's look at this in practical way in my timer.

I successfully to build a basic, functional countdown timer. But I put everything in `App.tsx` - the store (states and actions, I got the concept from Redux) and presentation.
This is against one of my principles: separation of concerns!

My code:

```ts
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
        end: 5_000,
        now: 0,
        pause: true,
        pauseTime: 0,
      };
    case "skip":
      return {
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
const transformedTimer = (seconds: number) => {
  return `${formatter(Math.floor(seconds / 60))}:${formatter(seconds % 60)}`;
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
  const seconds = Math.ceil(Math.max(0, state.end - state.now) / 1000);

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
      <p>{transformedTimer(seconds)}</p>
      <button onClick={() => dispatch(state.pause ? "start" : "pause")}>
        {state.pause ? "Start" : "Pause"}
      </button>
      <button onClick={() => dispatch("skip")}>Skip</button>
      <button onClick={() => dispatch("reset")}>Reset</button>
    </>
  );
}

export default App;
```

# Refactor

The goal is to move the timer related logic (the store) out of `App.tsx` so `App.tsx` purely for taking info and do rendering.

Let's refactor this by moving the store into black box which I'll call it `useAppStore.ts`.

`useAppStore.ts`

```ts
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
```

My updated `App.tsx`:

```ts
import { useEffect } from "react";
import "./App.css";
import useAppStore from "./useAppStore";

const formatter = (n: number) => String(n).padStart(2, "0");
const transformedTimer = (seconds: number) => {
  return `${formatter(Math.floor(seconds / 60))}:${formatter(seconds % 60)}`;
};

function App() {
  const {
    seconds,
    isPaused,
    isRunning,
    start,
    running,
    pause,
    reset,
    skip,
    finish,
  } = useAppStore();

  useEffect(() => {
    if (isPaused) return;
    if (!isRunning) {
      finish();
      return;
    }

    const secondTimer = setInterval(() => {
      running();
    }, 100);

    return () => clearInterval(secondTimer);
  }, [isPaused, isRunning, running, finish]);

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
```

Okay the store logic is ALMOST gone in `App.tsx`. But wait... there is one more thing! The `useEffect`hook - because it is also responsible for the timer lifecycle -> calling "running" action to update the `now` time at least every 100ms.

Let's refactor it again.

`useAppStore.ts`

```ts
import { useEffect, useReducer } from "react";
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

  // local references so names are standardised
  const isPaused = state.pause;
  const running = () => dispatch("running");
  const finish = () => dispatch("finish");

  useEffect(() => {
    if (isPaused) return;
    if (!isRunning) {
      finish();
      return;
    }

    const secondTimer = setInterval(() => {
      running();
    }, 100);

    return () => clearInterval(secondTimer);
  }, [isPaused, isRunning]);

  return {
    seconds,
    isPaused,
    start: () => dispatch("start"),
    pause: () => dispatch("pause"),
    skip: () => dispatch("skip"),
    reset: () => dispatch("reset"),
  };
};

export default useAppStore;
```

So now `App.tsx` looks like this:

```ts
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
```

# Conclusion

useAppStore is now a blackbox to App.tsx.

Back to "My simple interpretation is abstraction. You hide the internal details behind a clean interface so users only interact through inputs and outputs — they don't need to know (or care) how it works inside."

- Timer lifecycle is the internal details - the black box.
- `useAppStore` is the clean interface
- `App` is the users

App.tsx does not need to know how the timer works, App just needs to know what to render and it calls `useAppStore()` to get the info it needs in order to render.

And the return value of `useAppStore` will be the contract/interface between the store and the App

**Separation of Concerns**

App.tsx only responsible for rendering and useAppStore.ts is responsible for the timer lifecycle, which adhere with separation of concerns.
