// Solo para desarrollo - listar usuarios
router.get("/users", async (req, res) => {
    try {
        const users = await User.find().select('usuario correo nombre apellido rol');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;