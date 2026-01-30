import express from 'express';
import { LeaveRequest, LeaveBalance, LeaveType, Member } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

router.use(authenticate);

/**
 * GET /api/leaves/balance
 * Get authenticated member's leave balances
 */
router.get('/balance', async (req, res) => {
    try {
        const memberId = req.user.memberId;
        if (!memberId) {
            return res.status(400).json({ message: 'User is not linked to a member profile' });
        }

        const balances = await LeaveBalance.findAll({
            where: { memberId },
            include: [{
                model: LeaveType,
                as: 'leaveType',
                attributes: ['id', 'name', 'color', 'defaultDays']
            }],
            order: [[{ model: LeaveType, as: 'leaveType' }, 'name', 'ASC']]
        });

        // Get pending days for each balance
        const pendingRequests = await LeaveRequest.findAll({
            where: {
                memberId,
                status: 'PENDING'
            },
            attributes: ['leaveTypeId', 'days']
        });

        const data = balances.map(balance => {
            const pending = pendingRequests
                .filter(r => r.leaveTypeId === balance.leaveTypeId)
                .reduce((sum, r) => sum + parseFloat(r.days), 0);

            return {
                ...balance.get(),
                pendingDays: pending,
                remainingDays: parseFloat(balance.totalDays) - parseFloat(balance.usedDays)
            };
        });

        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/leaves/me
 * Get authenticated member's leave requests
 */
router.get('/me', async (req, res) => {
    try {
        const memberId = req.user.memberId;
        if (!memberId) {
            return res.status(400).json({ message: 'User is not linked to a member profile' });
        }

        const { status, year } = req.query;
        const where = { memberId };

        if (status && status !== 'all') {
            where.status = status;
        }

        if (year) {
            where.startDate = {
                [Op.gte]: `${year}-01-01`,
                [Op.lte]: `${year}-12-31`
            };
        }

        const requests = await LeaveRequest.findAll({
            where,
            include: [{
                model: LeaveType,
                as: 'leaveType',
                attributes: ['id', 'name', 'color']
            }],
            order: [['startDate', 'DESC']]
        });

        res.json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/leaves
 * Submit a new leave request
 */
router.post('/', async (req, res) => {
    try {
        const memberId = req.user.memberId;
        if (!memberId) {
            return res.status(400).json({ message: 'User is not linked to a member profile' });
        }

        const { leaveTypeId, startDate, endDate, halfDay, reason } = req.body;

        // 1. Basic Validation
        if (!leaveTypeId || !startDate || !endDate) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            return res.status(400).json({ message: 'Start date cannot be after end date' });
        }

        // 2. Check overlap
        const overlapping = await LeaveRequest.findOne({
            where: {
                memberId,
                status: { [Op.ne]: 'CANCELLED' },
                [Op.or]: [
                    {
                        startDate: { [Op.between]: [startDate, endDate] }
                    },
                    {
                        endDate: { [Op.between]: [startDate, endDate] }
                    }
                ]
            }
        });

        if (overlapping) {
            return res.status(400).json({ message: 'You already have a leave request for this period' });
        }

        // 3. Calculate days (simple calculation for now, in real app would exclude weekends/holidays)
        const diffTime = Math.abs(end - start);
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (halfDay && halfDay !== 'FULL' && diffDays === 1) {
            diffDays = 0.5;
        }

        // 4. Check balance
        const year = start.getFullYear();
        const balance = await LeaveBalance.findOne({
            where: { memberId, leaveTypeId, year }
        });

        if (!balance) {
            return res.status(400).json({ message: 'Leave balance not found for this year' });
        }

        const remaining = parseFloat(balance.totalDays) - parseFloat(balance.usedDays);
        if (diffDays > remaining) {
            return res.status(400).json({ message: `Insufficient balance. Available: ${remaining} days, Requested: ${diffDays} days` });
        }

        // 5. Create request
        const request = await LeaveRequest.create({
            memberId,
            leaveTypeId,
            startDate,
            endDate,
            days: diffDays,
            halfDay: halfDay || 'FULL',
            reason,
            status: 'PENDING'
        });

        res.status(201).json({
            success: true,
            data: request,
            message: 'Leave request submitted successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * PUT /api/leaves/:id/cancel
 * Cancel a pending leave request
 */
router.put('/:id/cancel', async (req, res) => {
    try {
        const memberId = req.user.memberId;
        const request = await LeaveRequest.findOne({
            where: { id: req.params.id, memberId }
        });

        if (!request) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        if (request.status !== 'PENDING') {
            return res.status(400).json({ message: `Cannot cancel a request that is already ${request.status}` });
        }

        request.status = 'CANCELLED';
        await request.save();

        res.json({ success: true, message: 'Leave request cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
