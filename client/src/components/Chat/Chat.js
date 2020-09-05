import React, {Component} from 'react';
import socketIOClient from 'socket.io-client';

const ENDPOINT = "http://127.0.0.1:5000";

class Chat extends Component {

    componentDidMount() {
        const socket = socketIOClient(ENDPOINT);
    }

    render() {
        return (
            <div>
                <form>
                    <input />
                    <button>Send</button>
                </form>
            </div>
        );
    }
}

export default Chat;