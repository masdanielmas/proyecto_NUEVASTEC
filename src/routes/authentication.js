const bcrypt = require("bcrypt");
const express = require("express");
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require("../models/user");
const auth = require('../middleware/auth');

module.exports = router;
<<<<<<< HEAD
=======
// Registro de usuario
router.post('/signup', async (req, res) => {
    try {
        const existingUser = await User.findOne({ correo: req.body.correo });
        if (existingUser) {
            return res.status(400).json({ message: "El correo ya está registrado" });
        }

        const user = new User({
            usuario: req.body.usuario,
            correo: req.body.correo,
            clave: req.body.clave,
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            rol: req.body.rol || 'estudiante',
            pais: req.body.pais
        });

        user.clave = await user.encryptClave(user.clave);
        await user.save();

        const token = jwt.sign(
            { _id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: "Usuario registrado exitosamente",
            token,
            user: {
                id: user._id,
                usuario: user.usuario,
                correo: user.correo,
                nombre: user.nombre,
                apellido: user.apellido,
                rol: user.rol
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Inicio de sesión
router.post("/login", async (req, res) => {
    try {
        const { correo, clave } = req.body;
        if (!correo || !clave) {
            return res.status(400).json({ message: "Correo y contraseña son requeridos" });
        }

        const user = await User.findOne({ correo });
        if (!user) {
            return res.status(400).json({ message: "Credenciales inválidas" });
        }

        if (user.estado !== 'activo') {
            return res.status(403).json({ message: "Cuenta desactivada. Contacte al soporte." });
        }

        const validPassword = await user.validatePassword(clave);
        if (!validPassword) {
            return res.status(400).json({ message: "Credenciales inválidas" });
        }

        const token = jwt.sign(
            { _id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        user.ultima_conexion = new Date();
        await user.save();

        res.json({
            token,
            user: {
                id: user._id,
                usuario: user.usuario,
                correo: user.correo,
                nombre: user.nombre,
                apellido: user.apellido,
                rol: user.rol,
                avatar: user.avatar
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Obtener perfil
router.get("/profile", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-clave')
            .populate('cursos_inscritos.curso', 'title thumbnail')
            .populate('cursos_creados', 'title thumbnail totalStudents');

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Actualizar perfil
router.put("/profile", auth, async (req, res) => {
    try {
        const updates = {
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            biografia: req.body.biografia,
            pais: req.body.pais,
            avatar: req.body.avatar,
            redes_sociales: req.body.redes_sociales,
            preferencias: req.body.preferencias
        };

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-clave');

        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// Cambiar contraseña
router.post("/change-password", auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const validPassword = await req.user.validatePassword(currentPassword);
        if (!validPassword) {
            return res.status(400).json({ message: "Contraseña actual incorrecta" });
        }

        req.user.clave = await req.user.encryptClave(newPassword);
        await req.user.save();

        res.json({ message: "Contraseña actualizada exitosamente" });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
>>>>>>> 354b200 (Se agrega el endpoint /change-password para actualización segura de contraseña mediante autenticación JWT)
