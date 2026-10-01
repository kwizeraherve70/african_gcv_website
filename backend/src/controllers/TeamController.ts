import { Controller, Get, Path, Query, Route, Tags } from "tsoa";
import { TeamService } from "../services/TeamService";
import { IResponse } from "../utils/interfaces/common";
import { PublicTeamPerson, PublicTeamSnapshot } from "../team/types";

@Tags("Team")
@Route("/api/team")
export class TeamController extends Controller {
  @Get("/")
  public async getTeam(@Query() locale?: string): Promise<IResponse<PublicTeamSnapshot>> {
    this.setHeader("Cache-Control", "no-store");
    return { statusCode: 200, message: "Team directory fetched", data: await TeamService.getPublicSnapshot(locale) };
  }

  @Get("/people/slug/{slug}")
  public async getPerson(@Path() slug: string, @Query() locale?: string): Promise<IResponse<PublicTeamPerson>> {
    this.setHeader("Cache-Control", "no-store");
    return { statusCode: 200, message: "Team person fetched", data: await TeamService.getPublicPerson(slug, locale) };
  }
}
