import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Body, Controller, Post, Get, Param, ParseUUIDPipe, Delete } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { RegisterCustomerDto } from "./dto/register-customer.dto";
import { CustomerResponseDto } from "./dto/customer-response.dto";
import { RegisterCustomerCommand } from '../application/use-cases/register-customer/register-customer.command';
import { ListCustomersQuery } from "../application/queries/list-customers.query";
import { GetCustomerQuery } from '../application/queries/get-customer.query';
import { Customer } from "../domain/entities/customer.entity";
import { DeleteCustomerCommand } from "../application/use-cases/delete-customer/delete-customer.command";

@ApiTags('customers')
@Controller('customers')
export class CustomerController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Register a new customer' })
    @ApiResponse({ status: 201, description: 'Customer registered successfully' })
    @ApiResponse({ status: 400, description: 'Validation or domain error' })
    @ApiResponse({ status: 409, description: 'Customer with this email already exists' })
    async register(
        @Body() dto: RegisterCustomerDto,
    ): Promise<void> {
        await this.commandBus.execute<RegisterCustomerCommand, void>(
            new RegisterCustomerCommand(
                dto.email,
                dto.firstName,
                dto.lastName,
                dto.phone,
            ),
        );
    }

    @Get()
    @ApiOperation({ summary: 'List all customers' })
    @ApiResponse({ status: 200, description: 'List of customers', type: [CustomerResponseDto] })
    async list(): Promise<CustomerResponseDto[]> {
        const customers = await this.queryBus.execute<
            ListCustomersQuery,
            Customer[]
        >(new ListCustomersQuery());

        return customers.map(CustomerResponseDto.fromDomain);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get customer by ID' })
    @ApiParam({ name: 'id', description: 'Customer UUID' })
    @ApiResponse({ status: 200, description: 'Customer details', type: CustomerResponseDto })
    @ApiResponse({ status: 404, description: 'Customer not found' })
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<CustomerResponseDto> {
        const customer = await this.queryBus.execute<GetCustomerQuery, Customer>(
            new GetCustomerQuery(id),
        );

        return CustomerResponseDto.fromDomain(customer);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a customer by ID' })
    @ApiParam({ name: 'id', description: 'Customer UUID' })
    @ApiResponse({ status: 200, description: 'Customer deleted successfully' })
    @ApiResponse({ status: 404, description: 'Customer not found' })
    async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        await this.commandBus.execute<DeleteCustomerCommand, void>(
            new DeleteCustomerCommand(id),
        );
    }
}