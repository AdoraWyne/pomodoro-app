# PLAN (Step by step)

1. Build a basic timer first
   - ✅ render a time with xx:xx format
   - ✅ start with 1 min
   - ✅ allow it to pause the timer
   - ✅ allow it to restart back to 1 min
   - ✅ allow it to start without automatically start
   - ✅ allow it to skip to 0 min

   - ✅ if it works, move to 25mins.

   - Tests 🧪

2. Integrate the timer with 5 mins break

3. Able to track how many pomodoro cycle has been done.
   - after 4, then a long break: 20mins

---

initial states:

we always start with "idle" so the initial values for states:
{
now: 0,
end: FOCUS_SECONDS,
pause: true,
pauseTime: 0,
phase: "idle",
focusSession: 0
}

---

"start" action

- if current phase is "idle" here, means we going to "focus"
- this will be the first start and state.pauseTime will be "0"
- the state will be:
  const currentTime = Date.now();
  const pausedFor =
  state.pauseTime === 0 ? currentTime : currentTime - state.pauseTime;

  {
  now: currentTime,
  end: state.end + pausedFor, // initial `end` state is FOCUS_SECONDS so we just follow the state.end
  pause: false,
  pauseTime: 0,
  phase: "focus
  focusSessions: 1
  }

- if current phase is not "idle", means this is on running timer, phase stays the same.
- state.pauseTime will not be "0"
- the state will be:
  const currentTime = Date.now();
  const pausedFor =
  state.pauseTime === 0 ? currentTime : currentTime - state.pauseTime;

  {
  now: currentTime,
  end: state.end + pausedFor,
  pause: false,
  pauseTime: 0,
  phase: state.phase // follow the same
  focusSessions: state.focusSessions // follow the same
  }

- so the only changes here in "start" action is phase
- if phase === "idle", then phase === "focus", otherwise stays the same,
- if phase === "idle", then focusSession === 1, otherwise stays the same,

---

"finish" action

const currentTime = Date.now();
const pausedFor =
state.pauseTime === 0 ? currentTime : currentTime - state.pauseTime;

- if current phase is "focus" at here, that means we going to "break"
- reset the state to:
  {
  now: currentTime -> Date.now()
  end: BREAK_SECONDS + pausedFor
  pause: false,
  pauseTime: 0,
  phase: "break"
  focusSessions: state.focusSessions // follow the same
  }

- if current phase is "break" && focusSessions <4 at here, means we going back to "focus"
- reset the state to:
  {
  now: currentTime -> Date.now()
  end: FOCUS_SECONDS + pausedFor,
  pause: false,
  pauseTime: 0,
  phase: "focus"
  focusSessions: state.focusSessions + 1
  }
- if current phase is "break" && focusSessions => 4 at here, means we going to "long break"
- reset the state to:
  {
  now: currentTime -> Date.now()
  end: LONG_BREAK_SECONDS + pausedFor,
  pause: false,
  pauseTime: 0,
  phase: "long break"
  focusSessions: state.focusSessions // follow the same, but here should be 4
  }
- if current phase is "long break" at here, means we going back to "idle"
- reset the state to:
  {
  now: 0,
  end: FOCUS_SECONDS,
  pause: true,
  pauseTime: 0,
  phase: "idle",
  focusSessions: 0
  }

---

Initial values:
{
now: 0,
end: 5000ms,
pause: true,
pauseTime: 0,
phase: "idle",
focusSessions: 0,
}

Current Time is 1000
{
end: 5000 + 1000 = 6000
now: 1000,
pause: false,
pauseTime: 0,
phase,
focusSessions: focusSessions,
}

const remainingSeconds = (state.end - state.now) / 1000; = 5s
const seconds = Math.ceil(Math.max(0, 5000)/1000) = 5

Current Time is 6000
{
end: 5000 + 1000 = 6000
now: 6000,
pause: false,
pauseTime: 0,
phase,
focusSessions: focusSessions,
}

const remainingSeconds = (state.end - state.now) / 1000; = 0s
const seconds = Math.ceil(Math.max(0, 0)/1000) = 0

---

For skip behaviours:

- When the timer is on idle, dont show skip button.
- When the timer is ongoing, user is allowed to skip.
  - when skip next mode, pause is true and waiting for user to start again.
- When the timer is paused, user is not allowed to skip, skip button disappear.
- When the timer is reset / on idle, dont show skip button.

---

"idle" -> "start" -> "pause" -> "skip" -> "start"

Initial state:
{
end: 5000,
now: 0,
pause: true,
pauseTime: 0,
phase: "idle"
}

"start"

current time: 1713880000000
{
end: 5000 + 1713880000000,
now: 1713880000000,
pause: false,
pauseTime: 0,
phase: "focus",
focusSessions: 1,
};

"pause"

{
end: 5000 + 1713880000000,
now: Date.now,
pause: true,
pauseTime: Date.now,
phase: "focus",
focusSessions: 1,
};

"skip"
{
end: 5000 + 1713880000000,
now: 5000 + 1713880000000,
pause: true,
pauseTime: 0,
phase: "focus",
focusSessions: 1,
}

"start"
current time = 1713880010000
{
end: 5000 + 1713880000000 + 1713880010000,
now: 1713880010000,
pause: false,
pauseTime: 0,
phase: "focus",
focusSessions: 1,
}
