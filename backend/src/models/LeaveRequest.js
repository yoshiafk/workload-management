import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const LeaveRequest = sequelize.define('LeaveRequest', {
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
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    days: {
        type: DataTypes.DECIMAL(4, 1),
        allowNull: false
    },
    halfDay: {
        type: DataTypes.ENUM('FULL', 'AM', 'PM'),
        defaultValue: 'FULL'
    },
    reason: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'),
        allowNull: false,
        defaultValue: 'PENDING'
    },
    reviewedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'LeaveRequests',
    underscored: true
});


export default LeaveRequest;
