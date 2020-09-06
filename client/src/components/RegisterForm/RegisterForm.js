import React, {Component} from 'react';

import axios from 'axios';

class RegisterForm extends Component {
    constructor(props) {
        super(props);

        this.state = {
            userName: "",
            roomID: "",
            isJoining: false
        }

        this.handleUserNameInput = this.handleUserNameInput.bind(this);
        this.handleRoomIDInput = this.handleRoomIDInput.bind(this);
        this.onJoin = this.onJoin.bind(this);
    }

    handleUserNameInput(e) {
        this.setState({ userName: e.target.value });
    }

    handleRoomIDInput(e) {
        this.setState({ roomID: e.target.value });
    }

    async onJoin() {
        if (!this.state.userName || !this.state.roomID) {
            return alert("Incorrect data!")
        }

        const currentUser = {
            roomID: this.state.roomID,
            userName: this.state.userName
        }

        this.setState({ isJoining: true });

        this.props.join(currentUser);
    }

    render() {
        return (
            <div>
                <input
                    type="text"
                    placeholder="Your name"
                    value={this.state.userName}
                    onChange={ this.handleUserNameInput }
                />
                <input
                    type="text"
                    placeholder="Room ID"
                    value={this.state.roomID}
                    onChange={ this.handleRoomIDInput }
                />
                <button
                    onClick={this.onJoin}
                    disabled={this.state.isJoining}
                >
                    { this.state.isJoining ? 'Joining...' : 'Join' }
                </button>
            </div>
        );
    }
}

export default RegisterForm;
