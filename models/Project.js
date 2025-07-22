import mongoose, { Schema } from "mongoose";


const projectSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description:{
        type: String
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }

});

const Project = mongoose.model("Project", projectSchema);
export default Project;