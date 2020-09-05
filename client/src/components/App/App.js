import React, {Component} from 'react';

import Chat from '../Chat/Chat';

class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
        <div className="App">
          <Chat />
        </div>
    );
  }
}

export default App;
