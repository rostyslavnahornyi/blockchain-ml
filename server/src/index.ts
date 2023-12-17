// server.ts

import express from 'express';
import { Block, Blockchain } from './blockchain';
import cors from 'cors';

const app = express();
const port = 3000;
app.use(cors());

const blockchain = new Blockchain();

app.use(express.json());

app.get('/mine', (req, res) => {
  const data = req.query.data as string; // Retrieve data from the query parameter
  const newBlock = new Block(
    blockchain.getLatestBlock().index + 1,
    blockchain.getLatestBlock().hash,
    Date.now(),
    data,
    '',
    0,
  );

  blockchain.addBlock(newBlock);

  res.json({
    message: 'Block mined successfully',
    block: newBlock,
  });
});

app.get('/chain', (req, res) => {
  res.json({
    chain: blockchain.getChain(),
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
