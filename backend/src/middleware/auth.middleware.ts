import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { firebaseAdmin } from '../lib/firebase';
import { AuthenticatedUserContext } from '../modules/faculty/faculty.types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUserContext;
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const devUidHeader = req.headers['x-dev-uid'] as string | undefined;

    let uid: string | null = null;
    let email: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1].trim();

      // If token is provided, attempt Firebase verification
      try {
        if (token.startsWith('dev-user-')) {
          // Dev mock token convenience for localhost testing
          uid = token.replace('dev-user-', '');
        } else {
          const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
          uid = decodedToken.uid;
          email = decodedToken.email || null;
        }
      } catch (fbErr: any) {
        // Fallback for dev mode if token format is raw UID or header
        if (process.env.NODE_ENV !== 'production' && token) {
          uid = token;
        } else {
          res.status(401).json({ error: 'Unauthorized: Invalid Firebase token' });
          return;
        }
      }
    } else if (devUidHeader && process.env.NODE_ENV !== 'production') {
      uid = devUidHeader;
    }

    if (!uid) {
      res.status(401).json({ error: 'Unauthorized: No token or credentials provided' });
      return;
    }

    // Lookup user in authed_users
    const authedUser = await prisma.authedUser.findUnique({
      where: { uid },
      include: {
        department: true,
      },
    });

    if (!authedUser) {
      res.status(401).json({ error: 'Unauthorized: User not registered in database' });
      return;
    }

    req.user = {
      uid: authedUser.uid,
      email: authedUser.email,
      role: authedUser.role || 'USER',
      department_id: authedUser.department_id,
      college_id: authedUser.college_id,
      display_name: authedUser.display_name,
      photo_url: authedUser.photo_url,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal server authentication error' });
  }
}
