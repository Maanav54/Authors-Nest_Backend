import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../../firebase/server";
import admin from 'firebase-admin'
import { getUserId } from "../../utils/auth";
import { assert } from "console";
import { get } from "http";