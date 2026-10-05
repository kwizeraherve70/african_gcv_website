import { ContactEmailKind, Prisma } from "@prisma/client";
import { TContact } from "../utils/interfaces/common";
import { appEnv } from "../config/env";

/** Persisted alongside the contact, never sent from the request handler. */
export async function queueContactNotifications(
  tx: Prisma.TransactionClient,
  contact: TContact,
  agentEmail?: string,
): Promise<void> {
  const jobs: Prisma.ContactEmailJobCreateManyInput[] = [];
  if (agentEmail || appEnv.adminEmail) {
    jobs.push({
      contactId: contact.id,
      kind: agentEmail ? ContactEmailKind.AGENT : ContactEmailKind.ADMIN,
      recipient: agentEmail || appEnv.adminEmail!,
      subject: agentEmail ? `New Enquiry: ${contact.name}` : `New Contact Message: ${contact.name}`,
      body: `A new ${agentEmail ? "agent enquiry" : "contact message"} was submitted.\n\nName: ${contact.name}\nEmail: ${contact.email}\nPhone: ${contact.phoneNumber || "N/A"}\nLocation: ${contact.location || "N/A"}\n\nMessage:\n${contact.message}`,
    });
  }
  // Preserve the existing agent flow (agent notification only).
  if (!agentEmail) {
    jobs.push({
      contactId: contact.id,
      kind: ContactEmailKind.SENDER,
      recipient: contact.email,
      subject: "We received your message - Pi Global GCV Alliance",
      body: `Dear ${contact.name},\n\nThank you for reaching out to Pi Global GCV Alliance. We've received your message and a member of our team will get back to you shortly.\n\nYour message:\n${contact.message}\n\nPi Global GCV Alliance Support Team`,
    });
  }
  await tx.contactEmailJob.createMany({ data: jobs });
}
