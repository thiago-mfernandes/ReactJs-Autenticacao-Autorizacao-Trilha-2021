import { signOut } from "@/contexts/AuthContext";
import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies"

interface AxiosErrorResponse {
  code?: string;
}

let cookies = parseCookies();
let isRefreshing = false;
let failedRequestsQueue = [];

export const api = axios.create({
  baseURL: "http://localhost:3333",
  headers: {
    Authorization: `Bearer ${cookies['nextauth.token']}`
  }
})

//aqui eu posso interceptar uma requisicao ou resposta antes do codigo ser executado
api.interceptors.response.use(response => {
  // se a resposta der sucesso, retorno sem fazer nada
  return response;
}, (error: AxiosError<AxiosErrorResponse>) => {
  if(error.response.status === 401) {
    if(error.response.data?.code === 'token.expired') {
      //renovar o token
      cookies = parseCookies();
      //pegar o refresh token
      const { 'nextauth.refreshToken': refreshToken } = cookies;
      //enviar o refresh

      //todas as informacoes que eu preciso para repetir uma configuracao pro meu backend
      const originalConfig = error.config;
      
      if(!isRefreshing) {
        isRefreshing = true;

        api.post('/refresh', {
          refreshToken,
        }).then(response => {
          //e receber de volta o token
          const { token } = response.data;
  
          setCookie(undefined, 'nextauth.token', token, {
            maxAge: 60 * 60 * 24 * 30, 
            path: '/', 
          })
    
          setCookie(undefined, 'nextauth.refreshToken', response.data.refreshToken, {
            maxAge: 60 * 60 * 24 * 30, //30 dias
            path: '/', 
          })
  
          api.defaults.headers['Authorization'] = `Bearer ${token}`;

          failedRequestsQueue.forEach(request => request.onSuccess(token));
          failedRequestsQueue = [];
        }).catch(err => {
          failedRequestsQueue.forEach(request => request.onFailure(err));
          failedRequestsQueue = [];
        }).finally(() => {
          isRefreshing = false;
        });
      }

      return new Promise((resolve, reject) => {
        failedRequestsQueue.push({
          onSuccess: (token: string) => {
            //passo um novo token
            originalConfig.headers['Authorization'] = `Bearer ${token}`
            //chamo a api de novo repassando as configuracoes originais
            resolve(api(originalConfig))
          },
          onFailure: (err: AxiosError) => {
            reject(err)
          },
        })
      })
    } else {
      //deslogar o usuario
      signOut();      
    }
  }

  return Promise.reject(error);
})