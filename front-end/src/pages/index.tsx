import { AuthContext } from "@/contexts/AuthContext";
import { FormEvent, useContext, useState } from "react"
import styles from "@/styles/Home.module.css"
import { withSSRGuest } from "@/utils/withSSRGuest";

export default function Home() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signIn } = useContext(AuthContext);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const data = {
      email, 
      password,
    }
    await signIn(data);
  }

  return (
    <form onClick={handleSubmit} className={styles.container}>
      <input type="email" value={email}  onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password}  onChange={e => setPassword(e.target.value)} />
      <button type="submit">Entrar</button>
    </form>
  )
}

//como trabalhar com cookies pelo lado do serverside

export const getServerSideProps = withSSRGuest(async (context) => {
  //consigo ver atraves do contexto todos os cookies que tenho
  //console.log(context.req.cookies);

  //conforme acima, consigo verificar se existe ou nao um token e posso verificar pra deixar ou nao meu user logar no app: 

  return {
    props: {  },
  }
})
