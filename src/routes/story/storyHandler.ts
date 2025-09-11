import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../firebase/server";
import admin from 'firebase-admin'
import { getUserId } from "../../utils/auth";
import { assert } from "console";
import { get } from "http";

export async function createStoryHandler(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUserId(request, reply);
    if (!userId) return;
    try {
        const { title, description,id,ownerid,defaultbranch } = request.body as { title: string, description: string , id:string,ownerid:string,defaultbranch:"main"};
        if (!title || !description|| !id||!ownerid) {
            reply.status(400).send({ message: "details not provided!" });
            return;
        }
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) {
            reply.status(404).send({ message: "user not found" });
            return;
        }
        const newStory = {
            title,
            description,
            id,
            ownerid,
            defaultbranch,
            authorId: userId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        const storyRef = await db.collection('stories').add(newStory);
        reply.status(201).send({ message:"story created successfully" });

    } catch (error) {
        console.error("Error creating story:", error);
        reply.status(500).send({ message: "Internal server error" });
    }
}

export async function getStoryHandler(request: FastifyRequest,reply: FastifyReply) {
    const userId = getUserId(request, reply);
    if (!userId) return;
    try {
        const { storyId } = request.params as { storyId: string };
        if(!storyId) {
            reply.status(400).send({ message: "storyId is required" });
            return;
        }
        const storyDoc = await db.collection('stories').doc(storyId).get();
        if(!storyDoc.exists) {
            reply.status(404).send({ message: "story not found" });
            return;
        }
        const storyData = storyDoc.data();
        reply.status(200).send({ id: storyDoc.id, ...storyData });
    }
    catch (error) {
        console.error("Error fetching story:", error);
        reply.status(500).send({ message: "Internal server error" });
    } 

}

export async function getStoriesHandler(request: FastifyRequest,reply: FastifyReply) {
    const userId = getUserId(request, reply);
    if (!userId) return;

    try {
        const storiesSnapshot = await db.collection('stories').where('authorId', '==', userId).get();
        const stories = storiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        reply.status(200).send(stories);
    }
    catch (error) {
        console.error("Error fetching stories:", error);
        reply.status(500).send({ message: "Internal server error" });
    }
}

export async function updateStoryHandler(request: FastifyRequest,reply: FastifyReply) {
    const userId = getUserId(request, reply);
    if (!userId) return;
    try {
        const { storyId } = request.params as { storyId: string };
        if(!storyId) {
            reply.status(400).send({ message: "storyId is required" });
            return;
        }
        const { title, content } = request.body as { title?: string, content?: string };
        if(!title && !content) {
            reply.status(400).send({ message: "at least one of title or content is required" });
            return;
        }
        const storyRef = db.collection('stories').doc(storyId);
        const storyDoc = await storyRef.get();
        if(!storyDoc.exists) {
            reply.status(404).send({ message: "story not found" });
            return;
        }
        const storyData = storyDoc.data();
        if(storyData?.authorId !== userId) {
            reply.status(403).send({ message: "forbidden" });
            return;
        }
        const updatedData: any = {
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        if(title) updatedData.title = title;
        if(content) updatedData.content = content;
        await storyRef.update(updatedData);
        reply.status(200).send({ id: storyId, ...storyData, ...updatedData });
    }
    catch (error) {
        console.error("Error updating story:", error);
        reply.status(500).send({ message: "Internal server error" });
    }
}

export async function deleteStoryHandler(request: FastifyRequest,reply: FastifyReply) {
    const userId = getUserId(request, reply);
    if (!userId) return;
    try {
        const { storyId } = request.params as { storyId: string };
        if(!storyId) {
            reply.status(400).send({ message: "storyId is required" });
            return;
        }
        const storyRef = db.collection('stories').doc(storyId);
        const storyDoc = await storyRef.get();
        if(!storyDoc.exists) {
            reply.status(404).send({ message: "story not found" });
            return;
        }
        const storyData = storyDoc.data();
        if(storyData?.authorId !== userId) {
            reply.status(403).send({ message: "forbidden" });
            return;
        }
        await storyRef.delete();
        reply.status(200).send({ message: "story deleted" });
    }   
    catch (error) {
        console.error("Error deleting story:", error);
        reply.status(500).send({ message: "Internal server error" });
    }
}