import { NextFunction, Request, Response } from 'express';
import Mongoose from 'mongoose';
import Token from '../models/token';

const getAllTokens = (req: Request, res: Response, next: NextFunction) => {
    Token.find()
        .exec()
        .then((results) => {
            return res.status(200).json({
                tokens: results,
                count: results.length
            });
        })
        .catch((error) => {
            return res.status(500).json({
                message: error.messagem,
                error
            });
        });
};

const createNewToken = (req: Request, res: Response, next: NextFunction) => {
    let { name, dateAdded } = req.body;

    const token = new Token({
        _id: new Mongoose.Types.ObjectId(),
        name,
        dateAdded
    });

    return token
        .save()
        .then((result) => {
            return res.status(201).json({
                token: result
            });
        })
        .catch((error) => {
            return res.status(500).json({
                message: error.messagem,
                error
            });
        });
};

export default { getAllTokens, createNewToken };
