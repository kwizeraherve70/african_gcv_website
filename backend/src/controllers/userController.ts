/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Body,
  Get,
  Middlewares,
  Post,
  Put,
  Route,
  Security,
  Tags,
  Path,
  Delete,
  Request,
} from "tsoa";
import { UserService } from "../services/userService";
import type {
  ILoginUser,
  IPaged,
  ISignUpUser,
  IUserResponse,
  CreateUserDto,
} from "../utils/interfaces/common";
import { loggerMiddleware } from "../utils/loggers/loggingMiddleware";
import { Request as ExpressRequest, Response } from "express";
import { appendPhoto } from "../middlewares/company.middlewares";
import upload from "../utils/cloudinary";
import {
  createRefreshSession,
  issueAccessToken,
  revokeRefreshSession,
  rotateRefreshSession,
} from "../utils/authSession";

@Tags("Authentication")
@Route("/api/auth")
export class UserController {
  @Get("/users")
  @Security("jwt", ["ADMIN"])
  @Middlewares(loggerMiddleware)
  public getUser(
    @Request() req: ExpressRequest,
  ): Promise<IPaged<IUserResponse[]>> {
    const { searchq, limit, page } = req.query;
    const currentPage = page ? parseInt(page as string) : undefined;
    return UserService.getUsers(
      searchq as string | undefined,
      limit ? parseInt(limit as string) : undefined,
      currentPage,
    );
  }

  //delete user
  @Delete("/delete/{id}")
  @Security("jwt", ["ADMIN"])
  @Middlewares(loggerMiddleware)
  public deleteUser(@Path() id: string) {
    return UserService.deleteUser(id);
  }

  @Post("/request-password-reset")
  public async requestPasswordReset(@Body() body: { email: string }) {
    const { email } = body;
    return UserService.requestPasswordReset(email);
  }

  @Post("/reset-password")
  public async resetPassword(
    @Body() body: { email: string; otp: string; newPassword: string },
  ) {
    const { email, otp, newPassword } = body;
    return UserService.resetPassword(email, otp, newPassword);
  }

  @Post("signin")
  public async loginUser(@Body() user: ILoginUser, @Request() req: ExpressRequest) {
    const result = await UserService.loginUser(user);
    await createRefreshSession(result.data!.id, req.res as Response);
    return result;
  }

  //user signup
  @Post("/signup")
  @Middlewares(upload.any(), appendPhoto)
  public async signup(@Body() user: ISignUpUser, @Request() req: ExpressRequest) {
    const result = await UserService.signUpUser(user);
    if (result.data?.id) await createRefreshSession(result.data.id, req.res as Response);
    return result;
  }

  @Post("/create")
  @Security("jwt", ["ADMIN"])
  @Middlewares(upload.any(), appendPhoto)
  public async createUser(@Body() user: CreateUserDto) {
    return UserService.createUser(user);
  }

  @Put("/update/{id}")
  @Middlewares(upload.any(), appendPhoto)
  @Security("jwt", ["ADMIN"])
  public async updateUser(
    @Path() id: string,
    @Body() user: Partial<CreateUserDto>,
  ) {
    return UserService.updateUser(id, user);
  }

  @Get("/me")
  @Security("jwt")
  @Middlewares(loggerMiddleware)
  public getMe(@Request() req: ExpressRequest) {
    return UserService.getMe(req);
  }

  @Post("/refresh")
  public async refresh(@Request() req: ExpressRequest) {
    const userId = await rotateRefreshSession(req, req.res as Response);
    const user = await UserService.getUserById(userId);
    return {
      statusCode: 200,
      message: "Session refreshed",
      data: { token: await issueAccessToken(user.email), user },
    };
  }

  @Post("/logout")
  public async logout(@Request() req: ExpressRequest) {
    await revokeRefreshSession(req, req.res as Response);
    return { statusCode: 200, message: "Logged out successfully" };
  }
}
