// @flow
const RTCPeerConnection =
    window.RTCPeerConnection ||
    window.mozRTCPeerConnection ||
    window.webkitRTCPeerConnection;

const RTCSessionDescription = window.RTCSessionDescription;
const RTCIceCandidate = window.RTCIceCandidate;

export type Connection = RTCPeerConnection;
export type Offer = RTCSessionDescription;
export type Answer = RTCSessionDescription;
export type Candidate = RTCIceCandidate;

export function createConnection(): Connection {
    return new RTCPeerConnection({
        iceServers: [{
            url: 'stun:stun.services.mozilla.com',
        }, {
            url: 'stun:stun.l.google.com:19302',
        }],
    });
}

export function createCamera(): Promise<MediaStream> {
    if (navigator.mediaDevices) {
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

    return Promise.reject('MediaDevices is unsupported');
}

export function setStream(connection: Connection, stream: MediaStream) {
    if (connection.addTrack) {
        stream.getTracks()
            .forEach(track => {
                connection.addTrack(track, stream);
            });
    } else {
        connection.addStream(stream);
    }
}

type Negociator = (candidate: Candidate) => void;
export function setNegociator(connection: Connection, handler: Negociator) {
    // eslint-disable-next-line no-param-reassign
    connection.onicecandidate = event => {
        if (event.candidate != null) {
            handler(event.candidate);
        }
    };
}

export async function sendOffer(connection: Connection): Promise<Offer> {
    const description = await connection.createOffer();

    await connection.setLocalDescription(
        description,
    );

    return description;
}

export async function acceptOffer(connection: Connection, offer: Offer): Promise<Answer> {
    await connection.setRemoteDescription(
        new RTCSessionDescription(offer)
    );

    const description = await connection.createAnswer();
    await connection.setLocalDescription(
        description,
    );

    return description;
}

export function openConnection(connection: Connection, answer: Answer) {
    return connection.setRemoteDescription(
        new RTCSessionDescription(answer)
    );
}

export function handleCandidate(connection: Connection, candidate: Candidate) {
    return connection.addIceCandidate(
        new RTCIceCandidate(candidate)
    );
}
