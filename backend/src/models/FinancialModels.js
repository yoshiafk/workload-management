import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * CostCenter - Organizational cost tracking units
 */
export const CostCenter = sequelize.define('CostCenter', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('Active', 'Inactive'),
        allowNull: false,
        defaultValue: 'Active'
    },
    monthlyBudget: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    yearlyBudget: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    budgetPeriod: {
        type: DataTypes.STRING,
        allowNull: true
    },
    parentId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'CostCenters',
            key: 'id'
        }
    },
    managerId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Members',
            key: 'id'
        }
    },
    manager: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'CostCenters'
});

/**
 * COA - Chart of Accounts for expense tracking
 */
export const COA = sequelize.define('COA', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    subcategory: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'COAs'
});

// CostCenter self-referential association
CostCenter.belongsTo(CostCenter, { foreignKey: 'parentId', as: 'parent' });
CostCenter.hasMany(CostCenter, { foreignKey: 'parentId', as: 'children' });
