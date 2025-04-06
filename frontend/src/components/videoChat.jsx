import React, { useState, useRef, useEffect } from "react";
import io from "socket.io-client";
import { MdVideoCall } from "react-icons/md";
import styles from '../components/videoChat.module.css'

const socket = io("http://localhost:5000");

const VideoChat = () => {
    const [userId, setUserId] = useState(() => {
        const dados = sessionStorage.getItem("user");
        return dados ? JSON.parse(dados).id : null;
    });

    const [isRegistered, setIsRegistered] = useState(false);
    const [isCalling, setIsCalling] = useState(false);
    const [incomingCall, setIncomingCall] = useState(null);
    const targetUserIdRef = useRef(null);
   
    const [callStatus, setCallStatus] = useState(''); // Estado para a mensagem de status

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);

    useEffect(() => {
        if (!userId) return;

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
                console.error("❌ peerConnection não definida.");
                return;
            }

            await peerConnection.current.setRemoteDescription(
                new RTCSessionDescription(answer)
            );

            // ✅ Exibir vídeo local após aceitar
            const stream = await getLocalMediaStream();
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            setIsCalling(true);
            setCallStatus('Atendendo...');
        });

        socket.on("ice-candidate", (data) => {
            console.log("📡 ICE recebido:", data);
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
            socket.off("ice-candidate");
        };
    }, [userId]);

    const getLocalMediaStream = async () => {
        try {
            return await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
        } catch (error) {
            console.error("❌ Erro ao acessar mídia:", error);
            throw error;
        }
    };

    const createPeerConnection = () => {
        const pc = new RTCPeerConnection();
    
        pc.ontrack = (event) => {
            console.log("📺 Track recebida!", event.streams[0]);
    
            if (remoteVideoRef.current && event.streams[0]) {
                const remoteVideo = remoteVideoRef.current;
    
                if (remoteVideo.srcObject !== event.streams[0]) {
                    remoteVideo.srcObject = event.streams[0];
    
                    remoteVideo
                        .play()
                        .catch((err) =>
                            console.warn("⚠️ Erro ao reproduzir vídeo remoto:", err)
                        );
                }
            }
        };
    
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                const target = targetUserIdRef.current;
                if (!target) {
                    console.warn("🚫 ICE gerado, mas targetUserId é null");
                    return;
                }
    
                console.log("🎯 ICE gerado:", event.candidate);
                socket.emit("ice-candidate", {
                    candidate: event.candidate,
                    to: target,
                });
            } else {
                console.log("✅ Final dos ICE candidates");
            }
        };
    
        return pc;
    };
    

    const startCall = async (toUserId) => {
        if (!isRegistered || !userId) return;
       
        targetUserIdRef.current = toUserId;
        
        setCallStatus(`Ligando...`);
        peerConnection.current = createPeerConnection();
    
        const stream = await getLocalMediaStream();
        stream.getTracks().forEach((track) =>
            peerConnection.current.addTrack(track, stream)
        );
    
        // ❌ Não exibe vídeo local ainda — só após o answer
    
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
    

        targetUserIdRef.current = incomingCall.from;
        
        setCallStatus(`Ligando...`);
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
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }
    
        setIsCalling(false);
       
        setCallStatus('');
        setIncomingCall(null);
        targetUserIdRef.current = null;
    
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
