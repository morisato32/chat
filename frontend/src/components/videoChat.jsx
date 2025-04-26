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

  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
      { urls: "stun:stun3.l.google.com:19302" },
      { urls: "stun:stun4.l.google.com:19302" },
    ],
  };
  

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

    socket.on("registered", (data) => {
      if (data.userId === userId) {
        setIsRegistered(true);
        console.log("✅ Usuário registrado:", data);
      }
    });

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
    console.log("[DEBUG] Criando nova RTCPeerConnection...");
    const pc = new RTCPeerConnection(iceServers);
  
    // Adicione handlers e retorne
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("[ICE] Candidato local:", event.candidate);
        socket.emit("ice-candidate", {
          to: targetUserIdRef.current,
          from: userId,
          candidate: event.candidate,
        });
      }
    };
  
    pc.ontrack = (event) => {
      console.log("[TRACK] Recebendo track remota");
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
  
    return pc;
  };
  

  const startCall = async (toUserId) => {
    if (!isRegistered || !userId) return;
  
    // ✅ Evita iniciar chamada duplicada
    if (peerConnection.current) {
      console.warn("[⚠️] Uma chamada já está em andamento.");
      return;
    }
  
    if (!toUserId) {
      console.warn("[❌] Nenhum destinatário especificado para a chamada.");
      return;
    }
  
    console.log("[DEBUG] [START_CALL] userId:", userId);
    console.log("[DEBUG] [START_CALL] targetUserId:", toUserId);
  
    // ✅ Criar conexão peer
    peerConnection.current = createPeerConnection();
  
    if (!peerConnection.current) {
      console.error("[❌] Falha ao criar peerConnection");
      return;
    }
  
    targetUserIdRef.current = toUserId;
    validateCallState("START_CALL");
  
    try {
      // ✅ Obter o stream local ANTES de criar oferta
      const stream = await getLocalMediaStream();
  
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
  
      // ✅ Adiciona tracks ao peer connection
      stream.getTracks().forEach((track) => {
        peerConnection.current.addTrack(track, stream);
      });
  
      // ✅ Cria oferta
      const offer = await peerConnection.current.createOffer();
  
      // ✅ Aguarda completamente o setLocalDescription
      await peerConnection.current.setLocalDescription(offer);
  
      // ✅ Emite a oferta SOMENTE após o setLocalDescription estar finalizado
      socket.emit("call-user", {
        to: toUserId,
        from: userId,
        offer,
        userName,
      });
  
      setIsCalling(true);
      console.log("[📞] Chamada iniciada com:", toUserId);
  
    } catch (error) {
      console.error("[❌] Erro ao iniciar chamada:", error);
    }
  };
  
  const acceptCall = async () => {
    if (!incomingCall) return;
  
    ringAudioRef.current?.pause();
    ringAudioRef.current.currentTime = 0;
  
    targetUserIdRef.current = incomingCall.from;
    validateCallState("ACCEPT_CALL");
  
    peerConnection.current = createPeerConnection();
  
    if (!peerConnection.current) {
      console.error("[❌] PeerConnection não criada");
      return;
    }
  
    const stream = await getLocalMediaStream();
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;
  
    stream.getTracks().forEach((track) => {
      peerConnection.current.addTrack(track, stream);
    });
  
    await peerConnection.current.setRemoteDescription(
      new RTCSessionDescription(incomingCall.offer)
    );
    console.log("[✅] RemoteDescription da offer aplicada.");
  
    const answer = await peerConnection.current.createAnswer();
    await peerConnection.current.setLocalDescription(answer);
    console.log("[✅] LocalDescription da answer aplicada.");
  
    socket.emit("answer", {
      answer: peerConnection.current.localDescription, // ← importante
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
