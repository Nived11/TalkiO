import userSchema from "../Models/user.model.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
const {sign}=jwt


export async function register(req,res){
   try {
    const {name,email,password,phone,cpassword,profileImage}=req.body
    console.log(name,email,phone,password,cpassword)
    if(!name&&!email&&!password&&!phone){
        return res.status(400).send({msg:"some fields are empty fill them and try again"})
    };
    if(password!==cpassword)
        return(res.status(404).send({msg:"password not match"}));
    const data=await userSchema.findOne({email})
    if(data)
        return(res.status(404).send({msg:"Email already exist try another mail"}));
    const hpassword=await bcrypt.hash(password,10)
    console.log(hpassword);
    await userSchema.create({name,email,password:hpassword,phone,profileImage});
    res.status(201).send({msg:"successfully registered"});
    
   } catch (error) {
    res.status(500).send({error})
   }
}

export async function login(req,res){
    try {
        const {email,password}=req.body
        if(!(email&&password))
            return res.status(404).send({msg:"Fields are empty"});
        const user=await userSchema.findOne({email});
        if(email!==user.email)
            return res.status(404).send({msg:"User not found"});
        const login=await bcrypt.compare(password,user.password);
        console.log(login);
        if(!login)
            return res.status(401).send({msg:"Incorrect password"});
        const token=await sign({userID:user._id},process.env.JWT_KEY,
            {expiresIn:"24h"});
        res.status(200).send({msg:"successfully logged in",token});

    } catch (error) {
        console.log(error);
        res.status(400).send({error})
        
    }
}