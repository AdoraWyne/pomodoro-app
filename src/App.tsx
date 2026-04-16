import { useEffect, useState } from "react";
import "./App.css";

const formatter = (n: number) => String(n).padStart(2, "0");

function App() {
  const [second, setSecond] = useState(60);

  useEffect(() => {
    const secondTimer = setInterval(() => {
      setSecond(second - 1);
    }, 1000);

    return () => clearInterval(secondTimer);
  });

  const transformedSecond = formatter(second % 60);
  const transformedMinute = formatter(Math.floor(second / 60));

  return (
    <>
      <h1>Pomodoro App</h1>
      <p>
        {transformedMinute}:{transformedSecond}
      </p>
      <p></p>
    </>
  );
}

export default App;
