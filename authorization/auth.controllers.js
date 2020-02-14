import bcrypt from 'bcrypt-nodejs'
import jwt from 'jsonwebtoken'
import configKey from '../config'
import mongoose from 'mongoose'
import nodemailer from 'nodemailer'
import { getUserDetails } from "../commonDbFunctions";
import { Users } from '../api/users/users.model'

const smtpTransport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: "shubhamkanani605@gmail.com",
      pass: 's9825784600'
    }
  });
  const emailConfirmation = (user, emailId) => {
    const token = tokenForUser(user);
    const data = {
      to: emailId,
      from: process.env.MAILER_EMAIL_ID,
      subject: "Confirm your email address to get started ",
      text:
        "Confirm your email address to get started.\n\n" +
        "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
        "http://localhost:8080/auth/signupconfirm?token=" +
        token +
        "\n\n" +
        "If you did not request this, please ignore this email and your password will remain unchanged.\n"
    };
    smtpTransport.sendMail(data, err => {
        return err ? console.log("Email Error==>", err) : "";
        // : res.status(201).send({
        //     success: true,
        //     message: "User created successfully."
        //   });
      });
    };
    const expirationInterval =
        (process.env.NODE_ENV === "development")? 30 * 24 * 60 * 60: (parseInt(process.env.JWTSECRET) || 1) * 24 * 60 * 60;
    
    const tokenForUser = (user, loginDetails) => {
        try {
          //console.log(user.emailId)
          const timestamp = new Date().getTime();
          return jwt.sign(
            {
              sub: user.emailId,
              iat: timestamp,
              // entityDetails: loginDetails.relatedFaEntities[0],
              exp: Math.floor(Date.now() / 1000) + expirationInterval
            },
            configKey.secrets.JWT_SECRET
          );
        } catch (err) {
          throw err;
        }
      };
    export const signin = async (req,res)=>{
      const {email} = req.body;
      try{
      const [userDetails] = await Promise.all([getUserDetails(email)]);
        //console.log(userDetails);
        if(Object.keys(userDetails.length>0)){
          //console.log(tokenForUser(userDetails,''),"signin");
          res.status(200).send({
            success: true,
            token: tokenForUser(userDetails)
          });
        }
      }
      catch (err){
        res.status(422).send({
          success: false,
          error: `Unable to Login using email - ${email}`
        });
      }
    }
    export const signup = async (req,res)=>{
      const {firstName, lastName, role} = req.body;
      let { emailId, password } = req.body;
      emailId = emailId.toLowerCase();
      const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      //console.log(emailId,"sajfjdsnf")
      if (!emailRegexp.test(emailId)) {
        return res.status(422).send({ success: false, message: "Invalid Email" });
      }
      const isEmailExist = await Users.findOne({emailId: emailId});
      if(isEmailExist){
        return res
          .status(422)
          .send({ success: false, message: "Email is alrady exist" });
      }
      password = bcrypt.hashSync(password);
      try{
        await Users.create({
          firstName,
          lastName,
          emailId,
          password,
          role,
        });
        return res.status(201).send({
          success: true,
          message: "User created successfully."
        });
      }
      catch (err) {
        
        res.status(422).send({ success: false, message: err.message });
      }
    };
    export const forgotPassword = async (req, res) => {
      
      let { emailId } = req.body;
      emailId = emailId.toLowerCase();
      const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      //console.log(emailRegexp.test(emailId))
      if (!emailRegexp.test(emailId)) {
        return res.status(422).send({ success: false, message: "Invalid Email" });
      }
      
      const isEmailExist = await Users.findOne({
        emailId: emailId
      }).then(data => {
        return data ? true : false;
      });
      //console.log(isEmailExist)
      if (!isEmailExist) {
        return res
          .status(422)
          .send({ success: false, message: "email in not registered" });
      }
      const token = tokenForUser(req.body);
      //console.log(token,"token")
      console.log(process.env.MAILER_EMAIL_ID)
      const data = {
        to: emailId,
        from: process.env.MAILER_EMAIL_ID,
        subject: "Password help has arrived!",
        text:
          "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
          "Please click on the following link, or paste this into your browser to complete the process:\n\n" +
          "http://localhost:3000/resetpassword?token=" +
          token +
          "\n\n" +
          "If you did not request this, please ignore this email and your password will remain unchanged.\n"
      };
      await smtpTransport.sendMail(data, err => {
        //console.log(err)
        return err
          ? res.status(422).send({
              success: false,
              message: err
            })
          : res.status(200).send({
              success: true,
              message: "please check your email to reset your password!"
            });
      });
    };
    export const resetPassword = async (req, res) => {
      const token = req.query.token;
      //console.log(req.body.password , token)
      try {
        const decoded = await jwt.verify(token, configKey.secrets.JWT_SECRET);
        const password = bcrypt.hashSync(req.body.password);
        try {
          await Users.findOneAndUpdate(
            { emailId: decoded.sub },
            { password: password }
          );
          return res.status(200).send({
            success: true,
            message: "your password changed successfully!"
          });
        } catch (err) {
          res.status(422).send({ success: false, message: err.message });
        }
      } catch (error) {
        res.status(422).send({ success: false, message: "unauthorized" });
      }
    };