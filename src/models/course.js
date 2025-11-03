const mongoose = require("mongoose");

const courseSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    level: {
        type: String,
        enum: ['principiante', 'intermedio', 'avanzado'],
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    duration: {
        type: Number,
        required: true, // duración en minutos
    },
    thumbnail: {
        type: String,
        required: true,
    },
    requirements: [{
        type: String
    }],
    objectives: [{
        type: String
    }],
    rating: {
        type: Number,
        default: 0,
    },
    totalStudents: {
        type: Number,
        default: 0,
    },
    isPublished: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("Course", courseSchema);
