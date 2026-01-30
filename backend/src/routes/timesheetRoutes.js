import express from 'express';
import { timesheetController } from '../controllers/timesheetController.js';
import { authenticate as auth, authorize as adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Member routes
router.get('/me/entries', auth, timesheetController.getMyTimeEntries);
router.post('/entries', auth, timesheetController.logTime);
router.put('/entries/:id', auth, timesheetController.logTime);
router.delete('/entries/:id', auth, timesheetController.deleteTimeEntry);
router.get('/me/periods', auth, timesheetController.getMyTimesheets);
router.post('/submit', auth, timesheetController.submitTimesheet);

// Admin routes
router.get('/admin/pending', auth, adminOnly('admin'), timesheetController.getPendingTimesheets);
router.get('/admin/:id', auth, adminOnly('admin'), timesheetController.getTimesheetDetails);
router.put('/admin/:id/review', auth, adminOnly('admin'), timesheetController.reviewTimesheet);

export default router;
