import { Roles } from "@prisma/client";
import { IsArray, IsEmail, IsLowercase, IsNotEmpty, IsOptional, IsString, IsStrongPassword, MinLength } from "class-validator";

export class RegisterUserDto {

    @IsString()
    name: string;

    @IsNotEmpty()
    @IsEmail()
    @IsString()
    @IsLowercase()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @IsStrongPassword()
    password: string;

    @IsArray()
    @IsOptional()
    role?: Roles[] // admin or user
    }