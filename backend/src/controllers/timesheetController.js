import { TimeEntry, TimesheetPeriod, Member, Allocation, User } from '../models/index.js';
import { Op } from 'sequelize';
import { startOfWeek, endOfWeek, format, parseISO } from 'date-fns';

export const timesheetController = {
    // ---------------------------------------------------------
    // Member: Get my time entries
    // ---------------------------------------------------------
    getMyTimeEntries: async (req, res) => {
        try {
            const { startDate, endDate } = req.query;
            const where = { memberId: req.user.memberId };

            if (startDate && endDate) {
                where.date = {
                    [Op.between]: [startDate, endDate]
                };
            }

            const entries = await TimeEntry.findAll({
                where,
                include: [
                    { model: Allocation, as: 'allocation' }
                ],
                order: [['date', 'ASC']]
            });

            res.json({ success: true, data: entries });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ---------------------------------------------------------
    // Member: Log or Update Time
    // ---------------------------------------------------------
    logTime: async (req, res) => {
        try {
            const { date, hours, description, allocationId, category, id } = req.body;
            const memberId = req.user.memberId;

            // Check if date belongs to an already submitted/approved timesheet
            const startStr = format(startOfWeek(parseISO(date), { weekStartsOn: 1 }), 'yyyy-MM-dd');
            const endStr = format(endOfWeek(parseISO(date), { weekStartsOn: 1 }), 'yyyy-MM-dd');

            const period = await TimesheetPeriod.findOne({
                where: {
                    memberId,
                    startDate: startStr,
                    endDate: endStr,
                    status: { [Op.in]: ['SUBMITTED', 'APPROVED'] }
                }
            });

            if (period) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot log time for this week. Timesheet is currently ${period.status}.`
                });
            }

            let entry;
            if (id) {
                entry = await TimeEntry.findByPk(id);
                if (!entry || entry.memberId !== memberId) {
                    return res.status(404).json({ success: false, message: 'Time entry not found' });
                }
                await entry.update({ hours, description, allocationId, category });
            } else {
                entry = await TimeEntry.create({
                    memberId,
                    date,
                    hours,
                    description,
                    allocationId,
                    category
                });
            }

            res.json({ success: true, data: entry });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ---------------------------------------------------------
    // Member: Delete Time Entry
    // ---------------------------------------------------------
    deleteTimeEntry: async (req, res) => {
        try {
            const entry = await TimeEntry.findByPk(req.params.id);
            if (!entry || entry.memberId !== req.user.memberId) {
                return res.status(404).json({ success: false, message: 'Time entry not found' });
            }

            // Check period status
            const startStr = format(startOfWeek(parseISO(entry.date), { weekStartsOn: 1 }), 'yyyy-MM-dd');
            const endStr = format(endOfWeek(parseISO(entry.date), { weekStartsOn: 1 }), 'yyyy-MM-dd');

            const period = await TimesheetPeriod.findOne({
                where: {
                    memberId: req.user.memberId,
                    startDate: startStr,
                    endDate: endStr,
                    status: { [Op.in]: ['SUBMITTED', 'APPROVED'] }
                }
            });

            if (period) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot delete entry. Timesheet is already ${period.status}.`
                });
            }

            await entry.destroy();
            res.json({ success: true, message: 'Entry deleted' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ---------------------------------------------------------
    // Member: Get my timesheets
    // ---------------------------------------------------------
    getMyTimesheets: async (req, res) => {
        try {
            const timesheets = await TimesheetPeriod.findAll({
                where: { memberId: req.user.memberId },
                order: [['startDate', 'DESC']]
            });
            res.json({ success: true, data: timesheets });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ---------------------------------------------------------
    // Member: Submit Weekly Timesheet
    // ---------------------------------------------------------
    submitTimesheet: async (req, res) => {
        try {
            const { startDate, endDate } = req.body;
            const memberId = req.user.memberId;

            // Find all entries for this period
            const entries = await TimeEntry.findAll({
                where: {
                    memberId,
                    date: { [Op.between]: [startDate, endDate] }
                }
            });

            if (entries.length === 0) {
                return res.status(400).json({ success: false, message: 'No time entries found for this period' });
            }

            const totalHours = entries.reduce((sum, entry) => sum + parseFloat(entry.hours), 0);

            // Find or create period
            const [period, created] = await TimesheetPeriod.findOrCreate({
                where: { memberId, startDate, endDate },
                defaults: { memberId, startDate, endDate, status: 'SUBMITTED', totalHours }
            });

            if (!created) {
                if (period.status === 'APPROVED') {
                    return res.status(400).json({ success: false, message: 'Timesheet already approved' });
                }
                await period.update({ status: 'SUBMITTED', totalHours });
            }

            // Link entries to period
            await TimeEntry.update(
                { timesheetPeriodId: period.id },
                { where: { memberId, date: { [Op.between]: [startDate, endDate] } } }
            );

            res.json({ success: true, data: period });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ---------------------------------------------------------
    // Admin: Get pending timesheets
    // ---------------------------------------------------------
    getPendingTimesheets: async (req, res) => {
        try {
            const timesheets = await TimesheetPeriod.findAll({
                where: { status: 'SUBMITTED' },
                include: [
                    { model: Member, as: 'member' }
                ],
                order: [['updatedAt', 'ASC']]
            });
            res.json({ success: true, data: timesheets });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ---------------------------------------------------------
    // Admin: Review Timesheet (Approve/Reject)
    // ---------------------------------------------------------
    reviewTimesheet: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, reason } = req.body;

            if (!['APPROVED', 'REJECTED'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status' });
            }

            const period = await TimesheetPeriod.findByPk(id);
            if (!period) {
                return res.status(404).json({ success: false, message: 'Timesheet not found' });
            }

            await period.update({
                status,
                rejectionReason: status === 'REJECTED' ? reason : null,
                approvedBy: status === 'APPROVED' ? req.user.id : null,
                approvedAt: status === 'APPROVED' ? new Date() : null
            });

            res.json({ success: true, data: period });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // ---------------------------------------------------------
    // Admin: Get Timesheet details (with entries)
    // ---------------------------------------------------------
    getTimesheetDetails: async (req, res) => {
        try {
            const period = await TimesheetPeriod.findByPk(req.params.id, {
                include: [
                    { model: Member, as: 'member' },
                    {
                        model: TimeEntry,
                        as: 'entries',
                        include: [{ model: Allocation, as: 'allocation' }]
                    }
                ]
            });

            if (!period) {
                return res.status(404).json({ success: false, message: 'Timesheet not found' });
            }

            res.json({ success: true, data: period });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};
