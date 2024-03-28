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
  const mainDashbpard = (<div className="recent-data">
    <div className='recent-blocks-data' >
      <div className='recent-blocks-data-header'>
        <img src={require('./images/blockchain.webp')} alt="block-icon" className="sub-logo"></img>
        <h3>Recent Blocks</h3>
      </div>
    </div>
    <div className='recent-transactions-data' style={{ width: '65%' }}>
      <div className='recent-transactions-data-header'>
        <img src={require('./images/file.webp')} alt="block-icon" className="sub-logo"></img>
        <h3>Recent Transactions</h3>
      </div>
    </div>
    <div className='recent-additonal-data' style={{ width: '15%' }}>
      <div className='recent-data-container'>
        <img src={require('./images/label.webp')} alt="gas-icon" className="main-logo"></img>
        <div className='recent-data-container-text'>
          <p>Eth Price</p>
        </div>
      </div>
      <div className='recent-data-container'>
        <img src={require('./images/pie-chart.webp')} alt="gas-icon" className="main-logo"></img>
        <div className='recent-data-container-text'>
          <p>Market Cap</p>
        </div>
      </div>
      <div className='recent-data-container'>
        <img src={require('./images/stocks.webp')} alt="gas-icon" className="main-logo"></img>
        <div className='recent-data-container-text'>
          <p>Volume (24 Hr)</p>
        </div>
      </div>
      <div className='recent-data-container'>
        <img src={require('./images/gas-logo.webp')} alt="gas-icon" className="main-logo"></img>
        <div className='recent-data-container-text'>
          <p>Gas</p>
        </div>
      </div>
      <div className='recent-data-container'>
        <img src={require('./images/blocks.webp')} alt="block-icon" className="main-logo"></img>
        <div className='recent-data-container-text'>
          <p>Latest Block</p>
          <p></p>
        </div>
      </div>
      <div className='recent-data-container'>
      </div>
    </div>
  </div >)
  const [blockNumber, setBlockNumber] = useState(0);
  const [ethUsdValue, setEthUsdValue] = useState(0);
  const [gasPrice, setGasPrice] = useState(0);
  const [searchValue, setSearchValue] = useState();
  //const [blockId, setBlockId] = useState();
  const [divContent, setDivContent] = useState(mainDashbpard);
  const [trnxContent, setTrnxContent] = useState();
  const [counter, setCounter] = useState(0);
  const options = { method: 'GET', headers: { 'x-cg-demo-api-key': process.env.REACT_APP_COINGECKO_API_KEY } };
  let blockId;

  useEffect(() => {
    async function getData() {
      async function getBlockNumber() {
        setBlockNumber(await alchemy.core.getBlockNumber());
      }
      async function getEthUsdPrice() {
        //let priceData;
        await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=false&precision=0', options)
          .then(response => response.json())
          .then(response => {
            //console.log(response);
            //priceData = response;
            setEthUsdValue(response.ethereum.usd)
          })
          .catch(err => console.error(err));
        //console.log(ethUsdValue);
      }
      getBlockNumber();
      getGasPrice();
      getEthUsdPrice();
      if (counter === 0) {
        //console.log(counter)
        await getHomePageDetails(await alchemy.core.getBlockNumber());
      }
    }
    const interval = setInterval(getData, 2000);
    return () => clearInterval(interval);
  });

  async function getGasPrice() {
    const gasData = await alchemy.core.getGasPrice();
    const gas = Number(toGwei(gasData._hex)).toFixed(0);
    setGasPrice(gas);
    return gas;
  }

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
    let gas = gasPrice;
    if (!gas) {
      gas = await getGasPrice();
    }
    let priceData;
    await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true&precision=0', options)
      .then(response => response.json())
      .then(response => {
        //console.log(response);
        priceData = response;
      })
      .catch(err => console.error(err));
    //console.log(priceData.ethereum);
    const priceChangeSymbol = priceData.ethereum.usd_24h_change > 0 ? '+' : '';
    setTrnxContent();
    setDivContent(<div className="recent-data">
      <div className='recent-blocks-data'>
        <div className='recent-blocks-data-header'>
          <img src={require('./images/blockchain.webp')} alt="block-icon" className="sub-logo"></img>
          <h3>Recent Blocks</h3>
        </div>
        {blocksArray.reverse().map((block) => (
          <div className='recent-block'>
            <img src={require('./images/block.webp')} alt="block-icon" className="sub-logo"></img>
            <p className='clickable' onClick={getBlock}>{block}</p>
          </div>
        ))}
      </div>
      <div className='recent-transactions-data'>
        <div className='recent-transactions-data-header'>
          <img src={require('./images/file.webp')} alt="block-icon" className="sub-logo"></img>
          <h3>Recent Transactions</h3>
        </div>
        {trxs.reverse().map((trx) => (
          <div className='recent-transaction'>
            <div className='recent-transaction-head'>
              <img src={require('./images/list.webp')} alt="transaction-icon" className="sub-logo"></img>
              <p className='clickable' onClick={transactionClick}>{trx.hash}</p>
            </div>
            <div className='recent-transaction-data'>
              <p>From <b onClick={addressClick}>{trx.from}</b></p>
              <p>To <b onClick={addressClick}>{trx.to}</b></p>
            </div>
            <div className='recent-transaction-value'>
              <p>Value {Number(Utils.formatEther(trx.value._hex), 16).toFixed(3)} ETH</p>
            </div>
          </div>
        ))}
      </div>
      <div className='recent-additonal-data'>
        <div className='recent-data-container'>
          <img src={require('./images/label.webp')} alt="gas-icon" className="main-logo"></img>
          <div className='recent-data-container-text'>
            <p>Eth Price</p>
            <p id='gasText'>${Number(priceData.ethereum.usd).toLocaleString()} ({priceChangeSymbol}{Number(priceData.ethereum.usd_24h_change).toPrecision(2)}%)</p>
          </div>
        </div>
        <div className='recent-data-container'>
          <img src={require('./images/pie-chart.webp')} alt="gas-icon" className="main-logo"></img>
          <div className='recent-data-container-text'>
            <p>Market Cap</p>
            <p id='gasText'>${Number(Math.floor(priceData.ethereum.usd_market_cap)).toLocaleString()}</p>
          </div>
        </div>
        <div className='recent-data-container'>
          <img src={require('./images/stocks.webp')} alt="gas-icon" className="main-logo"></img>
          <div className='recent-data-container-text'>
            <p>Volume (24 Hr)</p>
            <p id='gasText'>${Number(Math.floor(priceData.ethereum.usd_24h_vol)).toLocaleString()}</p>
          </div>
        </div>
        <div className='recent-data-container'>
          <img src={require('./images/gas-logo.webp')} alt="gas-icon" className="main-logo"></img>
          <div className='recent-data-container-text'>
            <p>Gas</p>
            <p id='gasText' style={{ color: getGasColor(gas) }}>{gas} Gwei</p>
          </div>
        </div>
        <div className='recent-data-container'>
          <img src={require('./images/blocks.webp')} alt="block-icon" className="main-logo"></img>
          <div className='recent-data-container-text'>
            <p>Latest Block</p>
            <p>{latest_block}</p>
          </div>
        </div>
        <div className='recent-data-container'>
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
        <img src={require('./images/blocks.webp')} alt="block-icon" className="logo"></img>
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
                <b className='clickable' onClick={displayBlockTransactions}>{blockData.transactions.length} Transaction</b> in this block
              </td>
            </tr>
            <tr>
              <td className='key'>Mined By:</td>
              <td className='clickable' onClick={addressClick}>{blockData.miner}</td>
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
              <td className='clickable' onClick={getBlock}>{blockData.parentHash}</td>
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
            <p className='clickable' onClick={(e) => displayMoreDetails('result-extra-data-table-body', e)} id='show-more-details-tag'>Show More Details</p>
          </tfoot>
        </table>
      </div>
    </div>);
    setTrnxContent();
  }

  function displayMoreDetails(tableName, e) {
    const table = document.getElementById(tableName);
    const tag = document.getElementById('show-more-details-tag');
    //console.log(tableName)
    //console.log(e)
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
    const table = document.getElementById('transactions-table');
    //console.log(table)
    if (!table) {
      const blockTrxData = await alchemy.core.getBlockWithTransactions(`0x${Number(blockId).toString(16)}`);
      const trxs = blockTrxData.transactions;
      console.log(trxs)
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

  function toEther(input) {
    return Utils.formatEther(`${input}`);
  }

  function toGwei(input) {
    return Utils.formatUnits(`${input}`, 'gwei');
  }

  async function getTransactionData(transactionData) {
    //const transactionData = await alchemy.core.getTransaction(input);
    //console.log(transactionData)
    blockId = transactionData.blockNumber;
    const receipt = await alchemy.core.getTransactionReceipt(transactionData.hash)
    const gasLimit = parseInt(transactionData.gasLimit._hex, 16);
    const gasUsed = parseInt(receipt.gasUsed._hex, 16);
    const gasPriceGwei = toGwei(transactionData.gasPrice._hex);
    const gasPriceEth = toEther(transactionData.gasPrice._hex);
    const transValue = toEther(transactionData.value._hex);
    const transFee = gasPriceEth * gasUsed;
    //console.log(receipt);
    setDivContent(<div>
      <div className='result-header'>
        <h3>Transaction Details</h3>
      </div>
      <div className='result-body'>
        <table className='result-main-data-table'>
          <tbody>
            <tr key={transactionData.hash}>
              <td className='key'>Transaction Hash:</td>
              <td>{transactionData.hash}</td>
            </tr>
            <tr key={transactionData.blockNumber}>
              <td className='key'>Block:</td>
              <td><b className='clickable' onClick={getBlock}>{transactionData.blockNumber}</b> [{transactionData.confirmations} Block Confirmations]</td>
            </tr>
            <tr key={transactionData.from}>
              <td className='key'>From:</td>
              <td className='clickable' onClick={addressClick}>{transactionData.from}</td>
            </tr>
            <tr key={transactionData.to}>
              <td className='key'>To:</td>
              <td className='clickable' onClick={addressClick}>{transactionData.to}</td>
            </tr>
            <tr key='value'>
              <td className='key'>Value:</td>
              <td>{transValue} ETH (${Number(transValue * ethUsdValue).toLocaleString()})</td>
            </tr>
            <tr key='transactionFee'>
              <td className='key'>Transaction Fee:</td>
              <td>{transFee} ETH (${Number(transFee * ethUsdValue).toLocaleString()})</td>
            </tr>
            <tr key='gasPrice'>
              <td className='key'>Gas Price:</td>
              <td>{gasPriceGwei} Gwei</td>
            </tr>
          </tbody>
        </table>
        <table className='result-extra-data-table'>
          <tbody id='result-extra-data-table-body' hidden={true}>
            <tr key='transactionIndex'>
              <td className='key'>Position in Block:</td>
              <td>{transactionData.transactionIndex}</td>
            </tr>
            <tr key='nonce'>
              <td className='key'>Nonce:</td>
              <td>{transactionData.nonce}</td>
            </tr>
            <tr key='gasLimits'>
              <td className='key'>Gas Limit & Usage by Txn:</td>
              <td>{gasLimit.toLocaleString()} | {gasUsed.toLocaleString()} ({(gasUsed === gasLimit) ? '100' : ((gasUsed / gasLimit) * 100).toPrecision(2)}%)</td>
            </tr>

            {transactionData.type !== 2 ? '' : <tr key='gasFees'>
              <td className='key'>Gas Fees:</td>
              <td>Base: {gasPriceGwei - toGwei(transactionData.maxPriorityFeePerGas._hex)} Gwei | Max: {toGwei(transactionData.maxFeePerGas._hex)} Gwei | Max Priority: {toGwei(transactionData.maxPriorityFeePerGas._hex)} Gwei</td>
            </tr>
            }
            <tr key='data'>
              <td className='key'>Input Data:</td>
              <td className='dataValue'>{`transactionData.data`}</td>
            </tr>
          </tbody>
          <tfoot>
            <p className='clickable' onClick={(e) => displayMoreDetails('result-extra-data-table-body', e)} id='show-more-details-tag'>Show More Details</p>
          </tfoot>
        </table>
      </div>
    </div>);
    setTrnxContent();
  }

  async function getAddressData(input) {
    const balance = toEther(await alchemy.core.getBalance(input));
    const isContract = await alchemy.core.isContractAddress(input);
    const tokensData = await alchemy.core.getTokensForOwner(input);
    const transactionData = await alchemy.core.getAssetTransfers({
      fromBlock: "0x0",
      fromAddress: input,
      category: ["external"], //, "internal", "erc20", "erc721", "erc1155"
    });
    let deployerData;
    //console.log(Balance)
    //console.log(isContract)   
    //console.log(tokensData)
    //console.log(transactionData)
    //console.log(transactionData.transfers.reverse)
    if (isContract) {
      deployerData = await alchemy.core.findContractDeployer(input);
    }
    setDivContent(<div>
      <div className='result-header'>
        <h3>Address {input}</h3>
      </div>
      <div className='result-body'>
        <table className='result-main-data-table'>
          <tbody>
            <tr>
              <td className='key'>ETH Balance:</td>
              <td>{balance} ETH (${Number(balance * ethUsdValue).toPrecision(2)})</td>
            </tr>
            <tr>
              <td className='key'>Token Holding:</td>
              <td>{tokensData.tokens.length} Tokens</td>
            </tr>
            <tr>
              <td className='key' hidden={!isContract}>Contract Deployer:</td>
              <td className='clickable' onClick={addressClick}>{deployerData ? deployerData.deployerAddress : ''}</td>
            </tr>
          </tbody>
        </table>
        <div>
          <h3>Token Details</h3>
          <table className='tokens-table'>
            <thead>
              <tr>
                <th className='small-data'></th>
                <th className='small-data'>Asset</th>
                <th className='small-data'>Symbol</th>
                <th className='large-data'>Contract Address</th>
                <th className='small-data'>Balance</th>
              </tr>
            </thead>
            <tbody id='tokens-table-body' hidden={true}>
              {tokensData.tokens.map((token, index) => (
                <tr key={token.contractAddress}>
                  <td className='small-data'><img src={token.logo ? token.logo : require('./images/token.webp')} alt="token-icon" className="sub-logo"></img></td>
                  <td className='small-data'>{token.name}</td>
                  <td className='small-data'>{token.symbol}</td>
                  <td className='large-data-clickable' onClick={addressClick}>{token.contractAddress}</td>
                  <td className='small-data'>{token.balance}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <p className='clickable' onClick={(e) => displayMoreDetails('tokens-table-body', e)} id='show-more-details-tag'>Show Token Details</p>
            </tfoot>
          </table>
        </div>
        <div>
          <h3>Transaction Details</h3>
          <AddressTransactionTableComponent data={transactionData.transfers}></AddressTransactionTableComponent>
        </div>
      </div>
    </div>);
    setTrnxContent();
  }

  const TransactionTableComponent = ({ data }) => {
    return (
      <table id="transactions-table" className='transaction-table'>
        <thead>
          <tr>
            <th className='small-data'>Transaction Index</th>
            <th>Transaction Hash</th>
            <th>From</th>
            <th>To</th>
            <th className='small-data'>Value</th>
            <th className='small-data'>Txn Fee</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.transactionIndex}>
              <td className='small-data'>{item.transactionIndex}</td>
              <td className='large-data-clickable' onClick={transactionClick}>{item.hash}</td>
              <td className='large-data-clickable' onClick={addressClick}>{item.from}</td>
              <td className='large-data-clickable' onClick={addressClick}>{item.to}</td>
              <td className='small-data'>{Number(toEther(item.value._hex), 16).toFixed(3)} ETH</td>
              <td className='small-data'>{Number(toEther(item.gasLimit._hex * item.gasPrice._hex)).toFixed(5)}</td >
            </tr>
          ))}
        </tbody>
      </table >
    );
  };

  const AddressTransactionTableComponent = ({ data }) => {
    //id="addressTransactionsTable" className='result-extra-data-table'
    return (
      <table className='address-transaction-table'>
        <thead>
          <tr>
            <th>Transaction Hash</th>
            <th className='small-data'>Block</th>
            <th>From</th>
            <th>To</th>
            <th className='small-data'>Value</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.uniqueId}>
              <td className='clickable' onClick={transactionClick}>{item.hash}</td>
              <td className='small-data-clickable' onClick={getBlock}>{parseInt(item.blockNum, 16)}</td>
              <td className='clickable' onClick={addressClick}>{item.from}</td>
              <td className='clickable' onClick={addressClick}>{item.to}</td>
              <td className='small-data'>{Number(item.value).toPrecision(5)} {item.asset}</td>
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
        <img src={require('./images/eth-logo.webp')} alt="gas-icon" className="main-logo"></img>
        <h1 onClick={displayHome}>ETH Block Explorer</h1>
      </div>
      <div className='latest-data-container'>
        <div className='data-container'>
          <img src={require('./images/gas-logo.webp')} alt="gas-icon" className="logo"></img>
          <p>Gas - <b id='gasText' style={{ color: getGasColor(gasPrice) }}>{gasPrice} Gwei</b></p>
        </div>
        <div className='data-container'>
          <img src={require('./images/blocks.webp')} alt="block-icon" className="logo"></img>
          <p>Latest Block - <b className='clickable' onClick={getBlock}>{blockNumber}</b></p>
        </div>
      </div>
    </div>
    <div className="search-container">
      <input type="text" className="search-input" id="search-input" value={searchValue} onChange={searchInputUpdate} placeholder="Search Address, Transaction, Block..."></input>
      <button className="search-button" onClick={btnClickSearch}>Search</button>
    </div>
    <div className='main-result' id="resultBody">
      {divContent}
      {trnxContent}
    </div>
    <div className='sub-result'>
    </div>
  </div >;
}

export default App;
