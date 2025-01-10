import {
  getAllUsersDtoType,
  loginDtoType,
  loginUserType,
  logoutDtoType,
  logoutType,
  refreshTokenDtoType,
  refreshTokenType,
  registerDataType,
  registerUserDtoType,
  selfDataType,
  selfDtoType,
  updateUserDtoType,
  updateUserType,
} from '../types/auth';

export const registerUserDto = (
  user: registerDataType,
): { registerUserDto: registerUserDtoType } => {
  return {
    registerUserDto: {
      id: user.id,
      userName: user.userName,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
    },
  };
};

export const loginUserDto = (
  user: loginUserType,
): { loginUserDto: loginDtoType } => {
  return {
    loginUserDto: {
      id: user.id,
      fullName: `${user.firstName} ${user.lastName}`,
      userName: user.userName,
      email: user.email,
      role: user.role,
    },
  };
};

export const selfUserDto = (user: selfDataType): { selfDto: selfDtoType } => {
  return {
    selfDto: {
      id: Number(user?.id),
      fullName: `${user?.firstName} ${user?.lastName}`,
      userName: user?.userName,
      email: user?.email,
      role: user?.role,
      tenant: user?.tenant,
    },
  };
};

export const refreshTokenDto = (
  user: refreshTokenType,
): { refreshTokenDto: refreshTokenDtoType } => {
  return {
    refreshTokenDto: {
      id: user.id,
      userName: user.userName,
    },
  };
};

export const logoutDto = (user: logoutType): { logoutDto: logoutDtoType } => {
  return {
    logoutDto: {
      id: Number(user.id),
      role: user.role,
    },
  };
};

export const updateUserDto = (
  user: updateUserType,
): {
  updateUserDto: updateUserDtoType;
} => {
  return {
    updateUserDto: {
      id: user.id,
      userName: user.userName,
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    },
  };
};

export const getAllUsersDto = (
  users: getAllUsersDtoType[],
): { getAllUsersDto: getAllUsersDtoType[] } => {
  return {
    getAllUsersDto: users,
  };
};

export const getUserByIdDto = (
  user: getAllUsersDtoType,
): { getUserByIdDto: getAllUsersDtoType } => {
  return {
    getUserByIdDto: user,
  };
};

export const deleteuserDto = (
  user: getAllUsersDtoType,
): { deleteuserDto: getAllUsersDtoType } => {
  return {
    deleteuserDto: user,
  };
};
