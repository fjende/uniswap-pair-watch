import Mongoose, { Schema } from 'mongoose';
import IPair from '../interface/pair';

const PairSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        dateTime: { type: Date, required: true }
    },
    {
        timestamps: true
    }
);

export default Mongoose.model<IPair>('Pair', PairSchema);
