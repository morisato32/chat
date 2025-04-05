import React, { useState, useRef, useEffect } from "react";
import io from "socket.io-client";
import { MdVideoCall } from "react-icons/md";

const socket = io("http://localhost:5000");

const VideoChat = () => {
    const [userId, setUserId] = useState(() => {
        const dados = sessionStorage.getItem("user");
        return dados ? JSON.parse(dados).id : null;
    });

    const [isRegistered, setIsRegistered] = useState(false);
    const [isCalling, setIsCalling] = useState(false);
    const [incomingCall, setIncomingCall] = useState(null);
    const [targetUserId, setTargetUserId] = useState(null);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);

    useEffect(() => {
        if (!userId) return;

        console.log("👤 Tentando registrar usuário:", userId);
        socket.emit("register", userId);

        socket.on("registered", (data) => {
            if (data.userId === userId) {
                setIsRegistered(true);
                console.log("✅ Usuário registrado com sucesso:", data);
            }
        });

        socket.on("offer", async (data) => {
            console.log("📞 Oferta recebida de:", data.from);
            setIncomingCall(data);
        });

        socket.on("answer", async ({ answer }) => {
            console.log("✅ Resposta recebida. Estabelecendo conexão...");
        
            if (!peerConnection.current) {
                peerConnection.current = createPeerConnection();
            }
        
            const stream = await getLocalMediaStream();
            stream.getTracks().forEach((track) =>
                peerConnection.current.addTrack(track, stream)
            );
        
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
        
            await peerConnection.current.setRemoteDescription(
                new RTCSessionDescription(answer)
            );
        
            setIsCalling(true);
        });
        

        socket.on("candidate", (data) => {
            if (peerConnection.current && data.candidate) {
                peerConnection.current.addIceCandidate(
                    new RTCIceCandidate(data.candidate)
                );
            }
        });

        return () => {
            socket.off("registered");
            socket.off("offer");
            socket.off("answer");
            socket.off("candidate");
        };
    }, [userId]);

    const getLocalMediaStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            return stream;
        } catch (error) {
            console.error("❌ Erro ao acessar câmera/microfone:", error);
            throw error;
        }
    };

    const createPeerConnection = () => {
        const pc = new RTCPeerConnection();

        pc.ontrack = (event) => {
            if (remoteVideoRef.current && event.streams[0]) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate && targetUserId) {
                socket.emit("ice-candidate", {
                    candidate: event.candidate,
                    to: targetUserId,
                });
            }
        };

        return pc;
    };

    const startCall = async (toUserId) => {
        if (!isRegistered || !userId) return;

        console.log("📞 Iniciando chamada para:", toUserId);
        setTargetUserId(toUserId);
        peerConnection.current = createPeerConnection();

        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        socket.emit("call-user", {
            to: toUserId,
            from: userId,
            offer,
        });
    };

    const acceptCall = async () => {
        if (!incomingCall) return;

        console.log("📲 Aceitando chamada de:", incomingCall.from);
        setTargetUserId(incomingCall.from);
        peerConnection.current = createPeerConnection();

        const stream = await getLocalMediaStream();
        stream.getTracks().forEach((track) =>
            peerConnection.current.addTrack(track, stream)
        );
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }

        await peerConnection.current.setRemoteDescription(
            new RTCSessionDescription(incomingCall.offer)
        );

        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);

        socket.emit("answer", {
            answer,
            to: incomingCall.from,
        });

        setIsCalling(true);
        setIncomingCall(null);
    };

    const hangUp = () => {
        console.log("📴 Encerrando chamada...");
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }

        setIsCalling(false);
        setIncomingCall(null);
        setTargetUserId(null);

        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    };

    return (
        <div className="video-chat">
            <video ref={localVideoRef} autoPlay playsInline muted className="local-video" />
            <video ref={remoteVideoRef} autoPlay playsInline className="remote-video" />

            {!isCalling && incomingCall && (
                <div className="incoming-call">
                    <p>📞 Chamada recebida de {incomingCall.from}</p>
                    <button onClick={acceptCall}>Atender</button>
                </div>
            )}

            {!isCalling && !incomingCall && (
                <div
                    className="video-call-icon"
                    onClick={() => startCall("67eae4061e4d90cc313625aa")} // Teste fixo
                >
                    <MdVideoCall size={40} color="#0ff" />
                </div>
            )}

            {isCalling && (
                <button className="hang-up-btn" onClick={hangUp}>
                    Encerrar Chamada
                </button>
            )}
        </div>
    );
};

export default VideoChat;
