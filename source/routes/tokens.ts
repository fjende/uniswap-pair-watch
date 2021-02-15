import express from 'express';
import controller from '../controllers/token';

const router = express.Router();

router.get('/tokens', controller.getAllTokens);

export = router;
