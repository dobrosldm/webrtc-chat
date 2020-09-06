import React, {Component} from 'react';

class ChatBox extends Component {
    render() {
        return (
            <div>
                <div className="chatTitle">
                    <h1>Chat #0</h1>
                </div>
                <div className="onlineBar">
                    <h3>Online:</h3>
                </div>
                <div className="messagesBox">
                    <h2>Messages</h2>
                </div>
                <div className="messageForm">
                    <input />
                    <button>Send</button>
                </div>
            </div>
        );
    }
}

export default ChatBox;