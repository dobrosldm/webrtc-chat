import React, {Component} from 'react';

import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      users: []
    }
  }

  componentDidMount() {
    fetch('/test')
        .then(res => res.json())
        .then(users => this.setState({users}));
  }

  render() {
    return (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            {this.state.users.map(user =>
              <div>ID: {user.id} - {user.name}</div>
            )}
          </header>
        </div>
    );
  }
}

export default App;
