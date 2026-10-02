import { Request, Response, NextFunction } from 'express';

export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: Authentication required' });
      return;
    }

    const userRole = (req.user.role || '').toUpperCase();
    const hasRole = allowedRoles.some((role) => role.toUpperCase() === userRole);

    if (!hasRole) {
      res.status(403).json({
        error: `Forbidden: Access restricted to ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
}

export const requireFaculty = requireRole('FACULTY', 'HOD');
