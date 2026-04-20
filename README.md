# Build a Pomodoro app

Build a React app that allows users to track a Pomodoro cycle, [this exercise](https://reactpractice.dev/exercise/build-a-pomodoro-app/).

## Improvement

- customer hook `setInterval`
- consider to use Zustand?
- ❌ Use Temporal API instead of Date API - because Date will be replaced by Temporal soon.
  - Tried to use `Temporal.Instant` and `Temporal.Duration` but I think it's a bit overkill here, as I had to intro more methods and a polyfill for this.

---

# Learned

Here is the learning note for myself to read, [a full blog has been published on Medium](https://medium.com/@adorawyne/why-my-react-timer-drifts-and-how-to-fix-it-e3c8e88bf8af).

When building the timer - `mm:ss` part, I was having this code:

```ts
import { useEffect, useState } from "react";
import "./App.css";

const formatter = (n: number) => String(n).padStart(2, "0");

function App() {
  const [second, setSecond] = useState(5);

  useEffect(() => {
    if (second <= 0) return;

    const secondTimer = setInterval(() => {
      setSecond(second - 1);
    }, 1000);

    return () => clearInterval(secondTimer);
  }, [second]);

  const transformedSecond = formatter(second % 60);
  const transformedMinute = formatter(Math.floor(second / 60));

  return (
    <>
      <h1>Pomodoro App</h1>
      <p>
        {transformedMinute}:{transformedSecond}
      </p>
    </>
  );
}

export default App;
```

## The Problem

This worked but the problem is **I'm using `setInterval` method** to count the seconds. `setInterval()` is not reliable and eventually the time might drift, that's why we should not rely on this method on a timer (which require stability).

The drift could be due to resource allocation in single thread operation.
For example:

1. An expensive operation in the task queue might take more than 1000ms to execute.
1. So the `setInterval` in the task queue will have to wait for this operation to finish first then only be executed, and that might be taken more than 1000ms.

If this continue to happens, eventually the difference could catch up and might cause the time to drift away.

This is one of the examples that `setInterval(() => {}, 1000)` could take more than 1000ms to operate.

## Solution

How to solve the timer problem?

I use [timestamp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_epoch_timestamps_and_invalid_date) and 2 pointers in timestamp to calculate the seconds.

Timestamp is how many milliseconds has passed since the epoch (January 1, 1970 UTC).

What I mean exactly?

1. I have these 2 pointers in timestamp or states:
   - an ongoing time counter, i.e. `now` -> Time now
   - a fixed time counter, i.e. `end`-> Time now + 5 seconds (assume we need a 5 seconds countdown timer)

2. In useEffect, I use `setInterval(() => {}, 100)` to get the updated `now` time.
   - use `useEffect` here because `setInterval` is a side effect, it's reaching out the component to use the browser timer to do the operation we set in the `setInterval`.

3. To get how many seconds have left, I would use the `end` to minus `now`.

For example:

1. `now` is 5000ms and `end` is 5000ms + 5000ms = 10_000ms
1. In useEffect, `now` is being updated every 1000ms
1. So second is constantly changing -> second = `end` - `now`
   - When start, end - now -> 10_000 - 5000 = 5000
   - 1st 1000ms, 10_000 - 6000 = 4000
   - 2nd 1000ms, 10_000 - 7000 = 3000
   - 3rd 1000ms, 10_000 - 8000 = 2000
   - 4th 1000ms, 10_000 - 9000 = 1000
   - 5th 1000ms, 10_000 - 10_000 = 0000ms

- With this approach, I don't rely on `setInterval` to count the seconds for me.
- But I use `setInterval` to update the ongoing timestamp for me, then I use the `end` timestamp to minus `now` timestamp in order for me to know how many seconds left.

### Important note

Realise I use `setInterval(() => {}, 100)`?

I don't update the timer at exactly 1000ms, because `setInterval` is not reliable. With 1000ms interval, that means `setNow` will only trigger **at least** 1000ms, not exactly at 1000ms.

Let's look at this table:
| Fires at | now | second | Display | How long user saw previous value |
| ----- | ----- | ----- | ----- | ----- |
| 0ms (render) | 5000 | 5.0 → 5 | "5" | — |
| 1047ms | 6047 | 3.95 → 4 | "4" | "5" shown for 1.047s |
| 2103ms | 7103 | 2.90 → 3 | "3" | "4" shown for 1.056s (2103 - 1047) |
| 3098ms | 8098 | 1.90 → 2 | "2" | "3" shown for 0.995s (3098 - 2103) |
| 4210ms | 9210 | 0.79 → 1 | "1" | "2" shown for 1.112s (4210 - 3098) |
| 5150ms | 10150 | 0 → 0 | "0" | "1" shown for 0.940s (5150 - 4210) |

With 100ms as interval, the wrong time will be shown in very short amount of time, around 100ms++, which is unnoticeable to human eyes.

**The smaller interval time, the more frequent the `setNow` will be triggered, the more frequent the time `now` will be updated, then the smaller gap the wrong time will be shown.**
