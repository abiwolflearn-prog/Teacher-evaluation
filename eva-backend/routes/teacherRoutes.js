const express = require('express');
const mongoose = require('mongoose');
const Teacher = require('../models/Teacher');
const Evaluation = require('../models/Evaluation');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

// GET all teachers with filters
router.get('/', protect, async (req, res) => {
    try {
        const query = {};
        if (req.query.college) query.college = req.query.college;
        if (req.query.program) query.program = req.query.program;
        if (req.query.year) query.year = Number(req.query.year);
        if (req.query.semester) query.semester = Number(req.query.semester);
        if (req.query.search) query.name = { $regex: req.query.search, $options: 'i' };

        const teachers = await Teacher.find(query).sort('name');
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET teacher by ID
router.get('/:id', protect, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid teacher ID format' });
    }
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
        res.json(teacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ADMIN: Create teacher
router.post('/', protect, admin, async (req, res) => {
    const { name, college, program, courseName, year, semester } = req.body;
    if (!name || !college || !program || !courseName) {
        return res.status(400).json({ message: 'Name, college, program, and course name are required' });
    }

    try {
        const teacher = await Teacher.create({
            name: name.trim(),
            college,
            program,
            courseName: courseName.trim(),
            year: Number(year) || 1,
            semester: Number(semester) || 1,
            averageRating: 0,
            totalEvaluations: 0
        });
        res.status(201).json(teacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ADMIN: Update teacher
router.put('/:id', protect, admin, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid teacher ID format' });
    }
    try {
        const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
        res.json(teacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ADMIN: Delete teacher
router.delete('/:id', protect, admin, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid teacher ID format' });
    }
    try {
        const teacher = await Teacher.findById(req.params.id);
        if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
        
        // Delete related evaluations
        await Evaluation.deleteMany({ teacher: teacher._id });
        
        await teacher.deleteOne();
        res.json({ message: 'Teacher and related evaluations deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
