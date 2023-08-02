import mongoose from 'mongoose';

const movieSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	authorId: {
		type: String,
		required: true
	}
}, { timestamps: true });

const MovieModel = mongoose.model('Movie', movieSchema);
export default MovieModel;