import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { DynamicRouter } from './routes/dynamicRouter';
import { AppConfigSchema } from './shared/schema';
import { generateToken, authMiddleware } from './middleware/auth';
import prisma from './utils/db';
import { importCsvData } from './services/csvService';
import { exportToGitHub } from './services/githubService';
import logger from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// --- Config Ingestion ---
let currentConfig: any = null;
let dynamicRouter: any = null;

app.post('/api/config', async (req: Request, res: Response) => {
  const result = AppConfigSchema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({ 
      error: 'Invalid Configuration', 
      details: result.error.format() 
    });
  }

  currentConfig = result.data;
  logger.info(`Applying new configuration: ${currentConfig.appName}`);
  
  // Store in DB (stringified for SQLite)
  const userId = (req as any).user?.id || 'admin';
  await prisma.appConfig.upsert({
    where: { id: 'main-config' },
    update: { config: JSON.stringify(currentConfig) },
    create: { id: 'main-config', name: currentConfig.appName, config: JSON.stringify(currentConfig), userId }
  });

  // Re-initialize dynamic routes
  const routerFactory = new DynamicRouter(currentConfig);
  dynamicRouter = routerFactory.router;
  
  res.json({ message: 'Configuration applied successfully', config: currentConfig });
});

// --- Dynamic Routes Middleware ---
app.use('/api/generated', (req, res, next) => {
  if (!dynamicRouter) {
    return res.status(503).json({ error: 'System not configured yet' });
  }
  dynamicRouter(req, res, next);
});

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name }
    });
    const token = generateToken(user.id);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    res.status(400).json({ error: 'User already exists or invalid data' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = generateToken(user.id);
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// --- Feature Routes (Protected) ---
app.post('/api/features/csv-import', authMiddleware, async (req, res) => {
  const { csvContent, entityName, configId } = req.body;
  const userId = (req as any).user.id;
  try {
    const count = await importCsvData(csvContent, entityName, configId, userId);
    res.json({ message: `Successfully imported records`, count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/features/github-export', authMiddleware, async (req, res) => {
  const { repoName, config } = req.body;
  const token = req.headers['x-github-token'] as string;
  try {
    const result = await exportToGitHub(repoName, [], token || 'mock-token');
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Error Handling ---
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`${err.message} - ${req.method} ${req.url} - ${req.ip}`);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  logger.info(`🚀 Dynamic Backend running at http://localhost:${PORT}`);
});
