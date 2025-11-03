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
        required: true},
    resources: [{
        title: String,
        url: String,
        type: {
            type: String,
            enum: ['pdf', 'video', 'link', 'code']
        }
    }],
    quiz: [{
        question: String,
        options: [String],
        correctAnswer: Number
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("Lesson", lessonSchema);