import React, {Component} from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './ChatBox.css';

import socket from '../../socket';

// specify stun servers
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
            message: "",
            anyoneBroadcasting: false,
            broadcasterID: null,
            broadcasterName: null,
            video: false
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

        // request to check if somebody is already broadcasting
        socket.emit("broadcastInfo", this.props.roomID);

        socket.on("broadcastInfo", info => {
            this.setState({
                anyoneBroadcasting: info.broadcasting,
                broadcasterID: info.broadcasterID,
                broadcasterName: info.broadcasterName
            });
        });
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    handleMessageInput(e) {
        this.setState({ message: e.target.value });
    }

    // sending message on "Enter" press
    handleUserKeyPress(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            this.handleSend();
        }
    }

    handleSend() {
        // check if message is not empty
        if (this.state.message.trim()) {
            this.props.sendMessage(this.state.message.trim());
            this.setState({ message: "" });
        }
    }

    startBroadcast() {
        if (!this.state.video) {
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
                .then(stream => setupSubscriptions(stream))
                .catch(error => console.error(error));

            // executes only if media access was granted
            const setupSubscriptions = stream => {
                this.setState({video: true});
                video.srcObject = stream;

                // update broadcaster credits
                socket.emit("broadcaster", this.props.roomID, this.props.userName);
                socket.emit("broadcastInfo", this.props.roomID);

                // new user wants to join broadcast
                socket.on("watcher", id => {
                    const peerConnection = new RTCPeerConnection(config, options);
                    peerConnections[id] = peerConnection;

                    let stream = video.srcObject;
                    // add media tracks to peer
                    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

                    peerConnection.onicecandidate = event => {
                        if (event.candidate) {
                            socket.emit("candidate", id, event.candidate);
                        }
                    };

                    peerConnection
                        .createOffer()
                        .then(sdp => peerConnection.setLocalDescription(sdp))
                        .then(() => {
                            socket.emit("offer", this.props.roomID, id, peerConnection.localDescription);
                        });
                });

                // receive watcher's description
                socket.on("answer", (id, description) => {
                    peerConnections[id].setRemoteDescription(description).catch(console.log);
                });

                // receive watcher's candidate
                socket.on("candidate", (id, candidate) => {
                    peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
                });

                socket.on("disconnectPeer", id => {
                    if (peerConnections[id]) {
                        this.setState({video: false});
                        peerConnections[id].close();
                        delete peerConnections[id];
                    }
                });
            }
        } else {
            alert("Broadcast was already turned on");
        }
    }

    startWatch() {
        if (!this.state.video) {
            let peerConnection;
            const video = document.querySelector("video");

            this.setState({video: true});
            // notify broadcaster to join
            socket.emit("watcher", this.props.roomID);

            // receive offer from broadcaster
            socket.on("offer", (id, description) => {
                peerConnection = new RTCPeerConnection(config, options);
                peerConnection
                    .setRemoteDescription(description)
                    .then(() => peerConnection.createAnswer())
                    .then(sdp => peerConnection.setLocalDescription(sdp))
                    .then(() => {
                        socket.emit("answer", this.props.roomID, id, peerConnection.localDescription);
                    });

                peerConnection.ontrack = event => {
                    video.srcObject = event.streams[0];
                };

                peerConnection.onicecandidate = event => {
                    if (event.candidate) {
                        socket.emit("candidate", id, event.candidate);
                    }
                };
            });

            // receive broadcaster's candidate
            socket.on("candidate", (id, candidate) => {
                peerConnection
                    .addIceCandidate(new RTCIceCandidate(candidate))
                    .catch(e => console.error(e));
            });

            socket.on("disconnectPeer", () => {
                this.setState({video: false});
                peerConnection.close();
            });
        } else {
            alert("Broadcast was already turned on");
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
                        {this.props.usersOnline.map( (arr, index) => {
                            return <li key={index}>{socket.id === arr[0] ? arr[1] + " (me)" : arr[1]}</li>
                        })}
                    </ul>
                    <div className="broadcastBox">
                        {this.state.anyoneBroadcasting ?
                            <button
                                className="btn btn-info"
                                onClick={this.startWatch}
                            >
                                Watch <i>{this.state.broadcasterName}</i>'s broadcast
                            </button>
                            :
                            <button
                                className="btn btn-warning"
                                onClick={this.startBroadcast}
                            >
                                Start broadcast
                            </button>
                        }
                        <br/><video playsInline autoPlay />
                    </div>
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
                                            messageObj.userName === this.props.userName && messageObj.senderID === socket.id
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