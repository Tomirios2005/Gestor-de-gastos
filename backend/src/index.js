import chatRoutes from './routes/chat.js';
import dotenv from 'dotenv'
dotenv.config()
import express from 'express';
import cors from 'cors';
const app = express();
const port = 3000;
app.use(express.json());

app.use(cors({ origin: process.env.CLIENT_URL }))

app.use('/api/chat', chatRoutes);



app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});