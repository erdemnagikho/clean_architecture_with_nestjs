import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from "@nestjs/swagger";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { PlaceOrderDto } from "./dtos/place-order.dto";
import { PlaceOrderCommand } from "../application/use-cases/place-order/place-order.command";
import { OrderResponseDto } from "./dtos/order-response.dto";
import { ListOrdersQuery } from "../application/queries/list-order.query";
import { Order } from "../domain/entities/order.entity";
import { GetOrderQuery } from "../application/queries/get-order.query";
import { ConfirmOrderCommand } from "../application/use-cases/confirm-order/confirm-order.command";
import { ShipOrderDto } from "./dtos/ship-order.dto";
import { ShipOrderCommand } from "../application/use-cases/ship-order/ship-order.command";
import { DeliverOrderCommand } from "../application/use-cases/deliver-order/deliver-order.command";
import { CancelOrderCommand } from "../application/use-cases/cancel-order/cancel-order.command";

@ApiTags('orders')
@Controller("orders")
export class OrderController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus
    ) { }

    @Post()
    @ApiOperation({ summary: 'Place a new order' })
    @ApiResponse({ status: 201, description: 'Order placed successfully' })
    @ApiResponse({ status: 400, description: 'Validation or domain error (e.g. empty items)' })
    @ApiResponse({ status: 404, description: 'Customer or product not found' })
    async place(@Body() dto: PlaceOrderDto): Promise<void> {
        await this.commandBus.execute<PlaceOrderCommand, void>(
            new PlaceOrderCommand(
                dto.customerId,
                dto.items.map((item) => ({
                    productId: item.productId,
                    productName: item.productName,
                    unitPrice: item.unitPrice,
                    currency: item.currency ?? 'USD',
                    quantity: item.quantity,
                    discount: item.discount,
                })),
                dto.shippingStreet,
                dto.shippingCity,
                dto.shippingState,
                dto.shippingZipCode,
                dto.shippingCountry,
            ),
        );
    }

    @Get()
    @ApiOperation({ summary: 'List orders with optional customer filter' })
    @ApiQuery({ name: 'customerId', required: false, type: String, description: 'Filter orders by customer UUID' })
    @ApiResponse({ status: 200, description: 'List of orders', type: [OrderResponseDto] })
    async findAll(
        @Query('customerId') customerId?: string,
    ): Promise<OrderResponseDto[]> {
        const orders = await this.queryBus.execute<ListOrdersQuery, Order[]>(
            new ListOrdersQuery(customerId)
        );

        return orders.map(OrderResponseDto.fromDomain);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get order details by ID' })
    @ApiParam({ name: 'id', description: 'Order UUID' })
    @ApiResponse({ status: 200, description: 'Order details', type: OrderResponseDto })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async findOne(
        @Param('id', new ParseUUIDPipe()) id: string,
    ): Promise<OrderResponseDto> {
        const order = await this.queryBus.execute<GetOrderQuery, Order>(
            new GetOrderQuery(id)
        );

        return OrderResponseDto.fromDomain(order);
    }

    @Patch(':id/confirm')
    @ApiOperation({ summary: 'Manually confirm an order' })
    @ApiParam({ name: 'id', description: 'Order UUID' })
    @ApiResponse({ status: 200, description: 'Order confirmed successfully' })
    @ApiResponse({ status: 400, description: 'Invalid state transition' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async confirm(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
        await this.commandBus.execute<ConfirmOrderCommand>(
            new ConfirmOrderCommand(id),
        );
    }

    @Patch(':id/ship')
    @ApiOperation({ summary: 'Ship an order with tracking number' })
    @ApiParam({ name: 'id', description: 'Order UUID' })
    @ApiResponse({ status: 200, description: 'Order shipped successfully' })
    @ApiResponse({ status: 400, description: 'Invalid state transition or missing tracking number' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async ship(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: ShipOrderDto,
    ): Promise<void> {
        await this.commandBus.execute<ShipOrderCommand, void>(
            new ShipOrderCommand(
                id,
                dto.trackingNumber,
            ),
        );
    }

    @Patch(':id/deliver')
    @ApiOperation({ summary: 'Mark an order as delivered' })
    @ApiParam({ name: 'id', description: 'Order UUID' })
    @ApiResponse({ status: 200, description: 'Order delivered successfully' })
    @ApiResponse({ status: 400, description: 'Invalid state transition' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async deliver(
        @Param('id', new ParseUUIDPipe()) id: string
    ): Promise<void> {
        await this.commandBus.execute<DeliverOrderCommand, void>(
            new DeliverOrderCommand(id),
        );
    }

    @Patch(':id/cancel')
    @ApiOperation({ summary: 'Cancel an order' })
    @ApiParam({ name: 'id', description: 'Order UUID' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                reason: { type: 'string', example: 'Customer requested cancellation' }
            },
            required: ['reason']
        }
    })
    @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
    @ApiResponse({ status: 400, description: 'Invalid state transition or empty reason' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async cancel(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body('reason') reason: string,
    ): Promise<void> {
        await this.commandBus.execute<CancelOrderCommand, void>(
            new CancelOrderCommand(id, reason),
        );
    }
}