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
        if (!course) return res.status(404).json({ message: "Curso no encontrado" });

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
