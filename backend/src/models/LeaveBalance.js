import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LeaveBalance = sequelize.define('LeaveBalance', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    memberId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'Members',
            key: 'id'
        }
    },
    leaveTypeId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'LeaveTypes',
            key: 'id'
        }
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    totalDays: {
        type: DataTypes.DECIMAL(4, 1),
        allowNull: false,
        defaultValue: 0
    },
    usedDays: {
        type: DataTypes.DECIMAL(4, 1),
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'LeaveBalances',
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['member_id', 'leave_type_id', 'year']
        }
    ]
});


export default LeaveBalance;
