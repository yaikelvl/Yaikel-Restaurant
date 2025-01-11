import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEmail, IsLowercase, IsNumber, IsPositive, IsString, IsUUID, Min, MinLength } from "class-validator";


export class CreateClientDto {
    @ApiProperty({
        example: 'Pedro Lopez',
        description: 'Client name',
        nullable: false,
        minLength: 1,
    })
    @IsString()
    name: string;


    @ApiProperty({
        example: 'pedrolopez@email.com',
        description: 'Client email',
        nullable: false,
        minLength: 1,
        uniqueItems: true
    })
    @IsString()
    @IsEmail()
    @IsLowercase()
    email: string;


    @ApiProperty({
        example: '+5354381008',
        description: 'Client phone',
        nullable: false,
        minLength: 11
    })
    @IsString()
    @MinLength(11)
    phone: string;

    @ApiProperty({
        example: 25,
        description: 'Client age',
        nullable: false,
        minimum: 18
    })
    @IsNumber()
    @IsPositive()
    @Min(18, { message: 'You must be at least 18 years old' })
    @Type(() => Number)
    age: number;

    @ApiProperty({
        example: 'd8e8e8e8-e8e8-e8e8-e8e8-e8e8e8e8e8e8',
        description: 'Restaurant id',
        nullable: false,
        minLength: 36
    })
    @IsString()
    @IsUUID()
    restaurantId: string;
}
