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
        this.startBroadcast = this.startBroadcast.bind(this);
        this.startWatch = this.startWatch.bind(this);
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

    startBroadcast() {
        // all connected peers
        const peerConnections = {};
        // specify stun server
        const config = {
            iceServers: [
                //{url: "stun:23.21.150.121"},
                {url: "stun:stun.l.google.com:19302"}
            ]
        };

        const video = document.querySelector("video");
        const constraints = {
            video: { facingMode: "user" },
            audio: true,
        };

        // get stream from media device
        navigator.mediaDevices
            .getUserMedia(constraints)
            .then(stream => {
                video.srcObject = stream;
                this.props.socket.emit("broadcaster", this.props.roomID);
            })
            .catch(error => console.error(error));

        this.props.socket.on("watcher", id => {
            const peerConnection = new RTCPeerConnection(config);
            peerConnections[id] = peerConnection;

            let stream = video.srcObject;
            stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

            peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    this.props.socket.emit("candidate", id, event.candidate);
                }
            };

            peerConnection
                .createOffer()
                .then(sdp => peerConnection.setLocalDescription(sdp))
                .then(() => {
                    this.props.socket.emit("offer", this.props.roomID, id, peerConnection.localDescription);
                });
        });
    }

    startWatch() {
        let peerConnection;
        const config = {
            iceServers: [
                //{url: "stun:23.21.150.121"},
                {url: "stun:stun.l.google.com:19302"}
            ]
        };

        const video = document.querySelector("video");
        const constraints = {
            video: { facingMode: "user" },
            audio: true,
        };

        this.props.socket.emit("watcher", this.props.roomID);

    }

    render() {
        return (
            <div className="chatBox">
                <button className="btn btn-warning" onClick={this.startBroadcast}>Start video-sharing</button>
                <button className="btn btn-info" onClick={this.startWatch}>I'm watcher</button>
                <video playsInline autoPlay></video>
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