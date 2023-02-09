import { api } from "@/services/api";
import Router from "next/router";
import { createContext, ReactNode, useEffect, useState } from "react";
import { setCookie, parseCookies, destroyCookie } from "nookies"

type SignInCredentials = {
  email: string;
  password: string;
}

type AuthContextData = {
  signIn(credentials : SignInCredentials): Promise<void>;
  user: User;
  isAuthenticated: boolean;
}

type AuthProviderProps = {
  children: ReactNode
}

type User = {
  email: string;
  permissions: string[];
  roles: string[];
}


export const AuthContext = createContext({} as AuthContextData);

export function signOut() {
  //deslogar o usuario
  destroyCookie(undefined, 'nextauth.token')
  destroyCookie(undefined, 'nextauth.refreshToken')
  //redireciono o usuario
  Router.push('/');
}

export function AuthProvider({ children }: AuthProviderProps) {
  //meu contexto exporta duas infos: se esta autenticado e a funcao de autenticacao com os dois parametro SignInCredentials  
  

  //depois que a minha requisicao eh feita e meu usuario eh validado, guardo as informacoes num estado, para que toda a minha aplicacao tenha as infos
  const [user, setUser] = useState<User>();

  //essas duas exclamacoes verifica se esta vazio e retorna um boolean
  const isAuthenticated = !!user;


  //toda vez q o usuario acessar a aplicacao pela primeira vez precio carregar a informacao do usuario novamente
  useEffect(() => {
    //devolve uma lista de todos os cookies que tenho salvo
    const { 'nextauth.token' : token } = parseCookies()

    if(token) {
      api.get('/me').then(response => {
        //preencher a variavel de usuario
        const { email, permissions, roles } = response.data;
        setUser({ email, permissions, roles })
      })
      .catch(() => {
        signOut();
      })
    }
  }, [])

  //funcao de autenticacao
  async function signIn({ email, password }: SignInCredentials) {
    try {
      //minha rota sessions
      const response = await api.post('sessions', {
        email, password
      })

      //pego as informacoes da minha response
      const { token, refreshToken, permissions, roles } = response.data;

      //guardo minhas informacoes em um cookie. 1param=undefined, 2param=nomeToken, 3param=valorToken, 4=param=infosAdicionais
      setCookie(undefined, 'nextauth.token', token, {
        //qto tempo quero manter esse cokkie salvo no meu navegador
        maxAge: 60 * 60 * 24 * 30, //30 dias
        path: '/', //quais caminhos da minha aplicacao tem cesso ao cookie ('/' = todos)
      })

      setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
        //qto tempo quero manter esse cokkie salvo no meu navegador
        maxAge: 60 * 60 * 24 * 30, //30 dias
        path: '/', //quais caminhos da minha aplicacao tem cesso ao cookie ('/' = todos)
      })


      setUser({
        email, 
        permissions,
        roles,
      })

      //setar o header com o token
      api.defaults.headers['Authorization'] = `Bearer ${token}`;

      //redireciono o usuario para a rota que eu quero
      Router.push("/dashboard");


    } catch (err) {
      console.log(err)
    }
  }

  return (
    <AuthContext.Provider value={{  signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  )
}