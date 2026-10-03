import { Body, Controller, Get, Middlewares, Path, Post, Put, Request, Route, Security, Tags } from "tsoa";
import AppError from "../utils/error";
import { IResponse } from "../utils/interfaces/common";
import { TeamService } from "../services/TeamService";
import { teamMultipart, TeamSaveRequest } from "../team/media";
import { AdminTeamDepartment, AdminTeamPage, AdminTeamPerson, AdminTeamSnapshot, TeamDepartmentInput, TeamOrderInput, TeamPageInput, TeamSection } from "../team/types";

@Tags("Admin Team")
@Route("/api/admin/team")
@Security("jwt", ["ADMIN"])
export class AdminTeamController extends Controller {
  private response<T>(data: T, message: string, statusCode = 200): IResponse<T> {
    this.setStatus(statusCode);
    this.setHeader("Cache-Control", "no-store");
    return { statusCode, message, data };
  }

  @Get("/")
  public async getDirectory(): Promise<IResponse<AdminTeamSnapshot>> {
    return this.response(await TeamService.getAdminSnapshot(), "Team directory fetched");
  }
  @Get("/people/{id}")
  public async getPerson(@Path() id: string): Promise<IResponse<AdminTeamPerson>> {
    return this.response(await TeamService.getAdminPerson(id), "Team person fetched");
  }
  /** Multipart fields: payload (JSON TeamPersonInput) and optional photo (JPEG/PNG/WebP, at most 5 MB). */
  @Post("/people")
  @Middlewares(teamMultipart)
  public async createPerson(@Request() req: TeamSaveRequest): Promise<IResponse<AdminTeamPerson>> {
    if (!req.teamInput) throw new AppError("Team multipart validation did not run", 500);
    return this.response(await TeamService.savePerson(req.teamInput, req.file), "Team person created", 201);
  }
  /** Same multipart contract as create. Payload version is required; slug remains immutable. */
  @Put("/people/{id}")
  @Middlewares(teamMultipart)
  public async updatePerson(@Path() id: string, @Request() req: TeamSaveRequest): Promise<IResponse<AdminTeamPerson>> {
    if (!req.teamInput) throw new AppError("Team multipart validation did not run", 500);
    return this.response(await TeamService.savePerson(req.teamInput, req.file, id), "Team person saved");
  }
  @Post("/departments")
  public async createDepartment(@Body() input: TeamDepartmentInput): Promise<IResponse<AdminTeamDepartment>> {
    return this.response(await TeamService.saveDepartment(input), "Department created", 201);
  }
  // The literal route precedes the parameter route deliberately.
  @Put("/departments/order")
  public async reorderDepartments(@Body() input: TeamOrderInput): Promise<IResponse<AdminTeamSnapshot>> {
    return this.response(await TeamService.reorderDepartments(input), "Departments reordered");
  }
  @Put("/departments/{id}")
  public async updateDepartment(@Path() id: string, @Body() input: TeamDepartmentInput): Promise<IResponse<AdminTeamDepartment>> {
    return this.response(await TeamService.saveDepartment(input, id), "Department saved");
  }
  @Put("/sections/{section}/order")
  public async reorderSection(@Path() section: string, @Body() input: TeamOrderInput): Promise<IResponse<AdminTeamSnapshot>> {
    return this.response(await TeamService.reorderSection(section as TeamSection, input), "Section reordered");
  }
  @Put("/page")
  public async updatePage(@Body() input: TeamPageInput): Promise<IResponse<AdminTeamPage>> {
    return this.response(await TeamService.savePage(input), "Team page wording saved");
  }
}
