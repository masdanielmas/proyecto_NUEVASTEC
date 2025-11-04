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
        if (!course) {
            return res.status(404).json({ message: "Curso no encontrado" });
        }

        // Verificar acceso al curso
        if (!course.isPublished && (!req.user || !req.user.isInstructor())) {
            return res.status(403).json({ message: "Acceso no autorizado" });
        }

        const lessons = await Lesson.find({ courseId: req.params.courseId })
            .sort('order');
        
        // Si el usuario está inscrito, incluir su progreso
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

        if (!lesson) {
            return res.status(404).json({ message: "Lección no encontrada" });
        }

        // Verificar acceso al curso
        const course = await Course.findById(req.params.courseId);
        if (!course.isPublished && (!req.user || !req.user.isInstructor())) {
            return res.status(403).json({ message: "Acceso no autorizado" });
        }

        res.json(lesson);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Crear una nueva lección
router.post("/courses/:courseId/lessons", auth, isInstructor, async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: "Curso no encontrado" });
        }

        // Verificar que sea el instructor del curso
        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "No autorizado para añadir lecciones a este curso" });
        }

        const lesson = new Lesson({
            ...req.body,
            courseId: req.params.courseId
        });

        const savedLesson = await lesson.save();
        res.status(201).json(savedLesson);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Actualizar una lección
router.put("/courses/:courseId/lessons/:lessonId", auth, isInstructor, async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) {
            return res.status(404).json({ message: "Curso no encontrado" });
        }

        // Verificar que sea el instructor del curso
        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "No autorizado para editar lecciones de este curso" });
        }

        const lesson = await Lesson.findOneAndUpdate(
            { _id: req.params.lessonId, courseId: req.params.courseId },
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );

        if (!lesson) {
            return res.status(404).json({ message: "Lección no encontrada" });
        }

        res.json(lesson);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Marcar lección como completada
router.post("/courses/:courseId/lessons/:lessonId/complete", auth, async (req, res) => {
    try {
        const progress = await Progress.findOne({
            estudiante: req.user._id,
            curso: req.params.courseId
        });

        if (!progress) {
            return res.status(404).json({ message: "No estás inscrito en este curso" });
        }

        // Actualizar o añadir el progreso de la lección
        const lessonIndex = progress.lecciones_completadas.findIndex(
            lc => lc.leccion.toString() === req.params.lessonId
        );

        if (lessonIndex >= 0) {
            progress.lecciones_completadas[lessonIndex] = {
                ...progress.lecciones_completadas[lessonIndex],
                completada: true,
                fecha_completado: Date.now(),
                tiempo_visto: req.body.tiempo_visto || 0,
                quiz_score: req.body.quiz_score
            };
        } else {
            progress.lecciones_completadas.push({
                leccion: req.params.lessonId,
                completada: true,
                fecha_completado: Date.now(),
                tiempo_visto: req.body.tiempo_visto || 0,
                quiz_score: req.body.quiz_score
            });
        }

        // Actualizar progreso general
        const course = await Course.findById(req.params.courseId);
        const totalLecciones = await Lesson.countDocuments({ courseId: req.params.courseId });
        const leccionesCompletadas = progress.lecciones_completadas.filter(lc => lc.completada).length;
        progress.progreso_general = (leccionesCompletadas / totalLecciones) * 100;

        // Si completó todas las lecciones, generar certificado
        if (progress.progreso_general === 100) {
            progress.certificado = {
                emitido: true,
                fecha_emision: Date.now(),
                url: `https://plataforma.com/certificados/${course._id}-${req.user._id}`
            };
        }

        await progress.save();
        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;