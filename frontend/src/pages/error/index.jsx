

function ErrorPage() {
  return (
    <div className="container">
        <div className="glitch">Erro 404</div>
        <p className="message">A página que você procura se perdeu no ciberespaço...</p>
        <a href="/" className="btn">Voltar ao Início</a>
    </div>
  );
}

export default ErrorPage;