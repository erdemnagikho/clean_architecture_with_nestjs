import {
    IsNumber,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
    @ApiProperty({ example: 'Wireless Mechanical Keyboard', description: 'Product name' })
    @IsString()
    @MinLength(2)
    @MaxLength(255)
    name: string;

    @ApiProperty({ example: 'High performance tactile switch keyboard', description: 'Product description' })
    @IsString()
    description: string;

    @ApiProperty({ example: 'KB-MECH-001', description: 'Unique Stock Keeping Unit (SKU)' })
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    @Matches(/^[A-Za-z0-9-]+$/, {
        message: 'SKU must contain only alphanumeric characters and dashes',
    })
    sku: string;

    @ApiProperty({ example: 129.99, description: 'Product price' })
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty({ example: 'USD', default: 'USD', required: false, description: 'Currency code (3 uppercase letters)' })
    @IsString()
    @MinLength(3)
    @MaxLength(3)
    @IsOptional()
    currency?: string = 'USD';

    @ApiProperty({ example: 50, description: 'Initial stock quantity' })
    @IsNumber()
    @Min(0)
    stock: number;
}