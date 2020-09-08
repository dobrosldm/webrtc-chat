import React, {Component} from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './ChatBox.css';

// specify stun server
const config = {
    iceServers: [
        {url: "stun:stun.l.google.com:19302"},
        {url: "stun:stun.stunprotocol.org:3478"}
    ]
};
// specify additional options
const options = {
    optional: [
        {DtlsSrtpKeyAgreement: true}, // to connect Chrome and Firefox
        {RtpDataChannels: true} // Firefox DataChannels API
    ]
};

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

        const video = document.querySelector("video");
        const constraints = {
            video: { facingMode: "user" },
            audio: true
        };

        // get streams from media devices
        navigator.mediaDevices
            .getUserMedia(constraints)
            .then(stream => {
                video.srcObject = stream;
                this.props.socket.emit("broadcaster", this.props.roomID);
            })
            .catch(error => console.error(error));

        // new user wants to join broadcast
        this.props.socket.on("watcher", id => {
            const peerConnection = new RTCPeerConnection(config, options);
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

        this.props.socket.on("answer", (id, description) => {
            console.log("received answer from watcher");
            peerConnections[id].setRemoteDescription(description).catch(console.log);
        });

        this.props.socket.on("candidate", (id, candidate) => {
            peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
        });

        this.props.socket.on("disconnectPeer", id => {
            peerConnections[id].close();
            delete peerConnections[id];
        });
    }

    startWatch() {
        let peerConnection;

        const video = document.querySelector("video");

        this.props.socket.emit("watcher", this.props.roomID);

        this.props.socket.on("offer", (id, description) => {
            console.log("received offer from broadcaster");

            peerConnection = new RTCPeerConnection(config, options);
            peerConnection
                .setRemoteDescription(description)
                .then(() => peerConnection.createAnswer())
                .then(sdp => peerConnection.setLocalDescription(sdp))
                .then(() => {
                    this.props.socket.emit("answer", this.props.roomID, id, peerConnection.localDescription);
                });

            peerConnection.ontrack = event => {
                video.srcObject = event.streams[0];
            };

            peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    this.props.socket.emit("candidate", id, event.candidate);
                }
            };
        });

        this.props.socket.on("candidate", (id, candidate) => {
            peerConnection
                .addIceCandidate(new RTCIceCandidate(candidate))
                .catch(e => console.error(e));
        });

        this.props.socket.on("disconnectPeer", () => {
            peerConnection.close();
        });
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
                            return <li key={index}>{this.props.userName === name ? name + " (me)" : name}</li>
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