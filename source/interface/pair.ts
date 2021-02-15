import { Document } from 'mongoose';

export default interface IPair extends Document {
    name: string;
    dateTime: Date;
}
