import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Role Types - IT role categories (FULLSTACK, DEVOPS, etc.)
 */
export const RoleType = sequelize.define('RoleType', {
    code: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    hasCostTracking: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'RoleTypes'
});

/**
 * Role Tiers - Seniority levels with cost ranges
 */
export const RoleTier = sequelize.define('RoleTier', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    roleTypeCode: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: 'RoleTypes',
            key: 'code'
        }
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    minCost: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    midCost: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    maxCost: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'RoleTiers',
    indexes: [
        {
            unique: true,
            fields: ['roleTypeCode', 'level']
        }
    ]
});

// Associations
RoleType.hasMany(RoleTier, { foreignKey: 'roleTypeCode', sourceKey: 'code', as: 'tiers' });
RoleTier.belongsTo(RoleType, { foreignKey: 'roleTypeCode', targetKey: 'code', as: 'roleType' });
