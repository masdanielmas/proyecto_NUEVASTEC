const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
    autor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    contenido: {
        type: String,
        required: true
    },
    tipo: {
        type: String,
        enum: ['comentario', 'pregunta'],
        required: true
    },
    curso: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    leccion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    },
    respuestas: [{
        autor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        contenido: String,
        fecha: {
            type: Date,
            default: Date.now
        },
        es_respuesta_instructor: {
            type: Boolean,
            default: false
        },
        votos: {
            type: Number,
            default: 0
        }
    }],
    votos: {
        type: Number,
        default: 0
    },
    estado: {
        type: String,
        enum: ['pendiente', 'respondida', 'resuelta'],
        default: 'pendiente'
    },
    etiquetas: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Comment", commentSchema);