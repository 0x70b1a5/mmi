import React, { Component } from 'react';
import Progress from 'react-progressbar';

class Dial extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      pct: true 
    };
  }

  togglePct() {
    this.setState({ pct: !this.state.pct });
  }

  render() {
    const pct = <p>{Math.round(this.state.data.val * 1000) / 10}%</p>;
    const exact = <p>
      {this.state.data.timeInCycle} / {this.state.data.allTime}
    </p>;

    const red = Math.round(255 - this.state.data.val * 255);
    return <div onClick={this.togglePct.bind(this)} 
        key={this.state.id} 
        className='dial'>
      <a style={{ color: `rgb(${red}, 0, 24)` }}
         className={this.state.pct ? 'large' : 'small'}>
        {this.state.pct ? pct : exact}
      </a>
      <Progress completed={this.state.data.val * 100} />
      <h5>{this.state.data.name}</h5>
    </div>
  }
}

export default Dial;
