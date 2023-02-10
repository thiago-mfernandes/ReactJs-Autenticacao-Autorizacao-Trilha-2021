import { useContext, useEffect } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { setupAPIClient } from "@/services/api";
import { api } from "@/services/apiClient";
import { withSSRAuth } from "@/utils/withSSRAuth";
import { Can } from "@/components/Can";

export default function Dashboard() {

  const { user, signOut } = useContext(AuthContext);
  

  useEffect(() => {
    api.get('/me')
    .then(response => console.log(response))
  }, [])

  return (
    <>
      <h1>Dashboard</h1>
      <span>{user?.email}</span>    
      <button onClick={signOut}>SignOut</button>
      {/**se o usuario tiver permissao, exibe o componente */}
      <Can permissions={['metrics.list']}>
        <div>Métricas</div>
      </Can>
    </>
  );
}

export const getServerSideProps = withSSRAuth( async (context) => {
  const apiClient = setupAPIClient(context)
  const response = await apiClient.get('/me');
  console.log(response);
  
  return {
    props: {},
  }
})