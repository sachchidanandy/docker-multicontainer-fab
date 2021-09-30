import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {

  const [seenIndexes, setIndexes] = useState([]);
  const [values, setValues] = useState({});
  const [input, setInput] = useState('');

  const fetchValues = async () => {
    const values = await axios.get('/api/values/current');

    setValues(values.data);
  };

  const fetchIndexes = async () => {
    const indexes = await axios.get('/api/values/all');

    setIndexes(indexes.data);
  };

  const handleInputChange = event => {
    setInput(event.target.value);
  };

  const handleFormSubmit = async event => {
    event.preventDefault();
    if (!input) return null;
    await axios.post('/api/values', {index: input});
    setInput('');
  };

  const renderIndices = () => {
    if (!seenIndexes || !seenIndexes.length) return null;

    return seenIndexes.map(({number}) => number).join(', ');
  };

  const renderCalculatedValues = () => {
    if (!values || !Object.keys(values).length) return null;

    return Object.keys(values).map((key, index) => (<span key={index}>For index {key} I calculated {values[key]}</span>));
  };

  useEffect(() => {
    fetchIndexes();
    fetchValues();
  }, []);

  return (
    <div className="App">
      <div className='form-container'>
        <form onSubmit={handleFormSubmit}>
          <label>Enter your index </label>
          <input name='index-input' onChange={handleInputChange} value={input} type='number'/>
          <button type='submit' style={{marginLeft: 5}}>Submit</button>
        </form>
      </div>

      <div className='index-container'>
        <h2>Indexes I have seen:</h2>
        {
          renderIndices()
        }
      </div>

      <div className='calculated-value-container'>
        <h2>Calculated values:</h2>
        {
          renderCalculatedValues()
        }
      </div>
    </div>
  );
}

export default App;
