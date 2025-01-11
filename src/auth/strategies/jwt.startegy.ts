import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";

import { ExtractJwt, Strategy } from "passport-jwt";

import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { PrismaService } from "prisma/prisma.service";
import { User } from "@prisma/client";
import { envs } from "src/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(private readonly prisma: PrismaService) {
        super({
            // jwtFromRequest: (req) => {
            //     // console.log(req);
            //     return req.headers.authorization;
            // },  //Otra forma de obtener el token por el Header
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: envs.jwtSecret
        })

    }

    async validate(payload: JwtPayload): Promise<User> {

        const { id } = payload;

        const user = await this.prisma.user.findUnique(
            {
                where: {
                    id
                }
            }
        )
        if (!user) {
            throw new UnauthorizedException('Token not valid')
        }

        if (!user.available) {
            throw new UnauthorizedException('User is inactive, talk whit an Admin')
        }
        return user;
    }

}