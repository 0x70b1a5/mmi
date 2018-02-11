import React, { Component } from 'react';
import './App.css';
import  Dashboard from './Dashboard';

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">MicroMachine Metrics</h1>
        </header>
        <p className="App-intro">
          For when "just the basics" is more than enough...
        </p>
        <Dashboard />
      </div>
    );
  }
}

export default App;
