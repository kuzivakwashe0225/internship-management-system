const Course = require('../models/Course');

exports.createCourse = async (req, res) => {
    try {
        const { code, name, department } = req.body;

        if (!code || !name || !department) {
            return res.status(400).json({ message: 'Code, name, and department are required' });
        }

        const course = await Course.create({ code, name, department });
        res.status(201).json(course);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Course code already exists' });
        }
        res.status(500).json({ message: error.message });
    }
};

exports.getCourses = async (req, res) => {
    try {
        const courses = await Course.find().sort('department code');
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
