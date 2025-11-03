// Crear una nueva lección
router.post("/courses/:courseId/lessons", auth, isInstructor, async (req, res) => {
    try {
        const course = await Course.findById(req.params.courseId);
        if (!course) return res.status(404).json({ message: "Curso no encontrado" });

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
        if (!course) return res.status(404).json({ message: "Curso no encontrado" });

        if (course.instructor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "No autorizado para editar lecciones de este curso" });
        }

        const lesson = await Lesson.findOneAndUpdate(
            { _id: req.params.lessonId, courseId: req.params.courseId },
            { ...req.body, updatedAt: Date.now() },
            { new: true }
        );

        if (!lesson) return res.status(404).json({ message: "Lección no encontrada" });

        res.json(lesson);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
