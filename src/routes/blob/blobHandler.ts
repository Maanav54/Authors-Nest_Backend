import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../firebase/server";
import admin from 'firebase-admin'
import { getUserId } from "../../utils/auth";
import { assert } from "console";
import { get } from "http";

export async function createBlobHandler(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUserId(request, reply);
    if (!userId) return;
    try {
        const { id,hash,content } = request.body as { id:string,hash:string,content: string };
        if (!content || !id || !hash) {
            reply.status(400).send({ message: "url and branchID are required" });
            return;
        }
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            reply.status(404).send({ message: "user not found" });
            return;
        }
        const newBlob = {
            content,
            id,
            hash,
            authorId: userId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        const blobRef = await db.collection('blobs').add(newBlob);
        reply.status(201).send({message:"blob created successfully" });
    }
    catch (error) {
        console.error("Error creating blob:", error);
        reply.status(500).send({ message: "Internal server error" });
    }
}

export async function getBlobHandler(request: FastifyRequest,reply: FastifyReply) {
    const userId = getUserId(request, reply);
    if (!userId) return;
    try {
        const { blobId } = request.params as { blobId: string };    
        if(!blobId) {
            reply.status(400).send({ message: "blobId is required" });
            return;
        }
        const blobDoc = await db.collection('blobs').doc(blobId).get();
        if(!blobDoc.exists) {
            reply.status(404).send({ message: "blob not found" });
            return;
        }
        const blobData = blobDoc.data();
        reply.status(200).send({ id: blobDoc.id, ...blobData });
    }
    catch (error) {
        console.error("Error fetching blob:", error);
        reply.status(500).send({ message: "Internal server error" });
    }
}