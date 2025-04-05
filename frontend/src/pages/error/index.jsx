import styles from '../../components/error.module.css'

function ErrorPage() {
  return (
    <div className={styles.error_container}>
        <div className={styles.error_glitch}>Erro 404</div>
        <p className={styles.error_message}>A página que você procura se perdeu no ciberespaço...</p>
        <a href="/" className={styles.error_btn}>Voltar ao Início</a>
    </div>
  );
}

export default ErrorPage;