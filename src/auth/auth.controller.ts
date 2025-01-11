import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { LoginUserDto, RegisterUserDto } from './dto';
import { Roles, User } from '@prisma/client';
import { Auth, GetUser, RawHeaders } from './decorators';
import { UserRoleGuard } from './guards/user-role/user-role.guard';





@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('verify')
  VerifyToken() {
    return this.authService.VerifyToken();
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    // @Req() request: Express.Request
    @GetUser() user: User,
    @GetUser('email') userEmail: string,

    @RawHeaders() rawHeaders: string[],
    // @Headers() headers: IncomingHttpHeaders, //Otra forma de obtener el header
  ) {

    return {
      ok: true,
      message: 'Hola mundo private route',
      user,
      userEmail,
      rawHeaders,
    }
  }

  //@SetMetadata('roles', ['ADMIN', 'SELLER', 'BUYER'])

  @Get('private2')
  @Auth(Roles.ADMIN, Roles.SELLER)
  PrivateRoute2(
    // @Req() request: Express.Request
    @GetUser() user: User,
  ) {

    return {
      ok: true,
      user,
    }
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: any) {
    // Redirige a la página de inicio de sesión de Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any): Promise<any> {
    console.log(req.user);
    const user = await this.authService.findOrCreateUser(req.user)
    return user;
  }

}
