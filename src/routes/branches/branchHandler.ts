import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../firebase/server";
import admin from 'firebase-admin'
import { getUserId } from "../../utils/auth";
import { assert } from "console";
import { get } from "http";

export async function createBranchHandler(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUserId(request, reply);
    if (!userId) return;
    try {
        const { name, head, storyID} = request.body as { name: string, head: string ,storyID:string};
        if (!name || !head ||!storyID) {
            reply.status(400).send({ message: "name and description are required" });
            return;
        }
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            reply.status(404).send({ message: "user not found" });
            return;
        }
        const newBranch = {
            name,
            head,
            storyID,
            authorId: userId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        const branchRef = await db.collection('stories').doc(storyID).collection('branches').add(newBranch);
        reply.status(201).send({message:"branch created successfully" });
    } catch (error) {
        console.error("Error creating branch:", error);
        reply.status(500).send({ message: "Internal server error" });
    }
}

export async function getBranchHandler(request: FastifyRequest,reply: FastifyReply) {
    const userId = getUserId(request, reply);
    if (!userId) return;
    try {
        const { branchId } = request.params as { branchId: string };
        if(!branchId) {
            reply.status(400).send({ message: "branchId is required" });
            return;
        }
        const branchDoc = await db.collection('branches').doc(branchId).get();
        if(!branchDoc.exists) {
            reply.status(404).send({ message: "branch not found" });
            return;
        }
        const branchData = branchDoc.data();
        reply.status(200).send({ id: branchDoc.id, ...branchData });
    }
    catch (error) {
        console.error("Error fetching branch:", error);
        reply.status(500).send({ message: "Internal server error" });
    }
}

export async function getBranchesHandler(request: FastifyRequest,reply: FastifyReply) {
    const userId = getUserId(request, reply);
    if (!userId) return;
    try {
        const branchesSnapshot = await db.collection('branches').where('authorId', '==', userId).get();
        const branches = branchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        reply.status(200).send(branches);
    }
    catch (error) {
        console.error("Error fetching branches:", error);
        reply.status(500).send({ message: "Internal server error" });
    }
}

export async function updateBranchHandler(request: FastifyRequest,reply: FastifyReply) {
    const userId = getUserId(request, reply);
    if (!userId) return;
    try {
        const { branchId } = request.params as { branchId: string };
        if(!branchId) {
            reply.status(400).send({ message: "branchId is required" });
            return;
        }
        const { name } = request.body as { name?: string };
        if(!name) {
            reply.status(400).send({ message: "name is required" });
            return;
        }
        const branchDoc = await db.collection('branches').doc(branchId).get();
        if(!branchDoc.exists) {
            reply.status(404).send({ message: "branch not found" });
            return;
        }
        const branchData = branchDoc.data();
        if(branchData?.authorId !== userId) {
            reply.status(403).send({ message: "forbidden" });
            return;
        }
        await db.collection('branches').doc(branchId).update({
            name,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        reply.status(200).send({ id: branchId, ...branchData, name });
    }
    catch (error) {
        console.error("Error updating branch:", error);
        reply.status(500).send({ message: "Internal server error" });
    }
}

export async function deleteBranchHandler(request: FastifyRequest,reply: FastifyReply) {
    const userId = getUserId(request, reply);
    if (!userId) return;
    try {
        const { branchId } = request.params as { branchId: string };
        if(!branchId) {
            reply.status(400).send({ message: "branchId is required" });
            return;
        }
        const branchDoc = await db.collection('branches').doc(branchId).get();
        if(!branchDoc.exists) {
            reply.status(404).send({ message: "branch not found" });
            return;
        }
        const branchData = branchDoc.data();
        if(branchData?.authorId !== userId) {
            reply.status(403).send({ message: "forbidden" });
            return;
        }
        await db.collection('branches').doc(branchId).delete();
        reply.status(200).send({ message: "branch deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting branch:", error);
        reply.status(500).send({ message: "Internal server error" });
    }
}
