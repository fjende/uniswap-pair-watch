import { Document } from 'mongoose';

export default interface IToken extends Document {
    name: String;
}
