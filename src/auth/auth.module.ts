import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { envs } from 'src/config';
import { JwtStrategy } from './strategies/jwt.startegy';
import { PrismaModule } from 'prisma/prisma.module';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  imports: [
    PassportModule,
    PrismaModule,
    PassportModule.register({
      defaultStrategy: 'jwt'
    }),

    JwtModule.registerAsync({
      imports: [],
      inject: [],
      useFactory: () => {
        // console.log('JWT_SECRET', envs.jwtSecret)
        // console.log('JWT_Secret', process.env.JWT_SECRET)
        return {
          secret: envs.jwtSecret,
          signOptions: { expiresIn: '1d' },
        }
      }
    })

    // JwtModule.register({
    //   secret: process.env.JWT_SECRET,
    //   signOptions: { expiresIn: '1d' },
    // })
  ],
  exports: [JwtStrategy, PassportModule, JwtModule]
})
export class AuthModule { }
