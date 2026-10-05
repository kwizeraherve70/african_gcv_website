import { BaseService } from "./Service";
import { prisma } from "../utils/client";
import { CreateContactDto, IResponse, TContact } from "../utils/interfaces/common";
import AppError from "../utils/error";
import { queueContactNotifications } from "./contactNotifications";

export class ContactService extends BaseService {
  public async createContact(contactData: CreateContactDto): Promise<IResponse<TContact>> {
    // A successful response guarantees both the enquiry and its notification
    // jobs are durable. No network/email work happens inside this transaction.
    const newContact = await prisma.$transaction(async tx => {
      let agentEmail: string | undefined;
      let enquiryPropertyId: string | undefined;
      let name = contactData.name;
      let email = contactData.email;
      if (contactData.agentId) {
        const agent = await tx.agents.findUnique({
          where: { id: contactData.agentId },
          select: { user: { select: { email: true } } },
        });
        if (!agent) throw new AppError("Agent not found", 404);
        agentEmail = agent.user.email;
        const enquiry = await tx.enquiryProperty.upsert({
          where: { agentId: contactData.agentId },
          update: {},
          create: { agentId: contactData.agentId },
        });
        enquiryPropertyId = enquiry.id;
      } else if (contactData.userId) {
        const user = await tx.user.findUnique({ where: { id: contactData.userId } });
        if (!user) throw new AppError("User not found", 404);
        name = user.firstName + "" + user.lastName;
        email = user.email;
      }
      const contact = await tx.contact.create({ data: {
        name, email, message: contactData.message, enquiryPropertyId,
        location: contactData.location || undefined,
        phoneNumber: contactData.phoneNumber || undefined,
        photo: typeof contactData.photo === "string" ? contactData.photo : undefined,
      } });
      await queueContactNotifications(tx, contact, agentEmail);
      return contact;
    });
    return { statusCode: 201, message: "Your message has been received", data: newContact };
  }

  public static async getContact(
    contactId: string,
  ): Promise<IResponse<TContact>> {
    try {
      const contact = await prisma.contact.findUnique({
        where: {
          id: contactId,
        },
        include: {
          enquiryProperty: true,
        },
      });

      if (!contact) {
        throw new AppError("contact post not found", 404);
      }
      return {
        statusCode: 200,
        message: "contact post fetched successfully",
        data: contact,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async getAllContact(): Promise<IResponse<TContact[]>> {
    try {
      const contact = await prisma.contact.findMany({
        include: {
          enquiryProperty: true,
        },
      });

      return {
        statusCode: 200,
        message: "contact fetched successfully",
        data: contact,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async updateContact(
    contactId: string,
    contactData: Partial<CreateContactDto>,
  ): Promise<IResponse<TContact>> {
    try {
      const updatedContact = await prisma.contact.update({
        where: { id: contactId },
        data: {
          ...contactData,
          photo:
            typeof contactData.photo === "string"
              ? contactData.photo
              : undefined,
        },
      });
      return {
        statusCode: 200,
        message: "contact post updated successfully",
        data: updatedContact,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }

  public static async deleteContact(
    contactId: string,
  ): Promise<IResponse<null>> {
    try {
      await prisma.contact.delete({ where: { id: contactId } });
      return {
        statusCode: 200,
        message: "contact post deleted successfully",
        data: null,
      };
    } catch (error) {
      throw new AppError(error, 500);
    }
  }
}
