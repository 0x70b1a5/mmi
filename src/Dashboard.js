import React, { Component } from 'react';
import Dial from './Dial';
import moment from 'moment';
import axios from 'axios';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      error: '',
      dataSaver: !!props.dataSaver,
      loading: true,
    };

    this.getData();
  }

  fetch() {
    if (!this.state.loading) this.setState({ loading: true });

    const start = moment().subtract(7, 'days').startOf('day');
    axios({
      url: 'https://api-demo.machinemetrics.com/reports/production', 
      method: 'post',
      headers: { 'Authorization': process.env.REACT_APP_MM_AUTH },
      data: {
        start: start.toISOString(),
        end: start.add(7, 'days').toISOString(),
        data: [
          { metric: 'timeInCycle' },
          { metric: 'allTime' }
        ],
        groupBy: [
          { group: 'day' },
          { group: 'shift' } 
        ]
      }
    }).then(res => {
      this.setState({ 
        data: res.data,
        loading: false,
      });
    }).catch(error => {
      this.setState({ 
        error,
        loading: false,
      });
    });
  }

  getData() {
    this.fetch();
    this.timer = setInterval(() => this.fetch, this.state.dataSaver ? 300000 : 60000);
  }

  componentWillUpdate(nextProps, nextState) {
    clearInterval(this.timer);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  calcReport() {
    const data = this.state.data;
    const valid = data && data.entities && data.entities.shift;
    if (!valid) return { error: 'MicroMachine Metrics data was invalid! Please make sure to set REACT_APP_MM_AUTH="Bearer [token]" in your project root .env file. ' };

    const shifts = Object.keys(data.entities.shift);
    const weekend1 = shifts.find(shift => (
      data.entities.shift[shift].name.indexOf('Weekend First') !== -1));
    const weekend2 = shifts.find(shift => (
      data.entities.shift[shift].name.indexOf('Weekend Second') !== -1));
    const weekday1 = shifts.find(shift => (
      data.entities.shift[shift].name.match(/^First$/)));
    const weekday2 = shifts.find(shift => (
      data.entities.shift[shift].name.match(/^Second$/)));

    return {
      error: null,
      data: [
        weekend1, weekend2, weekday1, weekday2
      ].map(id => data.items.map(day => {
        const shift = day.items.find(item => item.entity.id === id);
        return {
          name: data.entities.shift[id].name,
          timeInCycle: (shift && shift.aggregate.timeInCycle) || 0,
          allTime: (shift && shift.aggregate.allTime) || 0,
          ratio: (shift && shift.aggregate.timeInCycle/shift.aggregate.allTime) || -1
        };
      }))
    }
  }

  render() {
    if (this.state.loading) return <div className='load'> Loading... </div>;
    const report = this.calcReport();
    if (report.error || !report.data || this.state.error) return <div className='error'>
      {report.error || this.state.error}
    </div>;

    const dials = report.data.map(dial => dial.filter(d => d.ratio !== -1)
      .map((d, i, arr) => ({ 
        name: d.name, 
        timeInCycle: d.timeInCycle,
        allTime: d.allTime,
        val: d.ratio/arr.length }))
      .reduce((a, b) => ({ 
        name: b.name, 
        timeInCycle: a.timeInCycle + b.timeInCycle,
        allTime: a.allTime + b.allTime,
        val: a.val + b.val }), { timeInCycle: 0, allTime: 0, val: 0 }))
    .map((dial, i) => <Dial key={i} data={dial} />);

    return <div className='dash'> {dials} </div>;
  }
}

export default Dashboard;
