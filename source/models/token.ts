import Mongoose, { Schema } from 'mongoose';
import IToken from '../interface/token';

const TokenSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        dateAdded: { type: Date, required: true }
    },
    {
        timestamps: true
    }
);

export default Mongoose.model<IToken>('Token', TokenSchema);
