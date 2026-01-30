import express from 'express';
import { LeaveRequest, LeaveBalance, LeaveType, Member, User } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

/**
 * GET /api/admin/leaves/pending
 * Get all pending leave requests with team conflict info
 */
router.get('/pending', async (req, res) => {
    try {
        const requests = await LeaveRequest.findAll({
            where: { status: 'PENDING' },
            include: [
                {
                    model: Member,
                    as: 'member',
                    attributes: ['id', 'name', 'roleType']
                },
                {
                    model: LeaveType,
                    as: 'leaveType',
                    attributes: ['id', 'name', 'color']
                }
            ],
            order: [['createdAt', 'ASC']]
        });

        // Add team conflict info
        const result = await Promise.all(requests.map(async (request) => {
            const reqData = request.get();

            // Check for other approved or pending requests in the same period
            const conflicts = await LeaveRequest.findAll({
                where: {
                    id: { [Op.ne]: request.id },
                    status: ['PENDING', 'APPROVED'],
                    [Op.or]: [
                        {
                            startDate: { [Op.between]: [request.startDate, request.endDate] }
                        },
                        {
                            endDate: { [Op.between]: [request.startDate, request.endDate] }
                        }
                    ]
                },
                include: [{ model: Member, as: 'member', attributes: ['id', 'name'] }]
            });

            // Get current balance
            const year = new Date(request.startDate).getFullYear();
            const balance = await LeaveBalance.findOne({
                where: { memberId: request.memberId, leaveTypeId: request.leaveTypeId, year }
            });

            return {
                ...reqData,
                teamConflicts: conflicts.map(c => ({
                    memberId: c.member.id,
                    memberName: c.member.name,
                    status: c.status,
                    dates: `${c.startDate} to ${c.endDate}`
                })),
                balanceInfo: balance ? {
                    totalDays: balance.totalDays,
                    usedDays: balance.usedDays,
                    remainingDays: parseFloat(balance.totalDays) - parseFloat(balance.usedDays)
                } : null
            };
        }));

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * PUT /api/admin/leaves/:id/approve
 * Approve a leave request
 */
router.put('/:id/approve', async (req, res) => {
    try {
        const { note } = req.body;
        const request = await LeaveRequest.findByPk(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        if (request.status !== 'PENDING') {
            return res.status(400).json({ message: `Cannot approve a request that is already ${request.status}` });
        }

        // Update balance
        const year = new Date(request.startDate).getFullYear();
        const balance = await LeaveBalance.findOne({
            where: { memberId: request.memberId, leaveTypeId: request.leaveTypeId, year }
        });

        if (!balance) {
            return res.status(400).json({ message: 'Leave balance not found' });
        }

        // Transaction would be better here in real app
        request.status = 'APPROVED';
        request.reviewedBy = req.user.id;
        request.reviewedAt = new Date();
        await request.save();

        balance.usedDays = parseFloat(balance.usedDays) + parseFloat(request.days);
        await balance.save();

        res.json({ success: true, message: 'Leave request approved successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * PUT /api/admin/leaves/:id/reject
 * Reject a leave request
 */
router.put('/:id/reject', async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason || reason.length < 5) {
            return res.status(400).json({ message: 'Rejection reason is required (min 5 chars)' });
        }

        const request = await LeaveRequest.findByPk(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        if (request.status !== 'PENDING') {
            return res.status(400).json({ message: `Cannot reject a request that is already ${request.status}` });
        }

        request.status = 'REJECTED';
        request.rejectionReason = reason;
        request.reviewedBy = req.user.id;
        request.reviewedAt = new Date();
        await request.save();

        res.json({ success: true, message: 'Leave request rejected' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/admin/leave-balances
 * Get all member leave balances
 */
router.get('/balances', async (req, res) => {
    try {
        const { memberId, year = new Date().getFullYear() } = req.query;
        const where = { year };
        if (memberId) where.memberId = memberId;

        const balances = await LeaveBalance.findAll({
            where,
            include: [
                { model: Member, as: 'member', attributes: ['id', 'name'] },
                { model: LeaveType, as: 'leaveType', attributes: ['id', 'name', 'color'] }
            ]
        });

        res.json({ success: true, data: balances });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * PUT /api/admin/leave-balances/:id
 * Adjust a member's leave balance
 */
router.put('/balances/:id', async (req, res) => {
    try {
        const { totalDays, usedDays } = req.body;
        const balance = await LeaveBalance.findByPk(req.params.id);

        if (!balance) {
            return res.status(404).json({ message: 'Balance record not found' });
        }

        if (totalDays !== undefined) balance.totalDays = totalDays;
        if (usedDays !== undefined) balance.usedDays = usedDays;

        await balance.save();
        res.json({ success: true, data: balance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * GET /api/admin/leaves/types
 * Get all leave types
 */
router.get('/types', async (req, res) => {
    try {
        const types = await LeaveType.findAll({ order: [['name', 'ASC']] });
        res.json({ success: true, data: types });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

/**
 * POST /api/admin/leaves/types
 * Create new leave type
 */
router.post('/types', async (req, res) => {
    try {
        const type = await LeaveType.create(req.body);
        res.status(201).json({ success: true, data: type });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * PUT /api/admin/leaves/types/:id
 * Update leave type
 */
router.put('/types/:id', async (req, res) => {
    try {
        const type = await LeaveType.findByPk(req.params.id);
        if (!type) return res.status(404).json({ message: 'Leave type not found' });
        await type.update(req.body);
        res.json({ success: true, data: type });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * DELETE /api/admin/leaves/types/:id
 * (Soft) Delete leave type
 */
router.delete('/types/:id', async (req, res) => {
    try {
        const type = await LeaveType.findByPk(req.params.id);
        if (!type) return res.status(404).json({ message: 'Leave type not found' });

        type.isActive = false;
        await type.save();
        res.json({ success: true, message: 'Leave type deactivated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;

