import { Router, type IRouter } from "express";
import { eq, and, desc, ilike, or } from "drizzle-orm";
import { db, bookingsTable, experiencesTable, usersTable } from "@workspace/db";
import {
  ListBookingsQueryParams,
  GetBookingParams,
  CreateBookingBody,
  UpdateBookingBody,
  UpdateBookingParams,
} from "@workspace/api-zod";
import { createNotification, notifyAdmins } from "../lib/notificationHelper";
import { sendEmail, emailTemplates } from "../lib/emailService";

const router: IRouter = Router();

async function buildBooking(booking: typeof bookingsTable.$inferSelect) {
  const [exp] = await db.select().from(experiencesTable).where(eq(experiencesTable.id, booking.experienceId));
  const [user] = await db.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email, phone: usersTable.phone, avatar: usersTable.avatar }).from(usersTable).where(eq(usersTable.id, booking.userId));
  return {
    ...booking,
    totalAmount: Number(booking.totalAmount),
    specialRequests: booking.specialRequests ?? null,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: undefined,
    user: user ? { id: user.id, name: user.name, email: user.email, phone: user.phone ?? null, avatar: user.avatar ?? null } : null,
    experience: exp ? {
      id: exp.id, title: exp.title, slug: exp.slug, description: exp.description,
      type: exp.type, images: exp.images, videoUrl: exp.videoUrl ?? null,
      price: Number(exp.price), duration: exp.duration, capacity: exp.capacity,
      difficultyLevel: exp.difficultyLevel ?? null, includedItems: exp.includedItems,
      meetingPoint: exp.meetingPoint ?? null, cancellationPolicy: exp.cancellationPolicy ?? null,
      active: exp.active, averageRating: null, reviewCount: 0, createdAt: exp.createdAt.toISOString(),
    } : undefined,
  };
}

router.get("/bookings", async (req, res): Promise<void> => {
  const params = ListBookingsQueryParams.safeParse(req.query);
  const conditions: any[] = [];
  if (params.success) {
    if (params.data.userId) conditions.push(eq(bookingsTable.userId, Number(params.data.userId)));
    if (params.data.status) conditions.push(eq(bookingsTable.status, params.data.status));
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const bookings = await db.select().from(bookingsTable).where(where).orderBy(desc(bookingsTable.createdAt));
  const rich = await Promise.all(bookings.map(buildBooking));

  const search = req.query.search as string | undefined;
  const filtered = search
    ? rich.filter(b =>
        b.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        b.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        b.experience?.title?.toLowerCase().includes(search.toLowerCase()) ||
        String(b.id).includes(search)
      )
    : rich;

  res.json(filtered);
});

router.post("/bookings", async (req, res): Promise<void> => {
  const parsed = CreateBookingBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const userId = (req.session as any).userId ?? 1;
  const [exp] = await db.select().from(experiencesTable).where(eq(experiencesTable.id, parsed.data.experienceId));
  if (!exp) { res.status(404).json({ error: "Experience not found" }); return; }
  const totalAmount = Number(exp.price) * parsed.data.participants;
  const [booking] = await db.insert(bookingsTable).values({
    userId,
    experienceId: parsed.data.experienceId,
    date: parsed.data.date,
    participants: parsed.data.participants,
    totalAmount,
    status: "pending",
    paymentStatus: "pending",
    specialRequests: parsed.data.specialRequests ?? null,
  }).returning();

  await createNotification({
    userId,
    type: "booking",
    title: "Booking Submitted!",
    message: `Your booking for "${exp.title}" on ${parsed.data.date} has been submitted and is pending confirmation.`,
    link: `/customer/bookings`,
  });

  await notifyAdmins({
    type: "booking",
    title: "New Booking",
    message: `A new booking was made for "${exp.title}" on ${parsed.data.date} (${parsed.data.participants} participant${parsed.data.participants !== 1 ? "s" : ""})`,
    link: `/admin/bookings`,
  });

  // Send booking confirmation email asynchronously
  const [customer] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (customer?.email) {
    sendEmail({
      to: customer.email,
      toName: customer.name,
      subject: `Booking Confirmed: ${exp.title}`,
      html: emailTemplates.bookingConfirmation({
        customerName: customer.name,
        experienceTitle: exp.title,
        date: parsed.data.date,
        participants: parsed.data.participants,
        totalAmount,
        bookingId: booking.id,
      }),
      template: "booking_confirmation",
      userId,
      metadata: { bookingId: booking.id, experienceId: exp.id },
    }).catch(err => console.error("[bookings] email error:", err));
  }

  res.status(201).json(await buildBooking(booking));
});

router.get("/bookings/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, id));
  if (!booking) { res.status(404).json({ error: "Booking not found" }); return; }
  res.json(await buildBooking(booking));
});

router.patch("/bookings/:id", async (req, res): Promise<void> => {
  const params = UpdateBookingParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateBookingBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [prevBooking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, params.data.id));
  const [booking] = await db.update(bookingsTable).set(parsed.data as any).where(eq(bookingsTable.id, params.data.id)).returning();
  if (!booking) { res.status(404).json({ error: "Booking not found" }); return; }

  if (parsed.data.status && prevBooking && parsed.data.status !== prevBooking.status) {
    const statusMessages: Record<string, string> = {
      approved: "Your booking has been approved and is awaiting final confirmation.",
      confirmed: "Your booking has been confirmed! We look forward to seeing you.",
      cancelled: "Your booking has been cancelled.",
      completed: "Your experience is complete. We hope you loved it!",
      pending: "Your booking is pending review.",
    };
    await createNotification({
      userId: booking.userId,
      type: "booking",
      title: `Booking ${parsed.data.status.charAt(0).toUpperCase() + parsed.data.status.slice(1)}`,
      message: statusMessages[parsed.data.status] ?? `Your booking status changed to ${parsed.data.status}`,
      link: `/customer/bookings`,
    });

    // Send status email
    const [customer] = await db.select().from(usersTable).where(eq(usersTable.id, booking.userId));
    const [exp] = await db.select().from(experiencesTable).where(eq(experiencesTable.id, booking.experienceId));
    if (customer?.email && exp) {
      if (parsed.data.status === "approved" || parsed.data.status === "confirmed") {
        sendEmail({
          to: customer.email,
          toName: customer.name,
          subject: `Booking Approved: ${exp.title}`,
          html: emailTemplates.bookingApproved({
            customerName: customer.name,
            experienceTitle: exp.title,
            date: booking.date,
            participants: booking.participants,
            bookingId: booking.id,
          }),
          template: "booking_approved",
          userId: booking.userId,
        }).catch(err => console.error("[bookings] email error:", err));
      } else if (parsed.data.status === "cancelled") {
        sendEmail({
          to: customer.email,
          toName: customer.name,
          subject: `Booking Cancelled: ${exp.title}`,
          html: emailTemplates.bookingCancelled({
            customerName: customer.name,
            experienceTitle: exp.title,
            date: booking.date,
            bookingId: booking.id,
          }),
          template: "booking_cancelled",
          userId: booking.userId,
        }).catch(err => console.error("[bookings] email error:", err));
      }
    }
  }

  res.json(await buildBooking(booking));
});

export default router;
