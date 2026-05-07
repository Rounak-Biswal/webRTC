let webrtcConfig = {
    iceServers: [
        {
            urls: "stun:stun.relay.metered.ca:80",
        },
        {
            urls: "turn:global.relay.metered.ca:80",
            username: "4744579a97db4d824062d92b",
            credential: "oO1xKMtPNp/dluti",
        },
        {
            urls: "turn:global.relay.metered.ca:80?transport=tcp",
            username: "4744579a97db4d824062d92b",
            credential: "oO1xKMtPNp/dluti",
        },
        {
            urls: "turn:global.relay.metered.ca:443",
            username: "4744579a97db4d824062d92b",
            credential: "oO1xKMtPNp/dluti",
        },
        {
            urls: "turns:global.relay.metered.ca:443?transport=tcp",
            username: "4744579a97db4d824062d92b",
            credential: "oO1xKMtPNp/dluti",
        },
    ]
}

export default webrtcConfig