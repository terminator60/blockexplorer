import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { useEffect, useState } from 'react';

import './App.css';

// Refer to the README doc for more information about using API
// keys in client-side code. You should never do this in production
// level code.
const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};


// In this week's lessons we used ethers.js. Here we are using the
// Alchemy SDK is an umbrella library with several different packages.
//
// You can read more about the packages here:
//   https://docs.alchemy.com/reference/alchemy-sdk-api-surface-overview#api-surface
const alchemy = new Alchemy(settings);

function App() {
  const [blockNumber, setBlockNumber] = useState();
  const [gasPrice, setGasPrice] = useState(0);
  const [searchValue, setSearchValue] = useState();
  //const [blockId, setBlockId] = useState();
  const [divContent, setDivContent] = useState();
  let blockId;

  useEffect(() => {
    async function getBlockNumber() {
      setBlockNumber(await alchemy.core.getBlockNumber());
    }
    async function getGasPrice() {
      const gasData = await alchemy.core.getGasPrice();
      //console.log(gasData._hex)
      setGasPrice(Number(Utils.formatUnits(gasData._hex, "gwei")).toFixed(0));
    }
    getBlockNumber();
    getGasPrice();
  });

  const searchInputUpdate = (e) => {
    setSearchValue(e.target.value);
  };

  const btnClickSearch = async (e) => {
    checkSearchInput(searchValue)
  };

  async function checkSearchInput(input) {
    if (input > 0 && input < blockNumber) {
      //console.log("Getting Block Data")
      getBlockData(input)
    } else if (input.length === 66) {
      //console.log("Getting Transaction Data")
      getTransactionData(input)
    } else if (input.length === 42) {
      //console.log("Getting Address Data")
      getAddressData(input)
    }
  }

  async function getBlockData(input) {
    const blockData = await alchemy.core.getBlock(`0x${Number(input).toString(16)}`);
    //console.log(blockData)
    setDivContent(<div>
      <h3>Block #{blockData.number}</h3>
      <p>Block Height: {blockData.number}</p>
      <p>Hash: {blockData.hash}</p>
      <p>Parent Hash: {blockData.parentHash}</p>
      <p>Difficulty: {blockData.difficulty}</p>
      <p>Mined By: {blockData.miner}</p>
      <p>Transactions: {blockData.transactions.length} Transaction in this block</p>
    </div>);
  }

  async function getBlock() {
    //console.log(blockId)
    await getBlockData(blockId ? blockId : blockNumber)
  }

  async function getTransactionData(input) {
    const transactionData = await alchemy.core.getTransaction(input);
    //console.log(transactionData)
    blockId = transactionData.blockNumber;
    setDivContent(<div>
      <h3>Transaction Details</h3>
      <p>Transaction Hash: {transactionData.hash}</p>
      <p>Block: <b onClick={getBlock}>{transactionData.blockNumber}</b></p>
      <p>From: {transactionData.from}</p>
      <p>To: {transactionData.to}</p>
      <p>Value: {Utils.formatEther(transactionData.value._hex)} ETH</p>
      { }
      <p>Transaction Fee: {Utils.formatEther(transactionData.gasLimit._hex * transactionData.gasPrice._hex)} ETH</p>
      <p>Gas Price: {Utils.formatUnits(transactionData.gasPrice._hex, "gwei")} GWEI</p>
      <p>Transaction Index in the Block: {transactionData.transactionIndex}</p>
    </div>);
  }

  async function getAddressData(input) {
    const Balance = await alchemy.core.getBalance(input);
    const isContract = await alchemy.core.isContractAddress(input);
    const tokenBalances = await alchemy.core.getTokenBalances(input);
    //console.log(Balance)
    //console.log(isContract)
    if (isContract) {
      const deployerData = await alchemy.core.findContractDeployer(input);
      //console.log(deployerData);
      setDivContent(<div>
        <h3>Address {input}</h3>
        <p>ETH Balance: {Utils.formatEther(Balance)} ETH</p>
        <p>Token Holding: {tokenBalances.tokenBalances.length}</p>
        <p>Contract Deployer: {deployerData.deployerAddress}</p>
      </div>)
    } else {
      setDivContent(<div>
        <h3>Address {input}</h3>
        <p>ETH Balance: {Utils.formatEther(Balance)} ETH</p>
        <p>Token Holding: {tokenBalances.tokenBalances.length}</p>
      </div>);
    }
  }

  return <div>
    <div className="heading">
      <div>
        <h1>Block Explorer</h1>
      </div>
      <div className='gas-container'>
        <p>Gas Price - {gasPrice} Gwei</p>
      </div>
    </div>
    <div className="search-container">
      <input type="text" className="search-input" id="search-input" value={searchValue} onChange={searchInputUpdate} placeholder="Search Address, Transaction, Block..."></input>
      <button className="search-button" onClick={btnClickSearch} >Search</button>
    </div>
    <div className='Result' id="resultBody">
      {divContent}
    </div>
    <div className="App">Latest Block Number: <b onClick={getBlock}>{blockNumber}</b></div>
  </div>;
}

export default App;
