import { useEffect, useState } from "react";
import "./App.css";

const formatter = (n: number) => String(n).padStart(2, "0");
const transformedTimer = (second: number) => {
  return `${formatter(Math.floor(second / 60))}:${formatter(Math.ceil(second % 60))}`;
};

function App() {
  const [now, setNow] = useState(new Date()); // constantly moving
  const [end, setEnd] = useState(() => new Date(Date.now() + 5000)); // fix , use useEnd when reset

  useEffect(() => {
    const secondTimer = setInterval(() => {
      setNow(new Date());
    }, 100);

    return () => clearInterval(secondTimer);
  }, []);

  const second = Math.max(0, (end.getTime() - now.getTime()) / 1000);

  return (
    <>
      <h1>Pomodoro App</h1>
      <p>{transformedTimer(second)}</p>
    </>
  );
}

export default App;
