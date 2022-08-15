import { Body, Controller, Get, Param, Sse } from "@nestjs/common";
import { filter, map, Observable } from "rxjs";
import { UserDocument } from "../entities/user.schema";
import { SseService } from "../sse.service";
import { ExtractAuthenticatedUser } from "../util";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService,
    private readonly sseService: SseService) { }

  @Get(":id")
  async getUser(@ExtractAuthenticatedUser() user: UserDocument, @Param("id") id: string) {
    const retrievedUser = await this.userService.getUser(id);
    return {
      name: retrievedUser.name
    }
  }

  @Get()
  async getUsers(@ExtractAuthenticatedUser() user: UserDocument, @Body() { users }: { users: string[] }) {
    const retrievedUsers = await this.userService.getUsers(users);
    return retrievedUsers.map(retrievedUser => ({
      name: retrievedUser.name
    }));
  }

  @Get('data')
  getUserData(@ExtractAuthenticatedUser() user: UserDocument) {
    return this.userService.getUserData(user);
  }

  @Sse('sse')
  sse(@ExtractAuthenticatedUser() user: UserDocument): Observable<any> {
    return this.sseService.sse.pipe(filter(({data}) => data.userId === user._id.toString()), map(({data}) => data.payload));
  }

}
