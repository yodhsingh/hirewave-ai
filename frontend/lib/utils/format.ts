/**
 * Format utilities for displaying backend enum values in a user-friendly way
 */

/**
 * Convert backend RoleType enum to human-readable format
 * @param roleType - Backend role type (e.g., 'FULL_TIME')
 * @returns Human-readable role type (e.g., 'Full-time')
 */
export const formatRoleType = (roleType: string): string => {
  const roleTypeMap: Record<string, string> = {
    'FULL_TIME': 'Full-time',
    'PART_TIME': 'Part-time',
    'CONTRACT': 'Contract',
    'INTERNSHIP': 'Internship',
    'FREELANCE': 'Freelance',
    'TEMPORARY': 'Temporary',
  };
  return roleTypeMap[roleType] || roleType;
};

/**
 * Convert human-readable role type to backend enum format
 * @param roleType - Human-readable role type (e.g., 'Full-time')
 * @returns Backend role type enum (e.g., 'FULL_TIME')
 */
export const toRoleTypeEnum = (roleType: string): string => {
  const roleTypeMap: Record<string, string> = {
    'Full-time': 'FULL_TIME',
    'Part-time': 'PART_TIME',
    'Contract': 'CONTRACT',
    'Internship': 'INTERNSHIP',
    'Freelance': 'FREELANCE',
    'Temporary': 'TEMPORARY',
  };
  return roleTypeMap[roleType] || roleType;
};
