// Eliminar un curso (solo instructor del curso o admin)
router.delete("/courses/:id", auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: "Curso no encontrado" });

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
        if (!course) return res.status(404).json({ message: "Curso no encontrado" });

        const isEnrolled = req.user.cursos_inscritos.some(c => c.curso.toString() === course._id.toString());
        if (isEnrolled) return res.status(400).json({ message: "Ya estás inscrito en este curso" });

        req.user.cursos_inscritos.push({ curso: course._id, fecha_inscripcion: Date.now() });
        await req.user.save();

        course.totalStudents += 1;
        await course.save();

        const progress = new Progress({ estudiante: req.user._id, curso: course._id });
        await progress.save();

        res.status(201).json({ message: "Inscripción exitosa" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

