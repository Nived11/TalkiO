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

export async function Home(req,res){
    try{
        console.log("end point");
        console.log(req.user);
        const _id=req.user.userID;
        console.log(_id);
        
        const user=await userSchema.findOne({_id});
        res.status(200).send({_id:_id,name:user.name,email:user.email,phone:user.phone,profileImage:user.profileImage});  
    }catch(error){
        res.status(400).send({error})
    }
}

export async function profileUser(req, res) {
    try {
        const {id } = req.params;
        console.log(id);

        const user = await userSchema.findById(id);
        if (!user) {
            return res.status(404).send({ msg: "User not found" });
        }
        return res.status(200).send({ 
            _id:user._id,
            name:user.name,
            email:user.email,
            phone:user.phone,
            profileImage:user.profileImage
        });
    } catch (error) {
        return res.status(500).send({ error});
    }
}

export async function updateUser(req, res) {
    try {
        const { id } = req.params;
        const { name, phone, profileImage } = req.body;
        console.log({ name,phone, });
        const updateData = { name: name || user.name, phone: phone || user.phone};
        if (profileImage) {
            updateData.profileImage = profileImage;
        }
        const updatedUser = await userSchema.findByIdAndUpdate(id, updateData, { new: true } );
        if (!updatedUser) {
            return res.status(500).send({ msg: "Failed to update user" });
        }
        return res.status(200).send({ msg: "User updated successfully", 
            user: { name: updatedUser.name, phone: updatedUser.phone, profileImage: updatedUser.profileImage }});
    } catch (error) {
        console.error(error);
        return res.status(500).send({  msg: {error}});
    }
}

export async function getContacts(req, res) {
    try{
        const logedUser_id=req.body._id;
        const contacts=await userSchema.find({ _id: { $ne: logedUser_id } });
        res.status(200).send(contacts)
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: error.message });
    }
}

