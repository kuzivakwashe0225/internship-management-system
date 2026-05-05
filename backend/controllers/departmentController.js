const Department = require('../models/Department');

exports.createDepartment = async (req, res) => {
    try {
        const { name, code, description } = req.body;

        if (!name || !code) {
            return res.status(400).json({ message: 'Name and code are required' });
        }

        const department = await Department.create({ name, code, description });
        res.status(201).json(department);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Department name or code already exists' });
        }
        res.status(500).json({ message: error.message });
    }
};

exports.getDepartments = async (req, res) => {
    try {
        const departments = await Department.find().sort('name');
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndDelete(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.json({ message: 'Department deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
