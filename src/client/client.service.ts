import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaClient, Roles } from '@prisma/client';
import { PaginationDto } from 'src/common';
import { Auth } from 'src/auth/decorators';

@Injectable()
export class ClientService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ClientService');
  
  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }
  async create(createClientDto: CreateClientDto) {
    const { capacity } = await this.getRestaurantTerms(createClientDto.restaurantId);

    const client = await this.client.findUnique({
      where: { email: createClientDto.email },
    });

    if (client) {
      throw new BadRequestException(`The client with email ${createClientDto.email} already exists`);
    }

    const count = await this.client.count({
      where: {
        restaurantId: createClientDto.restaurantId
      }
    })
    
    if (count < capacity) {
      return this.client.create({ data: createClientDto });
    }
    else {
      throw new BadRequestException(`The restaurant is full`);
    }
  }

  async findAll(paginationDto: PaginationDto) {

    const { page, limit } = paginationDto;

    const totalPages = await this.client.count({
      where: {
        available: true
      }
    });
    const lastPage = Math.ceil(totalPages / limit);

    const client = {
      data: await this.client.findMany({
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
    const { data, meta } = client;
    const clientsDetails = data.map(({ id, name, email, phone, age, restaurantId }) => ({ id, name, email, phone, age, restaurantId }));

    return { clientsDetails, meta };

  }

  async findOne(id: string) {
    const client = await this.client.findFirst({
      where: { id, available: true }
    });

    if (!client) {
      throw new NotFoundException(`Client with id #${id} not found`);
    }
    return client;
  }

  async updateClient(id: string, updateClientDto: UpdateClientDto) {

    await this.findOne(id);

    return this.client.update({
      where: { id },
      data: updateClientDto
    })
  }

  async remove(id: string) {

    await this.findOne(id);

    const deleteCLient = await this.client.update({
      where: { id },
      data: {
        available: false
      }
    });
    return deleteCLient;
  }

  async getRestaurantTerms(restaurantId: string): Promise<{ capacity: number }> {
    const restaurant = await this.restaurant.findUnique({
      where: {
        id: restaurantId,
      },
      select: {
        capacity: true,
      },
    });

    if (!restaurant) {
      throw new BadRequestException('Restaurant not found');
    }

    return restaurant;
  }
}
