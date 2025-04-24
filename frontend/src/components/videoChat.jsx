import React, { useState, useRef, useEffect } from "react";
import io from "socket.io-client";
import {
  MdVideoCall,
  MdCallEnd,
  MdMic,
  MdMicOff,
  MdFullscreenExit,
  MdFullscreen,
  MdMoreVert,
} from "react-icons/md";
import styles from "../components/videoChat.module.css";

const socket = io("http://localhost:5000");

const VideoChat = ({ userName, selectedUserId }) => {
  const [userId, setUserId] = useState(() => {
    const dados = sessionStorage.getItem("user");
    return dados ? JSON.parse(dados).id : null;
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);
  const targetUserIdRef = useRef(null);
  const ringAudioRef = useRef(null);

  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);
  const toggleOptions = () => setShowOptions((prev) => !prev);

  const toggleMute = () => {
    const stream = localVideoRef.current?.srcObject;
    if (stream) {
      stream.getAudioTracks().forEach((track) => (track.enabled = isMuted));
      setIsMuted(!isMuted);
    }
  };

  const validateCallState = (step) => {
    console.log(`[DEBUG] [${step}] userId:`, userId);
    console.log(`[DEBUG] [${step}] targetUserId:`, targetUserIdRef.current);
    console.log(`[DEBUG] [${step}] peerConnection:`, peerConnection.current);
  };

  useEffect(() => {
    if (!userId) return;

    socket.emit("register", userId);

    // socket.on("registered", (data) => {
    //   if (data.userId === userId) {
    //     setIsRegistered(true);
    //     console.log("✅ Usuário registrado:", data);
    //   }
    // });

    socket.on("offer", (data) => {
      console.log("📞 [OFFER RECEBIDO]", data);
      setIncomingCall(data);
    });

    socket.on("answer", async ({ answer }) => {
      validateCallState("RECEIVED_ANSWER");
      if (!peerConnection.current) return;

      try {
        if (peerConnection.current.signalingState !== "stable") {
          console.warn("⚠️ Estado de sinalização instável.");
        }

        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
        setIsCalling(true);
      } catch (err) {
        console.error("❌ Erro ao aplicar resposta:", err);
      }
    });

    socket.on("ice-candidate", (data) => {
      validateCallState("RECEIVED_ICE");
      if (peerConnection.current && data.candidate) {
        peerConnection.current
          .addIceCandidate(new RTCIceCandidate(data.candidate))
          .catch(console.error);
      }
    });

    socket.on("hang-up", () => {
      console.log("📴 Chamada encerrada pelo outro usuário");
      endCall();
      alert("📴 A chamada foi encerrada pelo outro usuário.");
    });

    return () => {
      socket.off("registered");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("hang-up");
    };
  }, [userId]);

  useEffect(() => {
    if (incomingCall) {
      ringAudioRef.current?.play().catch(console.error);
    } else {
      ringAudioRef.current?.pause();
      ringAudioRef.current.currentTime = 0;
    }
  }, [incomingCall]);

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
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      const target = targetUserIdRef.current;
      if (event.candidate && target) {
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

    peerConnection.current = createPeerConnection();

    if (!peerConnection.current) {
      console.error("[❌] Falha ao criar peerConnection");
      return;
    }

   

    // ✅ Garante que o target está definido corretamente
    if (!toUserId) {
      console.warn("[❌] Nenhum destinatário especificado para a chamada.");
      return;
    }

    targetUserIdRef.current = toUserId;
    validateCallState("START_CALL");

   

    // Obter o stream de mídia local
    const stream = await getLocalMediaStream();

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    stream.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, stream);
    });

    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);

    socket.emit("call-user", {
      to: toUserId,
      from: userId,
      offer,
      userName,
    });

    setIsCalling(true);
    console.log("[📞] Chamada iniciada com:", toUserId);
  };

  const acceptCall = async () => {
    if (!incomingCall) return;

    ringAudioRef.current?.pause();
    ringAudioRef.current.currentTime = 0;

    targetUserIdRef.current = incomingCall.from;
    validateCallState("ACCEPT_CALL");

    peerConnection.current = createPeerConnection();

    const stream = await getLocalMediaStream();
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    stream
      .getTracks()
      .forEach((track) => peerConnection.current.addTrack(track, stream));

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

  const endCall = () => {
    peerConnection.current?.close();
    peerConnection.current = null;

    [localVideoRef, remoteVideoRef].forEach((ref) => {
      ref.current?.srcObject?.getTracks().forEach((track) => track.stop());
      if (ref.current) ref.current.srcObject = null;
    });

    ringAudioRef.current?.pause();
    ringAudioRef.current.currentTime = 0;

    setIsCalling(false);
    setIncomingCall(null);
    targetUserIdRef.current = null;
  };

  const hangUp = () => {
    if (targetUserIdRef.current) {
      socket.emit("hang-up", { to: targetUserIdRef.current });
    }
    endCall();
  };

  return (
    <div className={styles.video_chat}>
      <audio ref={ringAudioRef} src="/sound/chamada.wav" loop />

      {!isCalling && !incomingCall && (
        <div
          className={styles.video_call_icon}
          onClick={() => startCall(selectedUserId)}
        >
          <MdVideoCall title="videochamada" />
        </div>
      )}

      {!isCalling && incomingCall && (
        <div className={styles.incoming_call}>
          <p>📞 Chamada recebida de {incomingCall?.userName}</p>
          <button onClick={acceptCall}>Atender</button>
          <button onClick={hangUp} className="hang-up-btn">
            Encerrar Chamada
          </button>
        </div>
      )}

      <div
        className={`${styles.video_overlay} ${
          isFullscreen ? styles.fullscreen : ""
        }`}
        style={{ display: isCalling ? "flex" : "none" }}
      >
        <video
          className={styles.remote_video}
          autoPlay
          playsInline
          ref={remoteVideoRef}
        />
        <video
          className={styles.local_video}
          autoPlay
          muted
          playsInline
          ref={localVideoRef}
        />

        <div className={styles.menu_toggle}>
          <button className={styles.menu_btn} onClick={toggleOptions}>
            <MdMoreVert />
          </button>

          {showOptions && (
            <div className={styles.options_menu}>
              <button onClick={toggleMute}>
                {isMuted ? "Desmutar Microfone" : "Mutar Microfone"}
              </button>
              <button onClick={toggleFullscreen}>
                {isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
              </button>
              <button onClick={hangUp} className={styles.hangup_btn}>
                Encerrar Chamada
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoChat;
