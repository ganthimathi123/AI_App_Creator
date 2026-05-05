import { Router, Request, Response } from 'express';
import prisma from '../utils/db';
import { AppConfig, Entity } from '../shared/schema';

export class DynamicRouter {
  public router: Router;

  constructor(private config: AppConfig) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.config.entities.forEach((entity) => {
      this.createEntityRoutes(entity);
    });
  }

  private createEntityRoutes(entity: Entity) {
    const path = `/${entity.name.toLowerCase()}`;

    // GET all
    this.router.get(path, async (req: Request, res: Response) => {
      try {
        const userId = (req as any).user?.id;
        const data = await prisma.dynamicEntity.findMany({
          where: { 
            entityName: entity.name,
            userId: userId
          },
        });
        // Parse the stringified JSON data
        res.json(data.map(d => JSON.parse(d.data)));
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data' });
      }
    });

    // POST create
    this.router.post(path, async (req: Request, res: Response) => {
      try {
        const userId = (req as any).user?.id;
        const newItem = await prisma.dynamicEntity.create({
          data: {
            entityName: entity.name,
            data: JSON.stringify(req.body),
            configId: 'main-config',
            userId: userId,
          },
        });
        res.status(201).json(JSON.parse(newItem.data));
      } catch (error) {
        res.status(500).json({ error: 'Failed to create record' });
      }
    });
  }
}
