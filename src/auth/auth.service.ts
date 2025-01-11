import { BadRequestException, Get, Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { LoginUserDto, RegisterUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { ok } from 'assert';


@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('AuthService');
  //private readonly jwtService: JwtService
  constructor(private readonly jwtService: JwtService) {
    super();
  }
  onModuleInit() {

    this.$connect()
    this.logger.log('Database connected');

  }


  async register(registerUserDto: RegisterUserDto) {
    const { email, name, password, role } = registerUserDto;


    const user = await this.user.findUnique({
      where: {
        email
      }
    })

    if (user) {
      throw new BadRequestException(`User with email ${email} already exists`);
    }
    const newUser = await this.user.create({
      data: {
        name: name,
        email: email,
        password: bcrypt.hashSync(password, 10),
        role: role
      }
    })
    const token = this.getJwtToken({ id: newUser.id });
    delete newUser.password;
    return {
      user: newUser,
      token: token,
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.user.findUnique({
      where: { email },
      select: {
        id: true,
        password: true,
        email: true
      }
    })

    if (!user) {
      throw new UnauthorizedException(`${email} not valid credentials `);
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(`${password} not valid credentials `)
    }

    return {
      user,
      token: this.getJwtToken({ id: user.id })
    };

  }

  VerifyToken() {
    return `This action returns all auth`;
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }


  async findOrCreateUser(profile: any) {
    const { email, name,} = profile;

    let user = await this.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.user.create({
        data: {
          email,
          name,
          password: "ABC120"
        },
      });
    }

    return user;
  }
}

