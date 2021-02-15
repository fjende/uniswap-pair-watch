import { NextFunction, Request, Response } from 'express';
import Pair from '../models/Pair';

const getAllPairs = (req: Request, res: Response, next: NextFunction) => {
    Pair.find()
        .exec()
        .then((results) => {
            return res.status(200).json({
                pairs: results,
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

export default { getAllPairs };
