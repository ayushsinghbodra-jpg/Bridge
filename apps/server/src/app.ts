import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
const app=express();
const PORT=process.env.PORT;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/health',(req,res)=>{
  res.json({ status: 'Server is running' });
});
app.listen(PORT,()=>{
  console.log(`Server is running on the PORT ${PORT}`);
});
export default app;