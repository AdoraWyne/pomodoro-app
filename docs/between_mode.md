# Explain how to go between modes

After I have done my basic countdown timer, I got a feeling that I can just pass the focus seconds, break seconds and long break seconds to the countdown timer and let it does its thing.

Because, in each mode, the timer is doing the same thing.

But how do I let the timer know how to change between focus, break and long break?

---

# The General Flow

(1st cycle)

- 25mins focus time starts
- times up
- 5 mins break starts
- times up

(2nd cycle)

- 25mins focus time starts
- times up
- 5 mins break starts
- times up

(3rd cycle)

- 25mins focus time starts
- times up
- 5 mins break starts
- times up

(4th cycle)

- 25mins focus time starts
- times up
- 5 mins break starts
- times up

- 20mins long break starts
- then the timer will stop by itself and user can decide if they wanna a pomodoro cycle again.

**In pseudo code:**

In Pseudo Code:

- Total focusSessions = 4
- const focusSession = 0 // start with 0

1st session:

focusSession = 0 + 1 = 1

- focusSeconds starts counting down.
- when focusSeconds finished, breakSeconds starts kicking in and counting down.
- when breakSeconds finished, focusSession += 1, and focusSeconds starts kicking in and counting down.

2nd session:

focusSession = 1 + 1 = 2

- focusSeconds starts counting down from last step in 1st session.
- when focusSeconds finished, breakSeconds starts kicking in and counting down.
- when breakSeconds finished, focusSession += 1, and focusSeconds starts kicking in and counting down.

3rd session:

focusSession = 2 + 1 = 3

- focusSeconds starts counting down from last step in 2nd session.
- when focusSeconds finished, breakSeconds starts kicking in and counting down.
- when breakSeconds finished, focusSession += 1, and focusSeconds starts kicking in and counting down.

4th session:

focusSession = 3 + 1 = 4

- focusSeconds starts counting down from last step in 3rd session.
- when focusSeconds finished, breakSeconds starts kicking in and counting down.
- when breakSeconds finished, focusSession += 1.

When focusSession > 4:

- longBreakSeconds starts counting down.
- when longBreakSeconds <= 0, set focusSession back to 0

---

# Think about my states

Based on my pseudo, I know I need to intro `phase` and `focusSessions`.

Every time "finish" is fired, that means the current phase is finished and we enter next phase. So "finish" will do a lot of heavy lifting.

I will start with simple, just focus on `idle`, `start`, `finish`. With `phase` and `focusSessions` introduced, how do the states look like in each phase?

**Initial States:**

We always start with "idle" so the initial values for states:

```ts
{
    now: 0,
    end: FOCUS_SECONDS,
    pause: true,
    pauseTime: 0,
    phase: "idle",
    focusSession: 0
}
```

**"start" action:**

- if current phase is "idle" here, means we going to "focus"
- this will be the first start and state.pauseTime will be "0"
- the state will be:
  const currentTime = Date.now();
  const pausedFor =
  state.pauseTime === 0 ? currentTime : currentTime - state.pauseTime;

```ts
{
  now: currentTime,
  end: state.end + pausedFor, // initial `end` state is FOCUS_SECONDS so we just follow the state.end
  pause: false,
  pauseTime: 0,
  phase: "focus
  focusSessions: 1
}
```

- if current phase is not "idle", means this is on running timer, phase stays the same.
- state.pauseTime will not be "0"
- the state will be:
  const currentTime = Date.now();
  const pausedFor =
  state.pauseTime === 0 ? currentTime : currentTime - state.pauseTime;

```ts
{
  now: currentTime,
  end: state.end + pausedFor,
  pause: false,
  pauseTime: 0,
  phase: state.phase // follow the same
  focusSessions: state.focusSessions // follow the same
}
```

- so the only changes here in "start" action is `phase`
- if phase === "idle", then phase === "focus", otherwise stays the same,
- if phase === "idle", then focusSession === 1, otherwise stays the same,

