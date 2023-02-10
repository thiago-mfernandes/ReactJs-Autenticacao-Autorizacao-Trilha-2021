
type User = {
  permissions: string[];
  roles: string[];
}

type ValidateUserPermissionsParams = {
  user: User;
  permissions?: string[];
  roles?: string[];
}

export function validateUserPermissions({ 
  user, 
  permissions, 
  roles 
} : ValidateUserPermissionsParams) {
  if(permissions?.length > 0) {
    //o every vai return true se 
    const hasAllPermissions = permissions.every(permission => {
      //o usuario tiver todas as permissoes
      return user.permissions.includes(permission)
    });

    if(!hasAllPermissions) {
      return false;
    }
  }

  if(roles?.length > 0) {
    //o every vai return true se 
    const hasAllRoles = roles.some(role => {
      //o usuario tiver todas as permissoes
      return user.roles.includes(role)
    });

    if(!hasAllRoles) {
      return false;
    }
  }

  return true;
}