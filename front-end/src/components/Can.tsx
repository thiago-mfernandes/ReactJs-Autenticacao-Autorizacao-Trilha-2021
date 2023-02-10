import { useCan } from "@/hooks/useCan";
import { ReactNode } from "react";

interface CanProps {
  children: ReactNode;
  permissions?: string[];
  roles?: string[];
}

export function Can({ children, permissions, roles }: CanProps) {
  
  //passo pro meu hook validar as permissions e roles
  const userCanSeeComponent = useCan({
    permissions, roles
  });

  if(!userCanSeeComponent) {
    return null;
  }

  return (
    <>
      {children}
    </>
  )
}