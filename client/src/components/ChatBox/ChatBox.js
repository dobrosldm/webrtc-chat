import React, {Component} from 'react';

import './ChatBox.css';

class ChatBox extends Component {
    constructor(props) {
        super(props);

        this.state = {
            message: ""
        };

        this.handleMessageInput = this.handleMessageInput.bind(this);
        this.handleSend = this.handleSend.bind(this);
    }

    handleMessageInput(e) {
        this.setState({ message: e.target.value });
    }

    handleSend() {
        this.props.sendMessage(this.state.message);
        this.setState({ message: "" });
    }

    render() {
        return (
            <div className="chatBox">
                <div className="chatTitle">
                    <b>Room: {this.props.roomID}</b>
                </div>
                <div className="onlineBar">
                    <b>Online ({this.props.usersOnline.length}):</b>
                    <ul>
                        {this.props.usersOnline.map( (name, index) => {
                            return <li key={index}>{name}</li>
                        })}
                    </ul>
                </div>
                <div className="messagesBox">
                    <h2>Messages</h2>
                    {this.props.messages.map( (messageObj, index) => {
                        return <div>
                            <div>{messageObj.message}</div>
                            <div>{messageObj.userName +" on " + messageObj.time}</div>
                        </div>
                    })}
                </div>
                <div className="messageForm">
                    <textarea
                        className="messageInput"
                        rows="3"
                        value={this.state.message}
                        onChange={this.handleMessageInput}
                    />
                    <button
                        className="button"
                        onClick={this.handleSend}
                    >
                        Send
                    </button>
                </div>
            </div>
        );
    }
}

export default ChatBox;