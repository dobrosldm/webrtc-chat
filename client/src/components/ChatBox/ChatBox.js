import React, {Component} from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './ChatBox.css';

class ChatBox extends Component {
    constructor(props) {
        super(props);

        this.state = {
            message: ""
        };

        this.handleMessageInput = this.handleMessageInput.bind(this);
        this.handleUserKeyPress = this.handleUserKeyPress.bind(this);
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

    handleUserKeyPress(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            this.handleSend();
        }
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
                    <b>Invite link (this computer users only) - {'http://localhost:3000/'+this.props.roomID}</b>
                </div>
                <div className="chatTitle">
                    <b>Chat room: <i>{this.props.roomID}</i></b>
                </div>
                <div className="onlineBar">
                    <b>Users online ({this.props.usersOnline.length}):</b>
                    <ul>
                        {this.props.usersOnline.map( (name, index) => {
                            return <li key={index}>{name}</li>
                        })}
                    </ul>
                </div>
                <div className="inputAndMessages">
                    <div className="messagesBox">
                        {this.props.messages.map( (messageObj, index) => {
                            return <div className="wholeMessage" key={index}>
                                <div className="message">{messageObj.message}</div>
                                <div className="info">
                                    <i>
                                        <span>From </span>
                                        <u>{
                                            messageObj.userName === this.props.userName
                                                ? "me"
                                                : messageObj.userName
                                        }</u>
                                        <span> on </span>
                                        <u>{messageObj.time}</u>
                                    </i>
                                </div>
                            </div>
                        })}
                        <div ref={(el) => { this.messagesEnd = el; }} />
                    </div>
                    <div className="messageForm">
                        <textarea
                            className="form-control messageInput"
                            rows="2"
                            value={this.state.message}
                            onKeyPress={this.handleUserKeyPress}
                            onChange={this.handleMessageInput}
                        />
                        <button
                            className="btn bttn btn-outline-primary"
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