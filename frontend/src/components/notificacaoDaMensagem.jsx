const playNotificationSound = () => {
    const audio = new Audio('/sound/notificacaoDaMensagem.mp3');
    audio.play().catch(err => console.log("Erro ao tocar som:", err));
  };
  
  export default playNotificationSound