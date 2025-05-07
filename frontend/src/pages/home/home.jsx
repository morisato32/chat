import { useState, useEffect } from "react";


const slides = [
  {
    title: "Conecte-se com o mundo",
    description: "Uma conversa de cada vez.",
  },
  {
    title: "Bate-papo moderno",
    description: "Para mentes inquietas.",
  },
  {
    title: "Experimente o futuro",
    description: "Do bate-papo online.",
  },
  {
    title: "Novas amizades",
    description: "Descubra pessoas incríveis.",
  },
  {
    title: "Comunidade vibrante",
    description: "Faça parte da nossa história.",
  },
  {
    title: "Diversão garantida",
    description: "Bate-papo para todos os gostos.",
  },
];

function Home() {
  const [frase, setFrase] = useState(slides[0]); // Estado inicial: primeiro slide

  const mudarFrase = () => {
    const indiceAleatorio = Math.floor(Math.random() * slides.length);
    setFrase(slides[indiceAleatorio]);
  };

  useEffect(() => {
    const intervalo = setInterval(mudarFrase, 5000); // Muda a frase a cada 5 segundos

    return () => clearInterval(intervalo); // Limpa o intervalo quando o componente é desmontado
  }, []);

  return (
    <div className="code-background">
      <div className="code-lines"></div>
      <div className="content">
        <h2>{frase.title}</h2> {/* Exibe o título */}
        <p>{frase.description}</p> {/* Exibe a descrição */}
      </div>
    </div>
  );
}

export default Home;
