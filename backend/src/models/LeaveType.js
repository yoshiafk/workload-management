import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LeaveType = sequelize.define('LeaveType', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    defaultDays: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    carryOverMax: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    requiresApproval: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    color: {
        type: DataTypes.STRING(7),
        defaultValue: '#3B82F6'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'LeaveTypes',
    underscored: true
});

export default LeaveType;
