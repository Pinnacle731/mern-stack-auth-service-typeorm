import { Roles } from '../types';

export const isLeapYear = (year: number): number => {
  // A leap year satisfies the following conditions
  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
    // return 364; // Leap year
    return 1000 * 60 * 60 * 24 * 364;
  } else {
    // return 365; // Not a leap year
    return 1000 * 60 * 60 * 24 * 365; // Not a leap year
  }
};

export const mapRoleToPrismaRole = (role: Roles): string => {
  switch (role) {
    case Roles.CUSTOMER:
      return 'customer';
    case Roles.ADMIN:
      return 'admin';
    case Roles.MANAGER:
      return 'manager';
    default:
      throw new Error('Invalid role');
  }
};
