import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  HttpCode,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { CreateUserDto, LoginDto } from "../common/dtos";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 registrations per hour
  async register(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post("login")
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 attempts in 5 minutes
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post("login-picker")
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 5 attempts in 5 minutes
  async loginPicker(
    @Body("cedula") cedula: string,
    @Body("temporaryCode") temporaryCode: string
  ) {
    return this.authService.loginPicker(cedula, temporaryCode);
  }
}
