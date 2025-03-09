import messageSchema from "../Models/message.model.js";
import mongoose from "mongoose";


export async function getMessages(req, res) {
    try {
        const {senderId, receiverId} = req.body;
        const messages = await messageSchema.find(
            {$or: [
                {senderId: senderId, receiverId: receiverId},
                {senderId: receiverId, receiverId: senderId}
            ]});
        res.status(200).send({messages});
    } catch (error) {
        console.error( error);
    }
}

export async function sendMessage(req, res) {
    try {
        const {senderId, receiverId}= req.body;
        const {content,time} = req.body;
        const newMessage = await messageSchema.create({
            senderId,
            receiverId,
            content,
            time
            
        });
        res.status(201).send({msg:"Message sent successfully", newMessage});

    } catch (error) {
        
    }
}


