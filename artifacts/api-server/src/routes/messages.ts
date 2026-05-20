import { Router, type IRouter } from "express";
import { eq, or, and, desc } from "drizzle-orm";
import { db, conversationsTable, messagesTable, usersTable } from "@workspace/db";
import {
  ListMessagesQueryParams,
  CreateConversationBody,
  SendMessageBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/conversations", async (req, res): Promise<void> => {
  const userId = (req.session as any).userId ?? 1;
  const convs = await db.select().from(conversationsTable).where(
    or(eq(conversationsTable.participant1Id, userId), eq(conversationsTable.participant2Id, userId))
  ).orderBy(desc(conversationsTable.updatedAt));
  const rich = await Promise.all(convs.map(async (conv) => {
    const [p1] = await db.select().from(usersTable).where(eq(usersTable.id, conv.participant1Id));
    const [p2] = await db.select().from(usersTable).where(eq(usersTable.id, conv.participant2Id));
    const unread = await db.select().from(messagesTable).where(
      and(eq(messagesTable.conversationId, conv.id), eq(messagesTable.isRead, false))
    );
    const safe = (u: typeof usersTable.$inferSelect | undefined) => u ? {
      id: u.id, email: u.email, name: u.name, role: u.role, avatar: u.avatar ?? null,
      phone: u.phone ?? null, address: u.address ?? null, language: u.language, isActive: u.isActive,
      createdAt: u.createdAt.toISOString(),
    } : null;
    return {
      id: conv.id, participants: [safe(p1), safe(p2)].filter(Boolean),
      lastMessage: conv.lastMessage ?? null, unreadCount: unread.length,
      updatedAt: conv.updatedAt.toISOString(),
    };
  }));
  res.json(rich);
});

router.post("/conversations", async (req, res): Promise<void> => {
  const userId = (req.session as any).userId ?? 1;
  const parsed = CreateConversationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const existing = await db.select().from(conversationsTable).where(
    or(
      and(eq(conversationsTable.participant1Id, userId), eq(conversationsTable.participant2Id, parsed.data.participantId)),
      and(eq(conversationsTable.participant1Id, parsed.data.participantId), eq(conversationsTable.participant2Id, userId))
    )
  );
  if (existing.length > 0) {
    const conv = existing[0];
    const [p1] = await db.select().from(usersTable).where(eq(usersTable.id, conv.participant1Id));
    const [p2] = await db.select().from(usersTable).where(eq(usersTable.id, conv.participant2Id));
    const safe = (u: any) => u ? { id: u.id, email: u.email, name: u.name, role: u.role, avatar: u.avatar ?? null, phone: null, address: null, language: u.language, isActive: u.isActive, createdAt: u.createdAt.toISOString() } : null;
    res.status(201).json({ id: conv.id, participants: [safe(p1), safe(p2)].filter(Boolean), lastMessage: conv.lastMessage ?? null, unreadCount: 0, updatedAt: conv.updatedAt.toISOString() });
    return;
  }
  const [conv] = await db.insert(conversationsTable).values({
    participant1Id: userId,
    participant2Id: parsed.data.participantId,
  }).returning();
  res.status(201).json({ id: conv.id, participants: [], lastMessage: null, unreadCount: 0, updatedAt: conv.updatedAt.toISOString() });
});

router.get("/messages", async (req, res): Promise<void> => {
  const params = ListMessagesQueryParams.safeParse(req.query);
  if (!params.success || !params.data.conversationId) { res.status(400).json({ error: "conversationId required" }); return; }
  const page = params.data.page ? Number(params.data.page) : 1;
  const limit = params.data.limit ? Number(params.data.limit) : 50;
  const messages = await db.select().from(messagesTable)
    .where(eq(messagesTable.conversationId, Number(params.data.conversationId)))
    .orderBy(desc(messagesTable.createdAt)).limit(limit).offset((page - 1) * limit);
  res.json(messages.map(m => ({ ...m, fileUrl: m.fileUrl ?? null, createdAt: m.createdAt.toISOString() })));
});

router.post("/messages", async (req, res): Promise<void> => {
  const userId = (req.session as any).userId ?? 1;
  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [message] = await db.insert(messagesTable).values({
    conversationId: parsed.data.conversationId,
    senderId: userId,
    content: parsed.data.content,
    fileUrl: parsed.data.fileUrl ?? null,
    isRead: false,
  }).returning();
  await db.update(conversationsTable).set({ lastMessage: parsed.data.content }).where(eq(conversationsTable.id, parsed.data.conversationId));
  res.status(201).json({ ...message, fileUrl: message.fileUrl ?? null, createdAt: message.createdAt.toISOString() });
});

export default router;
