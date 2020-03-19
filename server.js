import express from "express";
import setupMiddware from "./middlewares"
import cors from "cors";
import {connect} from './db'
import { authRouter } from "./authorization"
import  {apiErrorHandler, restRouter} from './api'

const app = express()
//console.log("THIS IS THE ENVIRONMENT", process.env.NODE_ENV)
setupMiddware(app)

require("dotenv").config()

connect();
//const env = process.env.NODE_ENV || "development"
//console.log(process.env.NODE_ENV )
app.use(cors());
app.use('/auth',(req ,res ,next)=>{
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Authorization, Accept, Access-Control-Al" +
          "low-Methods"
      )
    res.header("X-Frame-Options", "deny")
    res.header("X-Content-Type-Options", "nosniff")

    next()
})
app.use(express.static('public'))
app.use("/auth", authRouter);
app.use('/api',(req ,res ,next)=>{
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
  res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Authorization, Accept, Access-Control-Al" +
        "low-Methods"
    )
  res.header("X-Frame-Options", "deny")
  res.header("X-Content-Type-Options", "nosniff")

  next()
})
app.use('/api', restRouter);
app.use(apiErrorHandler)

export default app