import React, {Component} from 'react';

import ChatBox from '../ChatBox/ChatBox';
import RegisterForm from '../RegisterForm/RegisterForm';

import socket from '../../socket';
import axios from 'axios';

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

        socket.on('update_users', users => {
           this.setState({ usersOnline: users });
        });
    }

    async join(currentUser) {
        this.setState({
            userName: currentUser.userName,
            roomID: currentUser.roomID
        });

        socket.emit('join_room', currentUser);

        const room = await axios.get(`/room/${currentUser.roomID}`);

        this.setState({
            messages: room.data.messages,
            usersOnline: room.data.users,
            joined: true
        });
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
