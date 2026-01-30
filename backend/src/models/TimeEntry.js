import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TimeEntry = sequelize.define('TimeEntry', {
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
    allocationId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Allocations',
            key: 'id'
        },
        comment: 'Optional link to a specific project allocation'
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    hours: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        validate: {
            min: 0,
            max: 24
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    taskId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Legacy or external task ID reference'
    },
    category: {
        type: DataTypes.ENUM('PROJECT', 'SUPPORT', 'ADMIN', 'MEETING', 'OTHER'),
        defaultValue: 'PROJECT'
    },
    timesheetPeriodId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'TimesheetPeriods',
            key: 'id'
        }
    }
}, {
    timestamps: true
});

export default TimeEntry;
