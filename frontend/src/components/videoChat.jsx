import React, { useState, useRef, useEffect } from "react";
import io from "socket.io-client";
import { MdVideoCall, MdCallEnd,MdMic, MdMicOff } from "react-icons/md";
import styles from '../components/videoChat.module.css'

const socket = io("http://localhost:5000");

const VideoChat = ({ userName }) => {
    const [userId, setUserId] = useState(() => {
        const dados = sessionStorage.getItem("user");
        return dados ? JSON.parse(dados).id : null;

    });
    const [isMuted, setIsMuted] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [isCalling, setIsCalling] = useState(false);
    const [incomingCall, setIncomingCall] = useState(null);
    const targetUserIdRef = useRef(null);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);

    const toggleMute = () => {
        const stream = localVideoRef.current.srcObject;
        if (stream) {
          stream.getAudioTracks().forEach(track => (track.enabled = isMuted));
          setIsMuted(!isMuted);
        }
      };

    useEffect(() => {
        if (!userId) return;

        socket.emit("register", userId);

        socket.on("registered", (data) => {
            if (data.userId === userId) {
                setIsRegistered(true);
                console.log("✅ Usuário registrado:", data);
            }
        });

        socket.on("offer", async (data) => {
            console.log("📞 Oferta recebida de:", data.from, "nome:", data.userName);
            setIncomingCall(data);
        });

        socket.on("answer", async ({ answer }) => {
            console.log("✅ Resposta recebida");

            if (!peerConnection.current) {
                console.error("❌ peerConnection não definida.");
                return;
            }

            await peerConnection.current.setRemoteDescription(
                new RTCSessionDescription(answer)
            );

            setIsCalling(true);
        });

        socket.on("ice-candidate", (data) => {
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
            console.error("Erro ao acessar mídia:", error);
            throw error;
        }
    };

    const createPeerConnection = () => {
        const pc = new RTCPeerConnection();

        pc.ontrack = (event) => {
            console.log("🎥 Track recebida", event.streams[0]);
            if (remoteVideoRef.current && event.streams[0]) {
                remoteVideoRef.current.srcObject = event.streams[0];
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                const target = targetUserIdRef.current;
                if (!target) {
                    console.warn("ICE gerado, mas targetUserId é null");
                    return;
                }

                socket.emit("ice-candidate", {
                    candidate: event.candidate,
                    to: target,
                });
            }
        };

        return pc;
    };

    const startCall = async (toUserId) => {
        if (!isRegistered || !userId) return;

        targetUserIdRef.current = toUserId;
        peerConnection.current = createPeerConnection();

        const stream = await getLocalMediaStream();

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }

        stream.getTracks().forEach((track) =>
            peerConnection.current.addTrack(track, stream)
        );

        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        socket.emit("call-user", {
            to: toUserId,
            from: userId,
            offer,
            userName, // <-- inclui isso
        });

        setIsCalling(true);
    };

    const acceptCall = async () => {
        if (!incomingCall) return;

        targetUserIdRef.current = incomingCall.from;
        peerConnection.current = createPeerConnection();

        const stream = await getLocalMediaStream();

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }

        stream.getTracks().forEach((track) =>
            peerConnection.current.addTrack(track, stream)
        );

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
        setIncomingCall(null);
        targetUserIdRef.current = null;

        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    };

    return (
        <div className={styles.video_chat}>
            {/* Ícone para iniciar chamada (remetente) */}
            {!isCalling && !incomingCall && (
                <div className={styles.video_call_icon} onClick={() => startCall("67f6dc26d956a177dc1fd16e")}>
                    <MdVideoCall />
                </div>
            )}

            {/* Chamada recebida (destinatário) */}
            {!isCalling && incomingCall && (
                <div className={styles.incoming_call}>
                    <p>📞 Chamada recebida de {incomingCall?.userName}</p>
                    <button onClick={acceptCall}>Atender</button>
                    <button onClick={hangUp} className="hang-up-btn">Encerrar Chamada</button>
                </div>
            )}

            {/* Overlay de video chamada ativa */}
            <div className={styles.video_overlay} style={{ display: isCalling ? "flex" : "none" }}>

                <video className={styles.remote_video} autoPlay playsInline ref={remoteVideoRef} />
                <video className={styles.local_video} autoPlay muted playsInline ref={localVideoRef} />

                {/* Controles flutuantes estilo Zoom */}
                <div className={styles.video_controls}>
                    <button className={styles.control_btn} onClick={toggleMute}>
                        {isMuted ? <MdMicOff /> : <MdMic />}
                    </button>
                    <button className={styles.control_btn} onClick={hangUp}>
                        <MdCallEnd />
                    </button>
                </div>
            </div>

        </div>


    );

};

export default VideoChat;
