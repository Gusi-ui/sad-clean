import type { Assignment } from './assignments-query';

export interface UserCalculation {
  userId: string;
  userName: string;
  userSurname: string;
  totalAssignedHours: number;
  totalWorkers: number;
  assignments: Assignment[];
  calculationDetails: {
    laborablesHours: number;
    festivosHours: number;
    flexibleHours: number;
    completaHours: number;
    personalizadaHours: number;
  };
}

export const calculateUserTotalHours = (
  assignments: Assignment[],
  userId: string
): UserCalculation | null => {
  const userAssignments = assignments.filter(
    (assignment) =>
      assignment.user_id === userId && assignment.status === 'active'
  );

  if (userAssignments.length === 0) {
    return null;
  }

  const firstAssignment = userAssignments[0];
  const calculationDetails = {
    laborablesHours: 0,
    festivosHours: 0,
    flexibleHours: 0,
    completaHours: 0,
    personalizadaHours: 0,
  };

  // Calcular horas por tipo de asignación
  userAssignments.forEach((assignment) => {
    switch (assignment.assignment_type) {
      case 'laborables':
        calculationDetails.laborablesHours += assignment.monthly_hours;
        break;
      case 'festivos':
        calculationDetails.festivosHours += assignment.monthly_hours;
        break;
      case 'flexible':
        calculationDetails.flexibleHours += assignment.monthly_hours;
        break;
      case 'completa':
        calculationDetails.completaHours += assignment.monthly_hours;
        break;
      case 'personalizada':
        calculationDetails.personalizadaHours += assignment.monthly_hours;
        break;
    }
  });

  const totalAssignedHours = userAssignments.reduce(
    (total, assignment) => total + assignment.monthly_hours,
    0
  );

  // Verificar que firstAssignment existe antes de usarlo
  if (!firstAssignment) {
    return null;
  }

  return {
    userId,
    userName: firstAssignment.user?.name ?? '',
    userSurname: firstAssignment.user?.surname ?? '',
    totalAssignedHours,
    totalWorkers: userAssignments.length,
    assignments: userAssignments,
    calculationDetails,
  };
};

export const getAllUserCalculations = (
  assignments: Assignment[]
): UserCalculation[] => {
  const userIds = [...new Set(assignments.map((a) => a.user_id))];

  return userIds
    .map((userId) => calculateUserTotalHours(assignments, userId))
    .filter(
      (calculation): calculation is UserCalculation => calculation !== null
    );
};
