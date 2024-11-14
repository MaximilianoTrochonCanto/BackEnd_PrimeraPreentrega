import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    species: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
        min: 0,
    },
});

const PetModel = mongoose.model('Pet', petSchema);

export default PetModel;
