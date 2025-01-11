import { HttpException, HttpStatus, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus, PrismaClient } from '@prisma/client';
import { connect } from 'http2';
import { PaginationDto } from 'src/common';

@Injectable()
export class OrderService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrderService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }
  async create(createOrderDto: CreateOrderDto) {
    const { description, clientId, restaurantId, ordeStatus } = createOrderDto;
    return await this.order.create({
      data: {
        description,
        ordeStatus,
        clientId,
        restaurantId,
        client: {
          connect: { id: clientId }

        },
        restaurant: {
          connect: { id: restaurantId },
        }
      },
      include: { client: true, restaurant: true }
    })

  }

  async findAll(paginationDto: PaginationDto) {

    const { page, limit } = paginationDto;

    const totalPages = await this.order.count({
      where: {
        available: true
      }
    });
    const lastPage = Math.ceil(totalPages / limit);

    const order = {
      data: await this.order.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          available: true
        }
      }),
      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage
      }
    }
    const { data, meta } = order;
    const orderDetails = data.map(({ id, description, ordeStatus }) => ({ id, description, ordeStatus }));

    return { orderDetails, meta };

  }

  async findOne(id: string) {
    const order = await this.order.findUnique({
      where: {
        id,
        available: true
      },
    });

    console.log(order);

    if (!order) {
      throw new NotFoundException(`Order with id #${id} not found`);
    }
    
    const {available, clientId, restaurantId, ...rest } = order;
    const clients = await this.client.findMany({
      where: {
        available: true,
        id: clientId
      }
    })
    const restaurant = await this.restaurant.findMany({
      where: {
        available: true,
        id: restaurantId
      }
    })
    const clientsOrder = clients.map(({ id, name, email, phone }) => ({ id, name, email, phone }));
    const restaurantOrder = restaurant.map(({ id, name, address }) => ({ id, name, address }));
    return { rest, clientsOrder, restaurantOrder };

  }

  async updateOrder(id: string, updateOrderDto: UpdateOrderDto) {
    await this.findOne(id);
    await this.findUserRest(updateOrderDto.clientId, updateOrderDto.restaurantId); //verificar si el cliente y el restaurant existen  
    await this.checkOrderStatus(id, updateOrderDto.ordeStatus);
    return this.order.update({
      where: { id },
      data: updateOrderDto
    })
  }

  async remove(id: string) {

    await this.findOne(id);

    const deleteOrder = await this.order.update({
      where: { id },
      data: {
        available: false
      }
    });
    return deleteOrder;
  }

  async findUserRest(clientId: string, restaurantId: string) {
    const client = await this.client.findFirst({
      where: {
        id: clientId
      }
    })
    const restaurant = await this.restaurant.findFirst({
      where: {
        id: restaurantId
      }
    })
    if (!client || !restaurant) {
      throw new NotFoundException(`Client or restaurant not found`)
    }
  }

  async checkOrderStatus(id: string, orderStatus: OrderStatus) {
    if (orderStatus === OrderStatus.CANCELED) {
      await this.order.update({
        where: { id },
        data: {
          ordeStatus: OrderStatus.CANCELED,
          available: false
        }
      })
      throw new HttpException(`Order with id #${id} canceled`, HttpStatus.OK);
    } else if (orderStatus === OrderStatus.DELIVERING) {
      await this.order.update({
        where: { id },
        data: {
          ordeStatus: OrderStatus.DELIVERING,
          available: false
        }
      })
      throw new HttpException(`Order with id #${id} delivering successful`, HttpStatus.OK);
    }
  }
}
