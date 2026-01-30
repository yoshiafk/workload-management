import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TimesheetPeriod = sequelize.define('TimesheetPeriod', {
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
    startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'),
        defaultValue: 'DRAFT',
        allowNull: false
    },
    totalHours: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    approvedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    approvedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['memberId', 'startDate', 'endDate']
        }
    ]
});

export default TimesheetPeriod;
