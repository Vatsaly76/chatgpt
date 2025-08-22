const mongoose = reuire("mongoose");


const userSchema = new mongoose.Schema({
    fullName: {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        }
    },
    email: {
        type: String,
        required: true,
        unique: true // Ensure email uniqueness
    },
    password: {
        type: String,
        required: true
    }
},
    {
        timestamps: true
    });

const User = mongoose.model("User", userSchema);

module.exports = User;
