import React, {Component} from 'react';

import ChatBox from '../ChatBox/ChatBox';
import RegisterForm from '../RegisterForm/RegisterForm';

import socket from '../../socket';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            joined: false,
            userName: null,
            roomID: null,
            messages: [],
            usersOnline: []
        }

        this.join = this.join.bind(this);
    }

    join(currentUser) {
        this.setState({
            userName: currentUser.userName,
            roomID: currentUser.roomID
        });

        this.setState({ joined: true });
    }

    render() {
        return (
            <div>
                { !this.state.joined ?
                    <RegisterForm join={this.join}/>
                    :
                    <ChatBox />
                }
            </div>
        );
    }
}

export default App;
