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

    // autoscroll to bottom when new message appears
    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    }

    componentDidMount() {
        this.scrollToBottom();
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    handleMessageInput(e) {
        this.setState({ message: e.target.value });
    }

    // sending message if it is not empty
    handleSend() {
        if (this.state.message) {
            this.props.sendMessage(this.state.message);
            this.setState({ message: "" });
        }
    }

    render() {
        return (
            <div className="chatBox">
                <div className="inviteBar">
                    <b>Invite users to chat by copying this link - {'http://localhost:3000/'+this.props.roomID}</b>
                </div>
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
                <div className="inputAndMessages">
                    <div className="messagesBox">
                        {this.props.messages.map( (messageObj, index) => {
                            return <div key={messageObj.time}>
                                <div>{messageObj.message}</div>
                                <div>{messageObj.userName +" on " + messageObj.time}</div>
                            </div>
                        })}
                        <div ref={(el) => { this.messagesEnd = el; }} />
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
            </div>
        );
    }
}

export default ChatBox;