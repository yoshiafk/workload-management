import sequelize from '../config/database.js';
import User from './User.js';
import Member from './Member.js';
import Allocation from './Allocation.js';
import { Phase, TaskTemplate, TaskEstimate } from './ConfigModels.js';
import { CostCenter, COA } from './FinancialModels.js';
import { RoleType, RoleTier } from './RoleModels.js';
import { Complexity, Status, Tag, Holiday } from './LookupModels.js';
import Cost from './Cost.js';
import LeaveType from './LeaveType.js';
import LeaveBalance from './LeaveBalance.js';
import LeaveRequest from './LeaveRequest.js';
import TimeEntry from './TimeEntry.js';
import TimesheetPeriod from './TimesheetPeriod.js';
import Setting from './Setting.js';

// ============================================
// User - Member Association
// ============================================
User.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });
Member.hasOne(User, { foreignKey: 'memberId', as: 'user' });

// ============================================
// Member - Allocation Association
// ============================================
Member.hasMany(Allocation, { foreignKey: 'memberId', as: 'allocations' });
Allocation.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

// ============================================
// Member - Role Associations (no FK constraints to avoid migration order issues)
// ============================================
Member.belongsTo(RoleType, { foreignKey: 'roleType', targetKey: 'code', as: 'role', constraints: false });
RoleType.hasMany(Member, { foreignKey: 'roleType', sourceKey: 'code', as: 'members', constraints: false });

Member.belongsTo(RoleTier, { foreignKey: 'roleTierId', as: 'tier', constraints: false });
RoleTier.hasMany(Member, { foreignKey: 'roleTierId', as: 'members', constraints: false });

// ============================================
// Member - CostCenter Association (no FK constraints)
// ============================================
Member.belongsTo(CostCenter, { foreignKey: 'costCenterId', as: 'costCenter', constraints: false });
CostCenter.hasMany(Member, { foreignKey: 'costCenterId', as: 'members', constraints: false });

Member.belongsTo(COA, { foreignKey: 'defaultCoaId', as: 'defaultAccount', constraints: false });
COA.hasMany(Member, { foreignKey: 'defaultCoaId', as: 'members', constraints: false });

// ============================================
// CostCenter - Member (Manager) Association (no FK constraints)
// ============================================
CostCenter.belongsTo(Member, { foreignKey: 'managerId', as: 'managerRef', constraints: false });

// ============================================
// Allocation - Phase/Task Associations
// ============================================
Phase.hasMany(Allocation, { foreignKey: 'phaseId', as: 'allocations', constraints: false });
Allocation.belongsTo(Phase, { foreignKey: 'phaseId', as: 'phase', constraints: false });

TaskTemplate.hasMany(Allocation, { foreignKey: 'taskId', as: 'allocations', constraints: false });
Allocation.belongsTo(TaskTemplate, { foreignKey: 'taskId', as: 'task', constraints: false });

Allocation.belongsTo(Status, { foreignKey: 'status', targetKey: 'id', as: 'statusRef', constraints: false });

// ============================================
// TaskEstimate - Complexity Association (no FK constraints)
// ============================================
TaskEstimate.belongsTo(Complexity, { foreignKey: 'complexityLevel', targetKey: 'level', as: 'complexity', constraints: false });
Complexity.hasMany(TaskEstimate, { foreignKey: 'complexityLevel', sourceKey: 'level', as: 'estimates', constraints: false });

// ============================================
// Cost - COA Association
// ============================================
Cost.belongsTo(COA, { foreignKey: 'coaId', as: 'account', constraints: false });

// ============================================
// Leave Management Associations
// ============================================
Member.hasMany(LeaveBalance, { foreignKey: 'memberId', as: 'leaveBalances' });
LeaveBalance.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

LeaveType.hasMany(LeaveBalance, { foreignKey: 'leaveTypeId', as: 'balances' });
LeaveBalance.belongsTo(LeaveType, { foreignKey: 'leaveTypeId', as: 'leaveType' });

Member.hasMany(LeaveRequest, { foreignKey: 'memberId', as: 'leaveRequests' });
LeaveRequest.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

LeaveType.hasMany(LeaveRequest, { foreignKey: 'leaveTypeId', as: 'requests' });
LeaveRequest.belongsTo(LeaveType, { foreignKey: 'leaveTypeId', as: 'leaveType' });

LeaveRequest.belongsTo(User, { foreignKey: 'reviewedBy', as: 'reviewer' });
User.hasMany(LeaveRequest, { foreignKey: 'reviewedBy', as: 'reviewedRequests' });

// ============================================
// Timesheet Associations
// ============================================
Member.hasMany(TimesheetPeriod, { foreignKey: 'memberId', as: 'timesheets' });
TimesheetPeriod.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

Member.hasMany(TimeEntry, { foreignKey: 'memberId', as: 'timeEntries' });
TimeEntry.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

TimesheetPeriod.hasMany(TimeEntry, { foreignKey: 'timesheetPeriodId', as: 'entries' });
TimeEntry.belongsTo(TimesheetPeriod, { foreignKey: 'timesheetPeriodId', as: 'timesheet' });

TimeEntry.belongsTo(Allocation, { foreignKey: 'allocationId', as: 'allocation' });
Allocation.hasMany(TimeEntry, { foreignKey: 'allocationId', as: 'timeEntries' });

TimesheetPeriod.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });
User.hasMany(TimesheetPeriod, { foreignKey: 'approvedBy', as: 'approvedTimesheets' });

// ============================================
// Export all models
// ============================================
const models = {
    User,
    Member,
    Allocation,
    Phase,
    TaskTemplate,
    TaskEstimate,
    CostCenter,
    COA,
    RoleType,
    RoleTier,
    Complexity,
    Status,
    Tag,
    Holiday,
    Cost,
    LeaveType,
    LeaveBalance,
    LeaveRequest,
    TimeEntry,
    TimesheetPeriod,
    Setting
};

export {
    sequelize,
    User,
    Member,
    Allocation,
    Phase,
    TaskTemplate,
    TaskEstimate,
    CostCenter,
    COA,
    RoleType,
    RoleTier,
    Complexity,
    Status,
    Tag,
    Holiday,
    Cost,
    LeaveType,
    LeaveBalance,
    LeaveRequest,
    TimeEntry,
    TimesheetPeriod,
    Setting
};

export default models;

