import { IsNumber, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
export class CreateRestaurantDto {

    @ApiProperty({
        example: 'Restaurant 1',
        description: 'Restaurant name',
        nullable: false,
        minLength: 1
    })
    @IsString()
    name: string;

    @ApiProperty({
        example: 'Ave 13 # 3351',
        description: 'Restaurant address',
        nullable: false,
        minLength: 1
    })
    @IsString()
    address: string;

    @ApiProperty({
        example: 50,
        description: 'Restaurant capacity',
        nullable: false,
        minLength: 1,
        default: 0
    })
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    capacity: number;

}
