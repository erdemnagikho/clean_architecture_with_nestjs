import { Product } from '../../../product/domain/entities/product.entity';
import { ApiProperty } from '@nestjs/swagger';

export class ProductResponseDto {
    @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Product UUID' })
    id: string;

    @ApiProperty({ example: 'Wireless Mechanical Keyboard', description: 'Product name' })
    name: string;

    @ApiProperty({ example: 'High performance tactile switch keyboard', description: 'Product description' })
    description: string;

    @ApiProperty({ example: 'KB-MECH-001', description: 'Stock Keeping Unit' })
    sku: string;

    @ApiProperty({ example: 129.99, description: 'Product price' })
    price: number;

    @ApiProperty({ example: 'USD', description: 'Currency code' })
    currency: string;

    @ApiProperty({ example: 50, description: 'Available stock quantity' })
    stock: number;

    @ApiProperty({ example: true, description: 'Product availability status' })
    isActive: boolean;

    @ApiProperty({ example: 5, description: 'Low stock warning threshold' })
    lowStockThreshold: number;

    @ApiProperty({ example: '2026-10-21T14:30:00.000Z', description: 'Creation timestamp' })
    createdAt: string;

    @ApiProperty({ example: '2026-10-21T14:30:00.000Z', description: 'Last update timestamp' })
    updatedAt: string;

    static fromDomain(product: Product): ProductResponseDto {
        const dto = new ProductResponseDto();
        dto.id = product.id.getValue();
        dto.name = product.name;
        dto.description = product.description;
        dto.sku = product.sku.getValue();
        dto.price = product.price.getAmount();
        dto.currency = product.price.getCurrency();
        dto.stock = product.stock;
        dto.isActive = product.isActive;
        dto.lowStockThreshold = product.lowStockThreshold;
        dto.createdAt = product.createdAt.toISOString();
        dto.updatedAt = product.updatedAt.toISOString();
        return dto;
    }
}