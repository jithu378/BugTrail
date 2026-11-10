import { Router } from 'express';
import {
  createBug,
  deleteBug,
  getBug,
  getProjects,
  getStats,
  listBugs,
  updateBug,
} from '../controllers/bugController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.route('/').get(listBugs).post(createBug);
router.get('/stats', getStats);
router.get('/projects', getProjects);
router.route('/:id').get(getBug).put(updateBug).delete(deleteBug);

export default router;
