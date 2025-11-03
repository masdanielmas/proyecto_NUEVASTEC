const mongoose = require("mongoose");

const lessonSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    order: {
        type: Number,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    videoUrl: {
        type: String,
    },
    duration: {
        type: Number, // duración en minutos
        required: true,},});