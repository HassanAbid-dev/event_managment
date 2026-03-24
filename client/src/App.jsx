import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <p className="bg-blue-500 text-white text-2xl font-bold p-8 rounded-lg m-4">
        Hello World.
      </p>
    </>
  );
}

export default App;
