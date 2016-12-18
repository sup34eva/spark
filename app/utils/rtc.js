const RTCPeerConnection =
    window.RTCPeerConnection ||
    window.mozRTCPeerConnection ||
    window.webkitRTCPeerConnection;

export function createConnection() {
    return new RTCPeerConnection({
        iceServers: [{
            url: 'stun:stun.services.mozilla.com'
        }, {
            url: 'stun:stun.l.google.com:19302'
        }]
    });
}

export function createCamera() {
    return navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: 'user',
            width: 640,
            height: 480,
            frameRate: {
                ideal: 10,
                max: 15,
            },
        },
        audio: {
            echoCancellation: true,
            channelCount: 1,
        },
    });
}

export function setStream(connection, stream) {
    if (connection.addTrack) {
        stream.getTracks()
            .forEach(track => {
                connection.addTrack(track, stream);
            });
    } else {
        connection.addStream(stream);
    }
}

export function setNegociator(connection, handler) {
    connection.onicecandidate = event => {
        if(event.candidate != null) {
            handler(event.candidate);
        }
    };
}

export async function sendOffer(connection) {
    const description = await connection.createOffer();

    await connection.setLocalDescription(
        description,
    );

    return description;
}

export async function acceptOffer(connection, offer) {
    await connection.setRemoteDescription(
        new RTCSessionDescription(offer)
    );

    const description = await connection.createAnswer();
    await connection.setLocalDescription(
        description,
    );

    return description;
}

export function openConnection(connection, response) {
    return connection.setRemoteDescription(
        new RTCSessionDescription(response)
    );
}

export function handleCandidate(connection, candidate) {
    return connection.addIceCandidate(
        new RTCIceCandidate(candidate)
    );
}
