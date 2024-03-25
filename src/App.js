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
  const [blockNumber, setBlockNumber] = useState(0);
  const [gasPrice, setGasPrice] = useState(0);
  const [searchValue, setSearchValue] = useState();
  //const [blockId, setBlockId] = useState();
  const [divContent, setDivContent] = useState();
  const [trnxContent, setTrnxContent] = useState();
  const [counter, setCounter] = useState(0);

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
      if (counter === 0) {
        //console.log(counter)
        await getHomePageDetails(await alchemy.core.getBlockNumber());
      }
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

  function rangeArray(start, end, step = 1) {
    const result = [];
    for (let i = start; i <= end; i += step) {
      result.push(i);
    }
    return result;
  }

  function displayHome() {
    setCounter(0)
  }

  const transactionClick = async (e) => {
    const trnxId = e.target.textContent;
    //console.log(trnxId);
    const transactionData = await alchemy.core.getTransaction(trnxId);
    getTransactionData(transactionData);
  };

  const addressClick = async (e) => {
    const address = e.target.textContent;
    //console.log(address);
    getAddressData(address)
  };

  async function getHomePageDetails(latest_block) {
    setCounter(1);
    //console.log(counter)
    const blocksArray = rangeArray(latest_block - 9, latest_block);
    const blockTrxData = await alchemy.core.getBlockWithTransactions(latest_block);
    const trxs = blockTrxData.transactions.slice(blockTrxData.transactions.length - 10);
    //console.log(blocksArray)
    //console.log(trxs)
    const options = { method: 'GET', headers: { 'x-cg-demo-api-key': process.env.REACT_APP_COINGECKO_API_KEY } };
    let priceData;
    await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true&precision=0', options)
      .then(response => response.json())
      .then(response => {
        //console.log(response);
        priceData = response;
      })
      .catch(err => console.error(err));
    console.log(priceData.ethereum);
    const priceChangeSymbol = priceData.ethereum.usd_24h_change > 0 ? '+' : '-';
    setDivContent(<div className="recent-data">
      <div className='recent-blocks-data'>
        <div className='recent-blocks-data-header'>
          <img src={require('./images/blockchain.png')} alt="block-icon" className="sub-logo"></img>
          <h3>Recent Blocks</h3>
        </div>
        {blocksArray.reverse().map((block) => (
          <div className='recent-block'>
            <img src={require('./images/block.png')} alt="block-icon" className="sub-logo"></img>
            <p onClick={getBlock}>{block}</p>
          </div>
        ))}
      </div>
      <div className='recent-transactions-data'>
        <div className='recent-transactions-data-header'>
          <img src={require('./images/file.png')} alt="block-icon" className="sub-logo"></img>
          <h3>Recent Transactions</h3>
        </div>
        {trxs.reverse().map((trx) => (
          <div className='recent-transaction'>
            <div className='recent-transaction-head'>
              <img src={require('./images/list.png')} alt="transaction-icon" className="sub-logo"></img>
              <p>{trx.hash}</p>
            </div>
            <div className='recent-transaction-data'>
              <p>From {trx.from}</p>
              <p>To {trx.to}</p>
            </div>
            <div className='recent-transaction-value'>
              <p>Value {Number(Utils.formatEther(trx.value._hex), 16).toFixed(3)} ETH</p>
            </div>
          </div>
        ))}
      </div>
      <div className='recent-additonal-data'>
        <div className='recent-data-container'>
          <img src={require('./images/label.png')} alt="gas-icon" className="main-logo"></img>
          <div className='recent-data-container-text'>
            <p>Eth Price</p>
            <p id='gasText'>${Number(priceData.ethereum.usd).toLocaleString()} ({priceChangeSymbol}{Number(priceData.ethereum.usd_24h_change).toPrecision(2)}%)</p>
          </div>
        </div>
        <div className='recent-data-container'>
          <img src={require('./images/pie-chart.png')} alt="gas-icon" className="main-logo"></img> 
          <div className='recent-data-container-text'>
            <p>Market Cap</p>
            <p id='gasText'>${Number(Math.floor(priceData.ethereum.usd_market_cap)).toLocaleString()}</p>
          </div>
        </div>
        <div className='recent-data-container'>
          <img src={require('./images/stocks.png')} alt="gas-icon" className="main-logo"></img> 
          <div className='recent-data-container-text'>
            <p>Volume (24 Hr)</p>
            <p id='gasText'>${Number(Math.floor(priceData.ethereum.usd_24h_vol)).toLocaleString()}</p>
          </div>
        </div>
        <div className='recent-data-container'>
          <img src={require('./images/gas-logo.png')} alt="gas-icon" className="main-logo"></img>
          <div className='recent-data-container-text'>
            <p>Gas -</p>
            <p id='gasText' style={{ color: getGasColor(gasPrice) }}>{gasPrice} Gwei</p>
          </div>
        </div>
        <div className='recent-data-container'>
          <img src={require('./images/blocks.png')} alt="block-icon" className="main-logo"></img>
          <div className='recent-data-container-text'>
            <p>Latest Block</p>
            <p>{latest_block}</p>
          </div>
        </div>
      </div>
    </div >)
  }

  async function checkSearchInput(input) {
    if (input > 0 && input < blockNumber) {
      //console.log("Getting Block Data")
      getBlockData(input)
    } else if (input.length === 66) {
      //console.log("Getting Transaction Data")
      const transactionData = await alchemy.core.getTransaction(input);
      if (transactionData) {
        getTransactionData(transactionData)
      } else {
        //console.log("Getting Block Data")
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
    const now = new Date();
    const blockTimestamp = new Date(blockData.timestamp * 1000);
    const differenceMs = now.getTime() - blockTimestamp.getTime();
    const differenceDays = Math.floor(differenceMs / (1000 * 60 * 60 * 24));
    //console.log(blockData)
    //console.log(typeof (blockData))
    setDivContent(<div>
      <div className='result-header'>
        <img src={require('./images/blocks.png')} alt="block-icon" className="logo"></img>
        <h3>Block #{blockData.number}</h3>
      </div>
      <div className='result-body'>
        <table className='result-main-data-table'>
          <tbody>
            <tr>
              <td className='key'>Block Height:</td>
              <td>{blockData.number}</td>
            </tr>
            <tr>
              <td className='key'>Block Hash:</td>
              <td>{blockData.hash}</td>
            </tr>
            <tr>
              <td className='key'>Timestamp:</td>
              <td>{blockTimestamp.toUTCString()} ({differenceDays} Days ago)</td>
            </tr>
            <tr>
              <td className='key'>Transactions:</td>
              <td>
                <b onClick={displayBlockTransactions}>{blockData.transactions.length} Transaction</b> in this block
              </td>
            </tr>
            <tr>
              <td className='key'>Mined By:</td>
              <td>{blockData.miner}</td>
            </tr>
            <tr>
              <td className='key'>Difficulty:</td>
              <td>{blockData.difficulty}</td>
            </tr>
            <tr>
              <td className='key'>Extra Data:</td>
              <td>{blockData.extraData}</td>
            </tr>
          </tbody>
        </table>
        <table className='result-extra-data-table'>
          <tbody id='result-extra-data-table-body' hidden={true}>
            <tr>
              <td className='key'>Parent Hash:</td>
              <td ><b onClick={getBlock}>{blockData.parentHash}</b></td>
            </tr>
            <tr>
              <td className='key'>Difficulty:</td>
              <td>{blockData.difficulty}</td>
            </tr>
            <tr>
              <td className='key'>Nonce:</td>
              <td>{blockData.nonce}</td>
            </tr>
          </tbody>
          <tfoot>
            <b onClick={displayMoreDetails} id='show-more-details-tag'>Show More Details</b>
          </tfoot>
        </table>
      </div>
    </div>);
    setTrnxContent();
  }

  function displayMoreDetails() {
    const table = document.getElementById('result-extra-data-table-body');
    const tag = document.getElementById('show-more-details-tag');
    //console.log(table)
    if (table.hidden) {
      table.hidden = false
      tag.textContent = 'Show Less Details'
    } else {
      table.hidden = true
      tag.textContent = 'Show More Details'
    }
  }


  async function displayBlockTransactions() {
    const table = document.getElementById('transactionsTable');
    //console.log(table)
    if (!table) {
      const blockTrxData = await alchemy.core.getBlockWithTransactions(`0x${Number(blockId).toString(16)}`);
      const trxs = blockTrxData.transactions;
      if (trxs.length) {
        setTrnxContent(<TransactionTableComponent data={trxs}></TransactionTableComponent>);
      }
    } else {
      if (table.hidden) {
        table.hidden = false
      } else {
        table.hidden = true
      }
    }
  }

  async function getBlock(e) {
    const blockId = e.target.innerText;
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
      setTrnxContent();
    } else {
      setDivContent(<div>
        <h3>Address {input}</h3>
        <p>ETH Balance: {Utils.formatEther(Balance)} ETH</p>
        <p>Token Holding: {tokenBalances.tokenBalances.length}</p>
      </div>);
      setTrnxContent();
    }
  }

  const TransactionTableComponent = ({ data }) => {

    return (
      <table id="transactionsTable" className='transaction-table'>
        <thead>
          <tr>
            <th>Transaction Index</th>
            <th>Transaction Hash</th>
            <th>From</th>
            <th>To</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.transactionIndex}>
              <td>{item.transactionIndex}</td>
              <td onClick={transactionClick}>{item.hash}</td>
              <td><b onClick={addressClick}>{item.from}</b></td>
              <td><b onClick={addressClick}>{item.to}</b></td>
              <td>{Number(Utils.formatEther(item.value._hex), 16).toFixed(3)} ETH</td>
              {/*<td>{Number(Utils.formatEther(item.gasLimit._hex * item.gasPrice._hex)).toFixed(5)} ETH</td >*/}
            </tr>
          ))}
        </tbody>
      </table >
    );
  };

  return <div>
    <div className="header">
      <div className='site-header'>
        <img src={require('./images/eth-logo.png')} alt="gas-icon" className="main-logo"></img>
        <h1 onClick={displayHome}>ETH Block Explorer</h1>
      </div>
      <div className='latest-data-container'>
        <div className='data-container'>
          <img src={require('./images/gas-logo.png')} alt="gas-icon" className="logo"></img>
          <p>Gas - <b id='gasText' style={{ color: getGasColor(gasPrice) }}>{gasPrice} Gwei</b></p>
        </div>
        <div className='data-container'>
          <img src={require('./images/blocks.png')} alt="block-icon" className="logo"></img>
          <p>Latest Block - <b onClick={getBlock}>{blockNumber}</b></p>
        </div>
      </div>
    </div>
    <div className="search-container">
      <input type="text" className="search-input" id="search-input" value={searchValue} onChange={searchInputUpdate} placeholder="Search Address, Transaction, Block..."></input>
      <button className="search-button" onClick={btnClickSearch}>Search</button>
    </div>
    <div className='main-result' id="resultBody">
      {divContent}
      <div className='result-body'>
        {trnxContent}
      </div>
    </div>
  </div >;
}

export default App;
