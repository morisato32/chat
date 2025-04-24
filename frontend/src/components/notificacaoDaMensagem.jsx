const playNotificationSound = () => {
    const audio = new Audio('/sound/notificacao_msg.wav');
    audio.play().catch(err => console.log("Erro ao tocar som:", err));
  };
  
  export default playNotificationSound