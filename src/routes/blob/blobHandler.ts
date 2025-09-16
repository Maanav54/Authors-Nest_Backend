import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../firebase/server";
import admin from 'firebase-admin'
import { getUserId } from "../../utils/auth";
import { assert } from "console";
import { get } from "http";
import storyRoutes from '../story/index';
import crypto from "crypto";


export async function createBlobHandler(request: FastifyRequest, reply: FastifyReply) {
  const userId = getUserId(request, reply);
  if (!userId) return;

  try {
    const { content, storyID } = request.body as { content: string; storyID: string };

    if (!content || !storyID) {
      return reply.status(400).send({ message: "content and storyID are required" });
    }

    // hash the content
    const hash = crypto.createHash("sha256").update(content).digest("hex");

    const blobsRef = db.collection("stories").doc(storyID).collection("blobs");

    // check if blob with same hash exists
    const existing = await blobsRef.where("hash", "==", hash).limit(1).get();
    if (!existing.empty) {
      return reply.status(200).send({ message: "blob already exists", id: existing.docs[0].id });
    }

    // create new blob
    const blobDoc = {
      hash,
      content,
      authorId: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const blobRef = await blobsRef.add(blobDoc);

    return reply.status(201).send({
      message: "blob created successfully",
      id: blobRef.id,
      hash,
    });
  } catch (error) {
    console.error("Error creating blob:", error);
    return reply.status(500).send({ message: "Internal server error" });
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
export async function getBlobsHandler(request: FastifyRequest, reply: FastifyReply) {
    const userId = getUserId(request, reply);
    if (!userId) return;
    try {
        const blobsSnapshot = await db.collection('users').doc(userId).collection('blobs').get();
        const blobs = blobsSnapshot.docs.map(doc => doc.data());
        reply.status(200).send({ blobs });
    }
    catch (error) {
        console.error("Error fetching blobs:", error);
        reply.status(500).send({ message: "Internal server error" });
    }
}
