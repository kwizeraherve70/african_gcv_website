import {
  Body,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Route,
  Tags,
  Request,
  Middlewares,
  Security,
} from "tsoa";
import { AgentService } from "../services/AgentService";
import { CreateAgentDto, IResponse, TAgent } from "../utils/interfaces/common";
import { Request as Req } from "express";
import upload from "../utils/cloudinary";
import { appendPhoto } from "../middlewares/company.middlewares";

@Tags("Agent")
@Route("/api/agent")
export class AgentController {
  @Get("/")
  public async getManyagent(): Promise<IResponse<TAgent[]>> {
    return AgentService.getAllAgents();
  }

  @Get("/{id}")
  public async getAgent(@Path() id: string): Promise<IResponse<TAgent | null>> {
    return AgentService.getAgent(id);
  }

  @Post("/")
  @Security("jwt", ["ADMIN"])
  @Middlewares(upload.any(), appendPhoto)
  public async createAgent(
    @Body() agentData: CreateAgentDto,
    @Request() request: Req,
  ): Promise<IResponse<TAgent>> {
    return new AgentService(request).createAgent(agentData);
  }

  @Put("/{id}")
  @Security("jwt", ["ADMIN"])
  @Middlewares(upload.any(), appendPhoto)
  public async updateAgent(
    @Path() id: string,
    @Body() agentData: CreateAgentDto,
  ): Promise<IResponse<TAgent | null>> {
    return AgentService.updateAgent(id, agentData);
  }

  @Delete("/{id}")
  @Security("jwt", ["ADMIN"])
  public async deleteAgent(@Path() id: string): Promise<IResponse<null>> {
    await AgentService.deleteAgent(id);
    return {
      statusCode: 200,
      message: "Agent post deleted successfully",
    };
  }
}
