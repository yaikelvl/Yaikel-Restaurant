import { OrderStatus } from "@prisma/client";
import { IsEnum, IsString, IsUUID } from "class-validator";

export class CreateOrderDto {

    @IsString()
    description: string;

    @IsEnum(OrderStatus, {
        message: `Possible status values are ${Object.values(OrderStatus)}`
    })
    ordeStatus: OrderStatus = OrderStatus.PENDING

    @IsString()
    @IsUUID()
    restaurantId: string

    @IsString()
    @IsUUID()
    clientId: string

}
