import { Component } from 'react';

class Dial extends Component {
  constructor(props) {
    super(props);
    this.state = props;
  }

  render() {
    return <div className='dial'>
      <h5>{this.state.name}</h5>
      <pre>{this.state.val}</pre>
    </div>
  }
