import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../firebase/server";
import admin from 'firebase-admin'
import { getUserId } from "../../utils/auth";
import { assert } from "console";
import { get } from "http";

export async function createCommitHandler(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUserId(request, reply);
    if (!userId) return;
    const { message,storyID, blobId, parent,authorId, branchId } = request.body as { message: string,storyID:string, blobId: string[],parent:string, authorId: string | null, branchId: string };
    if (!message || !blobId || !branchId) {
        reply.status(400).send({ message: "id, message, blobIds, and branchId are required" });
        return;
    }
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            reply.status(404).send({ message: "user not found" });
            return;
        }
        const newCommit = {
            message,
            blobId,
            parent,
            storyID,
            authorId,
            branchId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        const commitRef = await db.collection('stories').doc(storyID).collection('branches').doc(branchId).collection('commits').add(newCommit);
        reply.status(201).send({ message: "commit created successfully" });
    } catch (error) {
        console.error("Error creating commit:", error);
        reply.status(500).send({ message: "Internal server error" });
    }
}

export async function getCommitsHandler(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUserId(request, reply);
    if (!userId) return;
    try {
        const commitsSnapshot = await db.collection('users').doc(userId).collection('commits').get();
        const commits = commitsSnapshot.docs.map(doc => doc.data());
        reply.status(200).send({ commits });
    } catch (error) {
        console.error("Error fetching commits:", error);
        reply.status(500).send({ message: "Internal server error" });
    }
}

export async function getCommitByIdHandler(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUserId(request, reply);
    if (!userId) return;
    const { id } = request.params as { id: string };
    if (!id) {
        reply.status(400).send({ message: "id is required" });
        return;
    }
    try {
        const commitsSnapshot = await db.collection('users').doc(userId).collection('commits').where('id', '==', id).get();
        if (commitsSnapshot.empty) {
            reply.status(404).send({ message: "commit not found" });
            return;
        }
        assert(commitsSnapshot.size === 1, "Multiple commits with the same id found");
        const commit = commitsSnapshot.docs[0].data();
        reply.status(200).send({ commit });
    } catch (error) {
        console.error("Error fetching commit:", error);
        reply.status(500).send({ message: "Internal server error" });
    }
}

export async function deleteCommitHandler(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUserId(request, reply);
    if (!userId) return;
    const { id } = request.params as { id: string };
    if (!id) {
        reply.status(400).send({ message: "id is required" });
        return;
    }
    try {
        const commitsSnapshot = await db.collection('users').doc(userId).collection('commits').where('id', '==', id).get();
        if (commitsSnapshot.empty) {
            reply.status(404).send({ message: "commit not found" });
            return;
        }
        assert(commitsSnapshot.size === 1, "Multiple commits with the same id found");
        await commitsSnapshot.docs[0].ref.delete();
        reply.status(200).send({ message: "commit deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting commit:", error);
        reply.status(500).send({ message: "Internal server error" });
    }
}
