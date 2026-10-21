import { OrderItem } from '../../domain/entities/order-item.entity';
import { Order } from '../../domain/entities/order.entity';
import { ApiProperty } from '@nestjs/swagger';

export class OrderItemResponseDto {
    @ApiProperty({ example: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', description: 'Order Item UUID' })
    id: string;

    @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Product UUID' })
    productId: string;

    @ApiProperty({ example: 'Wireless Mechanical Keyboard', description: 'Product name' })
    productName: string;

    @ApiProperty({ example: 129.99, description: 'Unit price' })
    unitPrice: number;

    @ApiProperty({ example: 'USD', description: 'Currency code' })
    currency: string;

    @ApiProperty({ example: 2, description: 'Quantity' })
    quantity: number;

    @ApiProperty({ example: 0, nullable: true, description: 'Discount applied' })
    discount: number | null;

    @ApiProperty({ example: 259.98, description: 'Subtotal for item line' })
    subtotal: number;

    static fromDomain(item: OrderItem): OrderItemResponseDto {
        const dto = new OrderItemResponseDto();
        dto.id = item.getId().getValue();
        dto.productId = item.productId;
        dto.productName = item.productName;
        dto.unitPrice = item.unitPrice.getAmount();
        dto.currency = item.unitPrice.getCurrency();
        dto.quantity = item.quantity;
        dto.discount = item.discount?.getAmount() ?? null;
        dto.subtotal = item.getSubTotal().getAmount();
        return dto;
    }
}

export class OrderResponseDto {
    @ApiProperty({ example: '6fd56de6-e0e6-481e-947c-9029aab4f8ec', description: 'Order UUID' })
    id: string;

    @ApiProperty({ example: 'fbcf91f3-f6a4-4a40-9819-1f581fc4b470', description: 'Customer UUID' })
    customerId: string;

    @ApiProperty({ example: 'PENDING', description: 'Order status (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)' })
    status: string;

    @ApiProperty({ type: [OrderItemResponseDto], description: 'Order items' })
    items: OrderItemResponseDto[];

    @ApiProperty({ example: 259.98, description: 'Total order amount' })
    totalAmount: number;

    @ApiProperty({ example: 'USD', description: 'Total currency code' })
    totalCurrency: string;

    @ApiProperty({ example: 2, description: 'Total quantity of items' })
    itemCount: number;

    @ApiProperty({ example: 'TRK-9876543210', nullable: true, description: 'Tracking number if shipped' })
    trackingNumber: string | null;

    @ApiProperty({ example: null, nullable: true, description: 'Notes' })
    notes: string | null;

    @ApiProperty({ example: '123 Market St', description: 'Shipping street address' })
    shippingStreet: string;

    @ApiProperty({ example: 'San Francisco', description: 'Shipping city' })
    shippingCity: string;

    @ApiProperty({ example: 'CA', description: 'Shipping state' })
    shippingState: string;

    @ApiProperty({ example: '94103', description: 'Shipping zip code' })
    shippingZipCode: string;

    @ApiProperty({ example: 'USA', description: 'Shipping country' })
    shippingCountry: string;

    @ApiProperty({ example: '2026-10-21T14:30:00.000Z', description: 'Creation timestamp' })
    createdAt: string;

    @ApiProperty({ example: '2026-10-21T14:30:00.000Z', description: 'Last update timestamp' })
    updatedAt: string;

    static fromDomain(order: Order): OrderResponseDto {
        const dto = new OrderResponseDto();
        const total = order.getTotal();

        dto.id = order.id.getValue();
        dto.customerId = order.customerId;
        dto.status = order.status.getValue();
        dto.items = order.items.map(OrderItemResponseDto.fromDomain);
        dto.itemCount = order.getItemCount();
        dto.totalAmount = total.getAmount();
        dto.totalCurrency = total.getCurrency();
        dto.trackingNumber = order.trackingNumber;
        dto.notes = order.notes;
        dto.shippingStreet = order.shippingAddress.street;
        dto.shippingCity = order.shippingAddress.city;
        dto.shippingState = order.shippingAddress.state;
        dto.shippingZipCode = order.shippingAddress.zipCode;
        dto.shippingCountry = order.shippingAddress.country;
        dto.createdAt = order.createdAt.toISOString();
        dto.updatedAt = order.updatedAt.toISOString();

        return dto;
    }
}