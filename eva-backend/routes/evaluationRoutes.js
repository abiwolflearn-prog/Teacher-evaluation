const express = require('express');
const mongoose = require('mongoose');
const Evaluation = require('../models/Evaluation');
const Teacher = require('../models/Teacher');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Helper to update teacher aggregates
const updateTeacherStats = async (teacherId) => {
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return;

    const evals = await Evaluation.find({ teacher: teacherId });
    const total = evals.length;

    if (total === 0) {
        teacher.averageRating = 0;
        teacher.totalEvaluations = 0;
    } else {
        const sumRating = evals.reduce((acc, curr) => acc + curr.rating, 0);
        teacher.averageRating = Number((sumRating / total).toFixed(2));
        teacher.totalEvaluations = total;
    }
    await teacher.save();
};

// POST new evaluation
router.post('/', protect, async (req, res) => {
    const { teacherId, college, program, year, semester, rating, criteria, comment } = req.body;
    
    if (!teacherId || !mongoose.Types.ObjectId.isValid(teacherId)) {
        return res.status(400).json({ message: 'Valid Teacher ID is required' });
    }

    const numericRating = Number(rating);
    if (!numericRating || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
    }

    try {
        // Prevent duplicate evaluation
        const existingEval = await Evaluation.findOne({ student: req.user._id, teacher: teacherId });
        if (existingEval) return res.status(400).json({ message: 'You have already evaluated this teacher' });

        const evaluation = await Evaluation.create({
            student: req.user._id,
            teacher: teacherId,
            college: college || '',
            program: program || '',
            year: Number(year) || 1,
            semester: Number(semester) || 1,
            rating: numericRating,
            criteria: criteria || {},
            comment: comment || ''
        });

        // Update teacher average ratings
        await updateTeacherStats(teacherId);

        res.status(201).json(evaluation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET evaluations by teacher ID
router.get('/teacher/:id', protect, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid teacher ID format' });
    }
    try {
        const evaluations = await Evaluation.find({ teacher: req.params.id })
            .populate('student', 'name')
            .sort('-createdAt');
            
        res.json(evaluations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET analytics: average rating per college
// IMPORTANT: Must be defined BEFORE /:id to prevent Express matching 'analytics' as an ID
router.get('/analytics', protect, async (req, res) => {
    try {
        const stats = await Evaluation.aggregate([
            {
                $group: {
                    _id: '$college',
                    averageRating: { $avg: '$rating' },
                    totalEvaluations: { $sum: 1 }
                }
            },
            { $sort: { averageRating: -1 } }
        ]);

        const formattedStats = stats.map(s => ({
            college: s._id,
            averageRating: s.averageRating.toFixed(2),
            totalEvaluations: s.totalEvaluations
        }));

        const topCollege = formattedStats.length > 0 ? formattedStats[0] : null;

        res.json({
            colleges: formattedStats,
            topCollege
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET my evaluations
// IMPORTANT: Must be defined BEFORE /:id to prevent Express matching 'me' as an ID
router.get('/me', protect, async (req, res) => {
    try {
        const evaluations = await Evaluation.find({ student: req.user._id })
            .populate('teacher', 'name courseName')
            .sort('-createdAt');
        res.json(evaluations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET evaluation by ID
router.get('/:id', protect, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid evaluation ID format' });
    }
    try {
        const evaluation = await Evaluation.findById(req.params.id);
        if (!evaluation) return res.status(404).json({ message: 'Evaluation not found' });
        res.json(evaluation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT update evaluation
router.put('/:id', protect, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid evaluation ID format' });
    }
    const { rating, criteria, comment } = req.body;
    try {
        const evaluation = await Evaluation.findById(req.params.id);
        if (!evaluation) return res.status(404).json({ message: 'Evaluation not found' });
        
        // Ensure user owns this evaluation
        if (evaluation.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to modify this evaluation' });
        }

        if (rating !== undefined) {
            const numericRating = Number(rating);
            if (numericRating >= 1 && numericRating <= 5) {
                evaluation.rating = numericRating;
            }
        }
        if (criteria !== undefined) evaluation.criteria = criteria;
        if (comment !== undefined) evaluation.comment = comment;

        await evaluation.save();

        // Update teacher average ratings
        await updateTeacherStats(evaluation.teacher);

        res.json(evaluation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE evaluation
router.delete('/:id', protect, async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid evaluation ID format' });
    }
    try {
        const evaluation = await Evaluation.findById(req.params.id);
        if (!evaluation) return res.status(404).json({ message: 'Evaluation not found' });
        
        // Ensure user owns this evaluation
        if (evaluation.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this evaluation' });
        }

        const teacherId = evaluation.teacher;
        await evaluation.deleteOne();

        // Update teacher average ratings
        await updateTeacherStats(teacherId);

        res.json({ message: 'Evaluation removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
