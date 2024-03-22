import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { useEffect, useState } from 'react';
//import TableComponent from './TableComponent.js';

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
  const [trnxContent, setTrnxContent] = useState();
  let blockId;

  useEffect(() => {
    async function getData() {
      async function getBlockNumber() {
        setBlockNumber(await alchemy.core.getBlockNumber());
      }
      async function getGasPrice() {
        const gasData = await alchemy.core.getGasPrice();
        setGasPrice(Number(Utils.formatUnits(gasData._hex, "gwei")).toFixed(0));
      }
      getBlockNumber();
      getGasPrice();
    }
    const interval = setInterval(getData, 2000);
    return () => clearInterval(interval);
  });

  const getGasColor = (number) => {
    if (number < 25) {
      return 'green';
    } else if (number >= 25 && number < 75) {
      return 'blue';
    } else {
      return 'red';
    }
  };

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
      console.log("Getting Transaction Data")
      const transactionData = await alchemy.core.getTransaction(input);
      if (transactionData) {
        getTransactionData(transactionData)
      } else {
        console.log("Getting Block Data")
        getBlockData(input)
      }

    } else if (input.length === 42) {
      //console.log("Getting Address Data")
      getAddressData(input)
    }
  }

  async function getBlockData(input) {
    let blockData;
    if (input.length === 66) {
      blockData = await alchemy.core.getBlock(input);

    } else {
      blockData = await alchemy.core.getBlock(`0x${Number(input).toString(16)}`);
    }
    blockId = blockData.number;
    //console.log(blockData)
    //console.log(await alchemy.core.getBlockWithTransactions(`0x${Number(input).toString(16)}`))
    setDivContent(<div>
      <h3>Block #{blockData.number}</h3>
      <p>Block Height: {blockData.number}</p>
      <p>Hash: {blockData.hash}</p>
      <p>Parent Hash: {blockData.parentHash}</p>
      <p>Difficulty: {blockData.difficulty}</p>
      <p>Mined By: {blockData.miner}</p>
      <p>Transactions: <b onClick={displayBlockTransactions}>{blockData.transactions.length} Transaction</b> in this block</p>
    </div>);
    setTrnxContent();
  }

  async function displayBlockTransactions() {
    const table = document.getElementById('transactionsTable');
    //console.log(table)
    if (!table) {
      const blockTrxData = await alchemy.core.getBlockWithTransactions(`0x${Number(blockId).toString(16)}`);
      const trxs = blockTrxData.transactions;
      if (trxs.length) {
        setTrnxContent(<TableComponent data={trxs}></TableComponent>);
      }
    } else {
      if (table.hidden) {
        table.hidden = false
      } else {
        table.hidden = true
      }
    }
  }

  async function getBlock() {
    //console.log(blockId)
    await getBlockData(blockId ? blockId : blockNumber)
  }

  async function getTransactionData(transactionData) {
    //const transactionData = await alchemy.core.getTransaction(input);
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
      <p>Transaction Fee: {/*Utils.formatEther(transactionData.gasLimit._hex * transactionData.gasPrice._hex)*/} ETH</p>
      <p>Gas Price: {Utils.formatUnits(transactionData.gasPrice._hex, "gwei")} GWEI</p>
      <p>Transaction Index in the Block: {transactionData.transactionIndex}</p>
    </div>);
    setTrnxContent();
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

  const TableComponent = ({ data }) => {
    const transactionClick = async (e) => {
      const trnxId = e.target.textContent;
      console.log(trnxId);
      const transactionData = await alchemy.core.getTransaction(trnxId);
      getTransactionData(transactionData);
    };

    return (
      <table id="transactionsTable">
        <thead>
          <tr>
            <th>Transaction Index</th>
            <th>Transaction Hash</th>
            <th>From</th>
            <th>To</th>
            <th>Value</th>
            {/* Add more headers as needed */}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.transactionIndex}>
              <td>{item.transactionIndex}</td>
              <td><b onClick={transactionClick}>{item.hash}</b></td>
              <td>{item.from}</td>
              <td>{item.to}</td>
              <td>{Number(Utils.formatEther(item.value._hex), 16).toFixed(3)} ETH</td>
              {/*<td>{Number(Utils.formatEther(item.gasLimit._hex * item.gasPrice._hex)).toFixed(5)} ETH</td >*/}
            </tr>
          ))}
        </tbody>
      </table >
    );
  };

  return <div>
    <div className="heading">
      <div>
        <h1>Block Explorer</h1>
      </div>
      <div className='gas-container'>
        <p>Gas Price - <b id='gasText' style={{ color: getGasColor(gasPrice) }}>{gasPrice} Gwei</b></p>
        {/*<div className="App">Latest Block Number: <b onClick={getBlock}>{blockNumber}</b></div>*/}
        <p>Latest Block Number: <b onClick={getBlock}>{blockNumber}</b></p>
      </div>
    </div>
    <div className="search-container">
      <input type="text" className="search-input" id="search-input" value={searchValue} onChange={searchInputUpdate} placeholder="Search Address, Transaction, Block..."></input>
      <button className="search-button" onClick={btnClickSearch}>Search</button>
    </div>
    <div className='Result' id="resultBody">
      {divContent}
    </div>
    <div className='Result' id="resultBody">
      {trnxContent}
    </div>
  </div>;
}

export default App;
