const mongoose = require("mongoose"); // importando el componente mongoose
const bcrypt = require("bcrypt"); // importando el componente bcrypt

const userSchema = mongoose.Schema({
    usuario: {
        type: String,
        required: true
    },
    correo: {
        type: String,
        required: true,
        unique: true
    },
    clave: {
        type: String,
        required: true
    },
    nombre: {
        type: String,
        required: true
    },
    apellido: {
        type: String,
        required: true
    },
    rol: {
        type: String,
        enum: ['estudiante', 'instructor', 'admin'],
        default: 'estudiante'
    },
    avatar: {
        type: String,
        default: 'default-avatar.png'
    },
    biografia: {
        type: String
    },
    pais: {
        type: String
    },
    cursos_inscritos: [{
        curso: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        },
        fecha_inscripcion: {
            type: Date,
            default: Date.now
        },
        completado: {
            type: Boolean,
            default: false
        }
    }],
    cursos_creados: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    redes_sociales: {
        website: String,
        twitter: String,
        linkedin: String,
        github: String
    },
    preferencias: {
        notificaciones_email: {
            type: Boolean,
            default: true
        },
        idioma: {
            type: String,
            default: 'es'
        }
    },
    ultima_conexion: {
        type: Date
    },
    estado: {
        type: String,
        enum: ['activo', 'inactivo', 'bloqueado'],
        default: 'activo'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

userSchema.methods.encryptClave = async(clave) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(clave, salt);
};

// Método para verificar la contraseña
userSchema.methods.validatePassword = async function(clave) {
    return await bcrypt.compare(clave, this.clave);
};

// Método para verificar si es instructor
userSchema.methods.isInstructor = function() {
    return this.rol === 'instructor';
};

// Método para verificar si es admin
userSchema.methods.isAdmin = function() {
    return this.rol === 'admin';
};

module.exports = mongoose.model('User', userSchema);
