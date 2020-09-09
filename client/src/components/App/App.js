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
            usersOnline: null
        };

        this.join = this.join.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
    }

    componentDidMount() {
        socket.on('update_users', users => {
            this.setState({ usersOnline: users });
        });

        socket.on('update_messages', (messages) => {
            this.setState({ messages });
        });
    }

    async join(currentUser) {
        this.setState({
            userName: currentUser.userName,
            roomID: currentUser.roomID
        });

        socket.emit('join_room', currentUser);

        // initial request to join (or create and join) a room
        const room = await axios.get(`/room/${currentUser.roomID}`);

        this.setState({
            messages: room.data.messages,
            usersOnline: room.data.users,
            joined: true
        });
    }

    sendMessage(message) {
        const messageObj = {
            roomID: this.state.roomID,
            userName: this.state.userName,
            message
        };

        socket.emit('room_new_message', messageObj);
    }

    render() {
        return (
            <div>
                { !this.state.joined ?
                    <RegisterForm join={this.join} />
                    :
                    <ChatBox {...this.state} sendMessage={this.sendMessage} />
                }
            </div>
        );
    }
}

export default App;
