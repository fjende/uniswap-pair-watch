import express from 'express';
import controller from '../controllers/pair';

const router = express.Router();

router.get('/pairs', controller.getAllPairs);

export = router;
