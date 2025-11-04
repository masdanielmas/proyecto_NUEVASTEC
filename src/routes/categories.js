const express = require("express");
const router = express.Router();
const Category = require("../models/category");
const auth = require("../middleware/auth");

// Crear categoría (solo admin)
router.post("/categories", auth, async (req, res) => {
    try {
        if (!req.user.isAdmin()) {
            return res.status(403).json({ message: "Solo administradores pueden crear categorías" });
        }

        const category = new Category(req.body);
        const saved = await category.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Listar categorías (público)
router.get("/categories", async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true })
            .sort('order')
            .select('name description slug icon');
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

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
