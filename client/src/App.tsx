import { useEffect, useState } from "react";
import "./index.css";

function App() {
  const [chain, setChain] = useState<Array<unknown>>([]);

  useEffect(() => {
    fetch("http://localhost:3000/chain")
      .then((response) => response.json())
      .then((data) => setChain(data.chain))
      .catch((error) => console.error("Error fetching chain:", error));
  }, []);

  const mineBlock = () => {
    const data = prompt("Enter data for the new block:");
    if (data) {
      fetch(`http://localhost:3000/mine?data=${data}`)
        .then((response) => response.json())
        .then((result) => {
          console.log(result);

          fetch("http://localhost:3000/chain")
            .then((response) => response.json())
            .then((data) => setChain(data.chain))
            .catch((error) => console.error("Error fetching chain:", error));
        })
        .catch((error) => console.error("Error mining block:", error));
    }
  };
  console.log(chain);
  return (
    <div>
      <h1>Blockchain Explorer</h1>
      <button onClick={mineBlock}>Mine Block</button>
      <ul>
        {chain.map((block) => (
          <li key={block.index}>
            <strong>Block {block.index}</strong>
            <p>Data: {block.data}</p>
            <p>Hash: {block.hash}</p>
            {/* Include other block information as needed */}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
