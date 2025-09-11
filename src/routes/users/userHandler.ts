import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../firebase/server";
import admin from 'firebase-admin'
import { getUserId } from "../../utils/auth";
import { assert } from "console";
import { get } from "http";

export async function createuserHandler(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUserId(request, reply);
    if(!userId){
        return;
    }
    try {
        const {id,email,displayname} = request.body as {id:string,email:string,displayname:string};
        if(!id||!email||!displayname){
            reply.status(400).send({message:"details not provided!"});
            return;
        }
        const userDoc = await db.collection('users').doc(userId).get();
        if(userDoc.exists){
            reply.status(400).send({message:"user already exists!"});
            return;
        }
        const newUser = {
            id,
            email,
            displayname,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await db.collection('users').doc(userId).set(newUser);
        reply.status(201).send({message:"user created successfully"});
    } catch (error) {
        
    }
}

export async function getuserHandler(request: FastifyRequest,reply: FastifyReply) {
    const userId = getUserId(request, reply);
    if(!userId){
        return;
    }
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if(!userDoc.exists){
            reply.status(404).send({message:"user not found"});
            return;
        }
        const userData = userDoc.data();
        reply.status(200).send({id:userDoc.id,...userData});
    } catch (error) {
        console.error("Error fetching user:", error);
        reply.status(500).send({ message: "Internal server error" });
    }
}

export async function updateuserHandler(request: FastifyRequest,reply: FastifyReply) {
    const userId = getUserId(request, reply);
    if(!userId){
        return;
    }
    try {
        const {email,displayname} = request.body as {email?:string,displayname?:string};
        if(!email&&!displayname){
            reply.status(400).send({message:"details not provided!"});
            return;
        }
        const userDoc = await db.collection('users').doc(userId).get();
        if(!userDoc.exists){
            reply.status(404).send({message:"user not found"});
            return;
        }
        const updatedUser: any = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        if(email) updatedUser.email = email;
        if(displayname) updatedUser.displayname = displayname;
        await db.collection('users').doc(userId).update(updatedUser);
        reply.status(200).send({message:"user updated successfully"});
    } catch (error) {
        console.error("Error updating user:", error);
        reply.status(500).send({ message: "Internal server error" });
    }
}

export async function deleteuserHandler(request: FastifyRequest,reply: FastifyReply) {
    const userId = getUserId(request, reply);
    if(!userId){
        return;
    }
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if(!userDoc.exists){
            reply.status(404).send({message:"user not found"});
            return;
        }
        await db.collection('users').doc(userId).delete();
        reply.status(200).send({message:"user deleted successfully"});
    }
    catch (error) {
        console.error("Error deleting user:", error);
        reply.status(500).send({ message: "Internal server error" });
    }
}