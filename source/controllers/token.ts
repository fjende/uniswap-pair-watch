import { NextFunction, Request, Response } from 'express';
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

export default { getAllTokens };
