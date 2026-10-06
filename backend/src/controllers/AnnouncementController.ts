import { Get, Route, Tags } from "tsoa";
import { AnnouncementRecord, AnnouncementService } from "../services/AnnouncementService";
import { IResponse } from "../utils/interfaces/common";

@Tags("Announcements")
@Route("/api/announcements")
export class AnnouncementController {
  @Get("/")
  public async getAnnouncements(): Promise<IResponse<AnnouncementRecord[]>> {
    return { statusCode: 200, message: "Announcements fetched successfully", data: await AnnouncementService.list() };
  }
}
