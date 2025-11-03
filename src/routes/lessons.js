const express = require("express");
const router = express.Router();
const Course = require("../models/course");
const Lesson = require("../models/lesson");
const Progress = require("../models/progress");
const auth = require("../middleware/auth");
const isInstructor = require("../middleware/isInstructor");

// Obtener todas las lecciones de un curso
router.get("/courses/:courseId/lessons", auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ message: "Curso no encontrado" });

        if (!course.isPublished && (!req.user || !req.user.isInstructor())) {
            return res.status(403).json({ message: "Acceso no autorizado" });
        }

        const lessons = await Lesson.find({ courseId: req.params.courseId })
            .sort('order');
        
        if (req.user) {
            const progress = await Progress.findOne({
                estudiante: req.user._id,
                curso: course._id
            });

            if (progress) {
                const lessonsWithProgress = lessons.map(lesson => {
                    const lessonProgress = progress.lecciones_completadas.find(
                        lc => lc.leccion.toString() === lesson._id.toString()
                    );
                    return {
                        ...lesson.toObject(),
                        completada: lessonProgress ? lessonProgress.completada : false,
                        tiempo_visto: lessonProgress ? lessonProgress.tiempo_visto : 0,
                        quiz_score: lessonProgress ? lessonProgress.quiz_score : null
                    };
                });
                return res.json(lessonsWithProgress);
            }
        }

        res.json(lessons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtener una lección específica
router.get("/courses/:courseId/lessons/:lessonId", auth, async (req, res) => {
    try {
        const lesson = await Lesson.findOne({
            _id: req.params.lessonId,
            courseId: req.params.courseId
        });

        if (!lesson) return res.status(404).json({ message: "Lección no encontrada" });

        const course = await Course.
