const express = require("express");
const router = express.Router();
const Course = require("../models/course");
const Lesson = require("../models/lesson");
const Progress = require("../models/progress");
const Comment = require("../models/comment");
const auth = require("../middleware/auth");
const isInstructor = require("../middleware/isInstructor");

// Listar cursos (público)
router.get("/courses", async (req, res) => {
    try {
        const filter = {};
        // Filtros opcionales
        if (req.query.category) filter.category = req.query.category;
        if (req.query.level) filter.level = req.query.level;
        if (req.query.instructor) filter.instructor = req.query.instructor;

        // Solo mostrar cursos publicados a menos que sea el instructor
        if (!req.user || !req.user.isInstructor()) {
            filter.isPublished = true;
        }

        const limit = parseInt(req.query.limit) || 10;
        const skip = parseInt(req.query.skip) || 0;

        const courses = await Course.find(filter)
            .populate('instructor', 'usuario nombre apellido')
            .populate('category', 'name')
            .skip(skip)
            .limit(limit)
            .sort('-createdAt');

        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtener un curso específico
router.get("/courses/:id", async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'usuario nombre apellido biografia')
            .populate('category', 'name');

        if (!course) {
            return res.status(404).json({ message: "Curso no encontrado" });
        }

        // Si el curso no está publicado, solo el instructor puede verlo
        if (!course.isPublished && (!req.user || !req.user.isInstructor())) {
            return res.status(403).json({ message: "Acceso no autorizado" });
        }

        res.json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Crear un nuevo curso (solo instructores)
router.post("/courses", auth, isInstructor, async (req, res) => {
    try {
        const course = new Course({
            ...req.body,
            instructor: req.user._id
        });

        const savedCourse = await course.save();
        res.status(201).json(savedCourse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Actualizar un curso (solo instructor del curso)
router.put("/courses/:id", auth, isInstructor, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: "Curso no encontrado" });
        }

        // Verificar que sea el instructor del curso
        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "No autorizado para editar este curso" });
        }

        Object.assign(course, req.body);
        course.updatedAt = Date.now();

        const updatedCourse = await course.save();
        res.json(updatedCourse);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Eliminar un curso (solo instructor del curso o admin)
router.delete("/courses/:id", auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: "Curso no encontrado" });
        }

        // Verificar permisos
        if (!req.user.isAdmin() && course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "No autorizado para eliminar este curso" });
        }

        await course.remove();
        res.json({ message: "Curso eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Inscribirse en un curso
router.post("/courses/:id/enroll", auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: "Curso no encontrado" });
        }

        // Verificar si ya está inscrito
        const isEnrolled = req.user.cursos_inscritos.some(c => c.curso.toString() === course._id.toString());
        if (isEnrolled) {
            return res.status(400).json({ message: "Ya estás inscrito en este curso" });
        }

        // Agregar curso a la lista de inscritos del usuario
        req.user.cursos_inscritos.push({
            curso: course._id,
            fecha_inscripcion: Date.now()
        });
        await req.user.save();

        // Incrementar contador de estudiantes
        course.totalStudents += 1;
        await course.save();

        // Crear registro de progreso
        const progress = new Progress({
            estudiante: req.user._id,
            curso: course._id
        });
        await progress.save();

        res.status(201).json({ message: "Inscripción exitosa" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;