**"finish" action:**

This is the most complicated one. But basically:

```
phase === "focus"                          → go to "break"
phase === "break" && focusSessions < 4     → go to "focus", focusSessions + 1
phase === "break" && focusSessions >= 4    → go to "long break"
phase === "long break"                     → go to "idle" (reset everything)
```

The full cycle traces out as:

| Step | Event  | phase      | focusSessions |
| ---- | ------ | ---------- | ------------- |
| 1    | start  | focus      | 1             |
| 2    | finish | break      | 1             |
| 3    | finish | focus      | 2             |
| 4    | finish | break      | 2             |
| 5    | finish | focus      | 3             |
| 6    | finish | break      | 3             |
| 7    | finish | focus      | 4             |
| 8    | finish | break      | 4             |
| 9    | finish | long break | 4             |
| 10   | finish | idle       | 0             |

4 focus sessions, 4 breaks, 1 long break — matches the Pomodoro spec.

---

We will need this:

```ts
const currentTime = Date.now();
const pausedFor =
  state.pauseTime === 0 ? currentTime : currentTime - state.pauseTime;
```

- if current phase is "focus" at here, that means we going to "break"
- reset the state to:

```ts
{
  now: currentTime -> Date.now()
  end: BREAK_SECONDS + pausedFor
  pause: false,
  pauseTime: 0,
  phase: "break"
  focusSessions: state.focusSessions // follow the same
}
```

- if current phase is "break" && focusSessions <4 at here, means we going back to "focus"
- reset the state to:

```ts
{
  now: currentTime -> Date.now()
  end: FOCUS_SECONDS + pausedFor,
  pause: false,
  pauseTime: 0,
  phase: "focus"
  focusSessions: state.focusSessions + 1
}
```

- if current phase is "break" && focusSessions => 4 at here, means we going to "long break"
- reset the state to:

```ts
{
  now: currentTime -> Date.now()
  end: LONG_BREAK_SECONDS + pausedFor,
  pause: false,
  pauseTime: 0,
  phase: "long break"
  focusSessions: state.focusSessions // follow the same, but here should be 4
}
```

- if current phase is "long break" at here, means we going back to "idle"
- reset the state to:

```ts
{
  now: 0,
  end: FOCUS_SECONDS,
  pause: true,
  pauseTime: 0,
  phase: "idle",
  focusSessions: 0
}
```

## The 00:00 display problem

When the timer reached 0, it jumped straight to the next phase without ever showing "00:00" on screen.

### Why it happens

1. The interval ticks every 100ms. `remainingSeconds` jumps from e.g. `0.05` to `-0.05` — it rarely lands on exactly `0`.
2. `seconds = Math.ceil(Math.max(0, ...))` means: at `0.05` → displays `1` (00:01). At `-0.05` → displays `0` (00:00).
3. So 00:00 only exists when `remainingSeconds` goes negative — which is the same moment `isRunning` becomes `false`.
4. `useEffect` sees `!isRunning` and calls `finish()` immediately.
5. `finish()` updates state → React re-renders with the next phase's time.
6. Steps 3-5 happen **before the browser paints**. React can render multiple times before the browser draws pixels. The 00:00 frame is calculated but gets overwritten before it's ever drawn — like writing "00:00" on a whiteboard and immediately erasing it.

### Fix: setTimeout

```ts
if (!isRunning) {
  const timeout = setTimeout(() => finish(), 1000);
  return () => clearTimeout(timeout);
}
```

`setTimeout` pushes `finish()` into a future task in the event loop. The browser gets to paint 00:00 first. Then after 1 second, `finish()` fires and transitions to the next phase.

The cleanup `return () => clearTimeout(timeout)` prevents multiple `finish()` calls — since `useEffect` re-runs while `isRunning` is `false`, each re-run cancels the previous timeout before setting a new one, so `finish()` only fires once.
