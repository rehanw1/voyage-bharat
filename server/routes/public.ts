import { Router } from 'express';
import { db } from '../db';

const router = Router();

router.get('/destinations', (_req, res) => {
  const rows = db
    .prepare(
      `SELECT id, name, region, theme, budget, image, description, long_description, sort_order FROM destinations ORDER BY sort_order ASC, name ASC`
    )
    .all() as {
    id: string;
    name: string;
    region: string;
    theme: string;
    budget: string;
    image: string;
    description: string;
    long_description: string;
    sort_order: number;
  }[];

  res.json({
    destinations: rows.map((r) => ({
      id: r.id,
      name: r.name,
      region: r.region,
      theme: r.theme,
      budget: r.budget,
      image: r.image,
      description: r.description,
      longDescription: r.long_description,
    })),
  });
});

export default router;
