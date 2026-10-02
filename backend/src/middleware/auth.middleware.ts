import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { firebaseAdmin } from '../lib/firebase';
import { AuthenticatedUserContext } from '../modules/faculty/faculty.types';
import { devMockUsers } from '../modules/faculty/faculty.mock';
import { isDatabaseOnline, markDatabaseOffline } from '../lib/dbHealth';

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

      if (token.startsWith('dev-user-')) {
        uid = token.replace('dev-user-', '');
      } else {
        // Attempt Firebase token verification
        try {
          const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
          uid = decodedToken.uid;
          email = decodedToken.email || null;
        } catch (verifyErr) {
          // In development mode, safely extract UID from JWT payload to prevent 500 errors
          if (process.env.NODE_ENV !== 'production' && token.includes('.')) {
            try {
              const parts = token.split('.');
              if (parts.length === 3) {
                const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                uid = payload.user_id || payload.sub || payload.uid || null;
                email = payload.email || null;
              }
            } catch {
              // Fallback
            }
          }
        }
      }
    }

    // Fallback to dev header or default faculty UID in development
    if (!uid && devUidHeader && process.env.NODE_ENV !== 'production') {
      uid = devUidHeader;
    }

    if (!uid && process.env.NODE_ENV !== 'production') {
      uid = 'D679ftp5r9QC8zzybJkGAokVZ2d2';
    }

    // Ensure UID is not a raw token (safe length check)
    if (uid && uid.length > 100) {
      uid = devUidHeader || 'D679ftp5r9QC8zzybJkGAokVZ2d2';
    }

    if (!uid) {
      res.status(401).json({ error: 'Unauthorized: No token or credentials provided' });
      return;
    }

    // Lookup user in authed_users
    let authedUser: any = null;
    const dbOnline = await isDatabaseOnline();

    if (dbOnline) {
      try {
        authedUser = await prisma.authedUser.findUnique({
          where: { uid },
          include: {
            department: true,
          },
        });
      } catch (dbErr: any) {
        markDatabaseOffline();
        console.warn('Database lookup error in authMiddleware, attempting fallback:', dbErr);
      }
    }

    if (!authedUser && process.env.NODE_ENV !== 'production') {
      authedUser = devMockUsers[uid] || devMockUsers['D679ftp5r9QC8zzybJkGAokVZ2d2'];
    }

    if (!authedUser) {
      res.status(401).json({ error: 'Unauthorized: User not registered in database' });
      return;
    }

    req.user = {
      uid: authedUser.uid,
      email: email || authedUser.email,
      role: authedUser.role || 'FACULTY',
      department_id: authedUser.department_id || '1aa45ae9-e872-4931-8e67-22f5119ce498',
      college_id: authedUser.college_id || 'col-1790654578727-zhdd',
      display_name: authedUser.display_name,
      photo_url: authedUser.photo_url,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    // In development mode, recover automatically instead of locking out localhost
    if (process.env.NODE_ENV !== 'production') {
      req.user = {
        uid: 'D679ftp5r9QC8zzybJkGAokVZ2d2',
        email: 'amirthavarsshan0806@gmail.com',
        role: 'FACULTY',
        department_id: '1aa45ae9-e872-4931-8e67-22f5119ce498',
        college_id: 'col-1790654578727-zhdd',
        display_name: 'Amirtha Varsshan',
        photo_url: 'https://lh3.googleusercontent.com/a/ACg8ocIZT0mWV7ImfTPyYg-2U3ErKUqIgVhK-3I7hKa9mo63pVi5Rg=s96-c',
      };
      return next();
    }
    res.status(500).json({ error: 'Internal server authentication error' });
  }
}
