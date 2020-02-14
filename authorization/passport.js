import { ExtractJwt } from 'passport-jwt'
import configkeys from "./../config";
import { Users } from "./../api/users/users.model";
import bcrypt from 'bcrypt-nodejs'

const passport = require("passport");
const JwtStrategy = require("passport-jwt").Strategy;
const LocalStrategy = require("passport-local");

const localOptions = {
    usernameField: "email"
  };

const localLoginNew =new LocalStrategy(
    localOptions,
    async (email,password,done)=>{
        //console.log(email , password)
        try{
            const userInfo = await Users.findOne({
                emailId: email.toLowerCase()
            });
            //console.log(userInfo)
            if(!userInfo){
                return done("Either Password or EmailId Doesn't match",false);
            }
            const validPassword = await bcrypt.compareSync(password, userInfo.password);
            //console.log(validPassword)
            if(!validPassword){
                return done("Password is Incorrect Please try Again later",false);
            }
            const existingUser = await Users.aggregate([
                {
                    $match:{
                        emailId: email.toLowerCase()
                    }
                },
                {
                    $project:{
                        _id:1,
                        userId:'$_id',
                        colId: 1,
                        firstName: 1,
                        lastName: 1,
                        emailId: 1,
                        mobileNo: 1,
                        role: 1,
                    }
                }
            ]);
            //console.log(existingUser)
            if (existingUser.length > 0) {
                // Passport assigns this to req.user
                return done(null, existingUser[0]);
            }
            return done(
                "No user exists with the specified email ID who is active in the system",
                false
            );
        }
        catch (err) {
            console.log(err);
            return done("System was unable to process the details", false);
          }
    }
);
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader("authorization"),
    secretOrKey: configkeys.secrets.JWT_SECRET
}

const jwtLoginNew = new JwtStrategy(jwtOptions, (payload, done)=>{
    console.log("CHECKING LOGIN USING JWT");
    Users.aggregate([
        {
            $match:{
                emailId: {
                    $regex: payload.sub,
                    $options: "i"
                  }
            }
        }
    ],(err,user)=>{
        if (err) {
            return done(err, false);
          }
        if (user.length > 0) {
            done(null, user[0]);
        } else {
            done(null, false);
        }
    });
});

passport.use(jwtLoginNew);

passport.use(localLoginNew);