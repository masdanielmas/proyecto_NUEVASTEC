// Marcar lección como completada
router.post("/courses/:courseId/lessons/:lessonId/complete", auth, async (req, res) => {
    try {
        const progress = await Progress.findOne({
            estudiante: req.user._id,
            curso: req.params.courseId
        });

        if (!progress) return res.status(404).json({ message: "No estás inscrito en este curso" });

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

        const course = await Course.findById(req.params.courseId);
        const totalLecciones = await Lesson.countDocuments({ courseId: req.params.courseId });
        const leccionesCompletadas = progress.lecciones_completadas.filter(lc => lc.completada).length;
        progress.progreso_general = (leccionesCompletadas / totalLecciones) * 100;

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
