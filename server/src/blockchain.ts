import * as crypto from 'crypto';
import * as tf from '@tensorflow/tfjs-node';

export class Block {
  constructor(
    public index: number,
    public previousHash: string,
    public timestamp: number,
    public data: string,
    public hash: string,
    public nonce: number,
  ) {}
}

export class Blockchain {
  private chain: Block[] = [];

  constructor() {
    this.createGenesisBlock();
  }

  private async calculateHashWithML(
    index: number,
    previousHash: string,
    timestamp: number,
    data: string,
    nonce: number,
  ): Promise<string> {
    // Include machine learning predictions in hash calculation
    const mlPrediction = await this.predictWithTFJS(data);
    const mlHash = crypto
      .createHash('sha256')
      .update(mlPrediction.toString())
      .digest('hex');

    // Include the ML hash in the overall block hash
    return crypto
      .createHash('sha256')
      .update(index + previousHash + timestamp + data + nonce + mlHash)
      .digest('hex');
  }

  private proofOfWork(data: string): number {
    let nonce = 0;
    let hash = this.calculateHash(0, '0', Date.now(), data, nonce);

    while (!hash.startsWith('0000')) {
      nonce++;
      hash = this.calculateHash(0, '0', Date.now(), data, nonce);
    }

    return nonce;
  }

  public addBlock(newBlock: Block): void {
    newBlock.nonce = this.proofOfWork(newBlock.data);
    console.log(this);
    newBlock.hash = this.calculateHash(
      newBlock.index,
      this.getLatestBlock()?.hash ?? newBlock.hash,
      newBlock.timestamp,
      newBlock.data,
      newBlock.nonce,
    );
    this.chain.push(newBlock);
  }

  private async predictWithTFJS(data: string): Promise<number> {
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
    model.compile({ loss: 'meanSquaredError', optimizer: 'sgd' });

    const input = tf.tensor2d([this.stringToNumeric(data)], [1, 1]);

    const output = tf.tensor2d([[]]);
    await model.fit(input, output, { epochs: 10 });

    const prediction = model.predict(input) as tf.Tensor;

    const numericPrediction = prediction.dataSync()[0];

    input.dispose();
    output.dispose();
    prediction.dispose();

    return numericPrediction;
  }

  private stringToNumeric(data: string): number {
    return data.length;
  }

  private createGenesisBlock(): void {
    this.addBlock(new Block(0, '0', Date.now(), 'Genesis Block', '', 0));
  }

  private async proofOfWorkWithML(data: string): Promise<number> {
    let nonce = 0;
    let latestBlock = this.getLatestBlock();
    let previousHash = latestBlock ? latestBlock.hash : '0';

    let hash = await this.calculateHashWithML(
      0,
      previousHash,
      Date.now(),
      data,
      nonce,
    );

    while (!(hash as string).startsWith('0000')) {
      nonce++;
      hash = await this.calculateHashWithML(
        0,
        previousHash,
        Date.now(),
        data,
        nonce,
      );
    }

    return nonce;
  }

  private async addBlockWithML(newBlock: Block): Promise<void> {
    newBlock.nonce = await this.proofOfWorkWithML(newBlock.data);
    newBlock.hash = await this.calculateHashWithML(
      newBlock.index,
      this.getLatestBlock()?.hash || '0', // Use '0' if getLatestBlock() returns undefined
      newBlock.timestamp,
      newBlock.data,
      newBlock.nonce,
    );
    this.chain.push(newBlock);
  }

  // public addBlock(newBlock: Block): void {
  //   // Regular addBlock method without machine learning
  //   newBlock.nonce = this.proofOfWork(newBlock.data);
  //   newBlock.hash = this.calculateHash(
  //     newBlock.index,
  //     this.getLatestBlock().hash,
  //     newBlock.timestamp,
  //     newBlock.data,
  //     newBlock.nonce,
  //   );
  //   this.chain.push(newBlock);
  // }
  public getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  public getChain(): Block[] {
    return this.chain;
  }

  private calculateHash(
    index: number,
    previousHash: string,
    timestamp: number,
    data: string,
    nonce: number,
  ): string {
    return crypto
      .createHash('sha256')
      .update(index + previousHash + timestamp + data + nonce)
      .digest('hex');
  }
}
