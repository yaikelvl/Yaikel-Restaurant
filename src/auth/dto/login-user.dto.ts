import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MinLength } from "class-validator";

export class LoginUserDto {
   
   
    @IsNotEmpty()
    @IsEmail()
    @IsString()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @IsStrongPassword()
    password: string;
}
