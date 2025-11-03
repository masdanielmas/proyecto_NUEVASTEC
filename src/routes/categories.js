// Obtener una categoría
router.get("/categories/:id", async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: "Categoría no encontrada" });
        }
        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
