const mongoose = require("mongoose");

const progressSchema = mongoose.Schema({
    estudiante: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    curso: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true

    },
    lecciones_completadas: [{
        leccion: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson'
        },
        completada: {
            type: Boolean,
            default: false
        },
        fecha_completado: Date,
        tiempo_visto: Number, // en segundos
        quiz_score: Number
    }],
    ultima_leccion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    },
    certificado: {
        emitido: {
            type: Boolean,
            default: false
        },
        fecha_emision: Date,
        url: String
    },

    notas: [{
        leccion: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson'
        },
        contenido: String,
        fecha: {
            type: Date,
            default: Date.now
        }
    }],
    progreso_general: {
        type: Number,
        default: 0
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});
// Índice compuesto para evitar duplicados
progressSchema.index({ estudiante: 1, curso: 1 }, { unique: true });

module.exports = mongoose.model("Progress", progressSchema);
