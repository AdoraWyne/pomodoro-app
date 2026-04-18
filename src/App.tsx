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
