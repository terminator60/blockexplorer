import { Utils } from 'alchemy-sdk';
import React from 'react';

const TableComponent = ({ data }) => {
    const transactionClick = async (e) => {
        const trnxId = e.target.textContent;
        console.log(trnxId);
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

export default TableComponent;
