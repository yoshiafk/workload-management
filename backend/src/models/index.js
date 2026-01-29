import sequelize from '../config/database.js';
import User from './User.js';
import Member from './Member.js';
import Allocation from './Allocation.js';
import { Phase, TaskTemplate, TaskEstimate } from './ConfigModels.js';
import { CostCenter, COA } from './FinancialModels.js';
import { RoleType, RoleTier } from './RoleModels.js';
import { Complexity, Status, Tag, Holiday } from './LookupModels.js';

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

// ============================================
// CostCenter - Member (Manager) Association (no FK constraints)
// ============================================
CostCenter.belongsTo(Member, { foreignKey: 'managerId', as: 'manager', constraints: false });

// ============================================
// Allocation - Phase/Task Associations
// ============================================
Allocation.belongsTo(Phase, { foreignKey: 'phaseId', as: 'phase' });
Allocation.belongsTo(TaskTemplate, { foreignKey: 'taskId', as: 'task' });

// ============================================
// TaskEstimate - Complexity Association (no FK constraints)
// ============================================
TaskEstimate.belongsTo(Complexity, { foreignKey: 'complexityLevel', targetKey: 'level', as: 'complexity', constraints: false });
Complexity.hasMany(TaskEstimate, { foreignKey: 'complexityLevel', sourceKey: 'level', as: 'estimates', constraints: false });

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
    Holiday
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
    Holiday
};

export default models;
