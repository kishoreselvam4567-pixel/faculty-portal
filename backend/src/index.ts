import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import facultyRouter from './modules/faculty/faculty.routes';
import { prisma } from './lib/prisma';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Staff Portal Faculty API', timestamp: new Date() });
});

// Dev helper endpoint: lists available users in the database for localhost testing
app.get('/api/auth/users-list', async (req, res) => {
  try {
    const users = await prisma.authedUser.findMany({
      include: {
        department: true,
        assigned_classes: true,
      },
    });
    res.json(users);
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') {
      const { devMockUsers } = await import('./modules/faculty/faculty.mock');
      return res.json(Object.values(devMockUsers));
    }
    res.status(500).json({ error: error.message });
  }
});

// Faculty module routes
app.use('/api/faculty', facultyRouter);

// Global 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Faculty Module Backend running at http://localhost:${PORT}`);
});

export default app;
