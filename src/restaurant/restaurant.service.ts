import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';


@Injectable()
export class RestaurantService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('RestaurantService');
  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  constructor() {
    super();
  }

  async create(createRestaurantDto: CreateRestaurantDto) {
    const restaurant = await this.restaurant.findFirst({
      where: {
        address: createRestaurantDto.address
      }
    })
    if (!restaurant) {
      return await this.restaurant.create({ data: createRestaurantDto });
    }
    throw new BadRequestException('Restaurant already exists');
  }

  async findAll(paginationDto: PaginationDto) {

    // const restaurantIds = await this.restaurant.findMany({
    //   where: {
    //     available: true
    //   },
    //   select: {
    //     id: true
    //   }
    // })
    // const restaurantIdsArray = restaurantIds.map(item => item.id)

    // const clientsId = await this.client.findMany({
    //   where: {
    //     available: true,
    //     restaurantId: {
    //       in: restaurantIdsArray
    //     }
    //   }
    // })
    // console.log(restaurantIdsArray, clientsId)


    const { page, limit } = paginationDto;

    const totalPages = await this.restaurant.count({
      where: {
        available: true
      }
    });
    const lastPage = Math.ceil(totalPages / limit);

    const restaurant = {
      data: await this.restaurant.findMany({
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

    const { data, meta } = restaurant;
    const restaurantDetails = data.map(({ id, name, capacity, address }) => ({ id, name, capacity, address }));

    return { restaurantDetails, meta };
  }

  async findOne(id: string) {

    const restaurant = await this.restaurant.findUnique({
      where: {
        id,
        available: true
      },
    });
    const clients = await this.client.findMany({
      where: {
        available: true,
        restaurantId: id
      }
    })
    const clientsRestaurant = clients.map(({ id, name, email, phone }) => ({ id, name, email, phone }));

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with id #${id} not found`);
    }
    return { restaurant, clientsRestaurant };
  }

  async updateRestaurant(id: string, updateRestaurantDto: UpdateRestaurantDto) {
    await this.findOne(id);

    return this.restaurant.update({
      where: { id },
      data: updateRestaurantDto
    })
  }

  async remove(id: string) {

    await this.findOne(id);

    const deleteRestaurant = await this.restaurant.update({
      where: { id },
      data: {
        available: false
      }
    });
    await this.client.updateMany({
      where: {
        restaurantId: id
      },
      data: {
        available: false,
      }
    })
    return deleteRestaurant;
  }
}
