import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Form, Button, Card, Image } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import avaSvg from './ava.svg';
import 'bootstrap/dist/js/bootstrap.min.js';
import PriceFeed from './artifacts/contracts/PriceFeed.sol/PriceFeed.json';

function App() {
  const [storedPrice, setStoredPrice] = useState('');
  const [selectedPair, setSelectedPair] = useState('');
  const [clickedRadioButtonId, setClickedRadioButtonId] = useState('');

  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(contractAddress, PriceFeed.abi, provider);

  const exchangeRates = {
    'BTC/USD': 50000,
    'ETH/USD': 2000,
    'LINK/USD': 25,
    'BTC/ETH': 25,
  };

  const getPair = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask is not installed.');
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length === 0) {
        throw new Error('No accounts found in MetaMask.');
      }

      const account = accounts[0];
      const contractWithSigner = contract.connect(provider.getSigner());

      const transaction = await contractWithSigner.updatePrice(clickedRadioButtonId);
      await transaction.wait();

      const latestFetchedPrice = await contract.getLastFetchedPrice(clickedRadioButtonId);
      setStoredPrice('$' + (parseInt(latestFetchedPrice) / 100000000).toFixed(2));
    } catch (error) {
      console.error('Error fetching pair:', error.message);
    }
  };

  const handleSwap = async () => {
    try {
      let swapResult;
      switch (selectedPair) {
        case 'BTC/USD':
          swapResult = (storedPrice * exchangeRates['ETH/USD']) / exchangeRates[selectedPair];
          break;
        case 'ETH/USD':
          swapResult = (storedPrice * exchangeRates['BTC/USD']) / exchangeRates[selectedPair];
          break;
        case 'LINK/USD':
          swapResult = (storedPrice * exchangeRates['BTC/ETH']) / exchangeRates[selectedPair];
          break;
        case 'BTC/ETH':
          swapResult = (storedPrice * exchangeRates['LINK/USD']) / exchangeRates[selectedPair];
          break;
        default:
          throw new Error('Invalid pair selected.');
      }
      setStoredPrice('$' + swapResult.toFixed(2));
    } catch (error) {
      console.error('Error swapping pair:', error.message);
    }
  };

  const handleReset = () => {
    setStoredPrice('');
    setSelectedPair('');
    setClickedRadioButtonId('');
  };

  const handleChange = (e) => {
    setStoredPrice('');
    setSelectedPair(e.target.value);
    setClickedRadioButtonId(e.target.id);
  };

  return (
    <div className='container'>
      <Card className='card mt-5 shadow'>
        <Card.Header>
          <Image src={avaSvg} width={170} height={55} fluid className='mb-4 mx-auto d-block' />
          <h4 className='text-center text-white mb-0'>Currency Converter</h4>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={(e) => e.preventDefault()}>
            <div className='form-group'>
              {['BTC/USD', 'ETH/USD', 'LINK/USD', 'BTC/ETH'].map((pair, index) => (
                <div key={index} className='custom-radio'>
                  <input
                    type='radio'
                    id={`pair-${index}`}
                    value={pair}
                    checked={selectedPair === pair}
                    onChange={handleChange}
                  />
                  <label htmlFor={`pair-${index}`}>{pair}</label>
                </div>
              ))}
            </div>
            <div className='d-flex justify-content-center mt-4'>
              <Button variant='primary' size='sm' onClick={getPair}>
                Get Price
              </Button>
              <Button variant='success' size='sm' onClick={handleSwap} className='ml-2'>
                Swap
              </Button>
              <Button variant='danger' size='sm' onClick={handleReset} className='ml-2'>
                Reset
              </Button>
            </div>
          </Form>
        </Card.Body>
        <Card.Footer>
          {storedPrice !== '' && (
            <div className='result'>
              <p className='mb-0'>{selectedPair} ➡ {storedPrice}</p>
            </div>
          )}
        </Card.Footer>
      </Card>
    </div>
  );
}

export default App;
