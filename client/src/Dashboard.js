import React. { Component } from 'react';
import Dial from './Dial';
import moment from 'moment';

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

  getData() {
    this.timer = setInterval(() => {
      this.setState({ loading: true });

      const start = moment().subtract(7, 'days').startOf('day');
      axios.post('/data', {
        endpoint: '/reports/production/',
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
    }, this.state.dataSaver ? 300000 : 60000);
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
    if (!valid) return { error: 'MicroMachine Metrics data was invalid!' };

    const shifts = Object.keys(data.entities.shift);
    const weekend1 = shifts.find(shift => (
      data.entities.shift[shift].name.indexOf('Weekend First') !== -1));
    const weekend2 = shifts.find(shift => (
      data.entities.shift[shift].name.indexOf('Weekend Second') !== -1));
    const weekday1 = shifts.find(shift => (
      data.entities.shift[shift].name.match(/^First$/));
    const weekday2 = shifts.find(shift => (
      data.entities.shift[shift].name.match(/^Second$/));

    console.log(shifts, weekend1, weekend2, weekday1, weekday2);

    

    return {
      error: null,
      data: [
        weekend1, weekend2, weekday1, weekday2
      ].map(id => data.items.map(day => {
        const shift = day.items.find(item => item.entity.id === id);
        return {
          name: data.entities.shift[id].name,
          ratio: shift && shift.aggregate.timeInCycle/shift.aggregate.allTime || -1
        };
      }))
    }
  }

  render() {
    const report = this.calcReport();
    if (!this.state.loading && report.error || this.state.error) return <div className='error'>
      {report.error || this.state.error}
    </div>;

    const dials = report.data.map(dial => dial.filter(d => d.ratio !== -1)
    .map((val, i, arr) => val.ratio/arr.length)
    .reduce((a, b) => a + b, 0)
    .map(val => <Dial data={{ name: dial.name, val }} />));

    const dash = this.state.loading 
      ? <div className='load'> Loading... </div>
      : <div className='dash'> {dials} </div>

    return dash;
  }
