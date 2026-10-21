import { Type } from "class-transformer";
import { IsString, IsUUID, MinLength, MaxLength, IsNumber, Min, IsOptional, IsArray, ValidateNested, ArrayMinSize } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PlaceOrderItemDto {
    @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', description: 'Product UUID' })
    @IsUUID()
    productId: string;

    @ApiProperty({ example: 'Wireless Mechanical Keyboard', description: 'Product name' })
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    productName: string;

    @ApiProperty({ example: 129.99, description: 'Unit price' })
    @IsNumber()
    @Min(0)
    unitPrice: number;

    @ApiProperty({ example: 'USD', default: 'USD', required: false, description: 'Currency code' })
    @IsString()
    @MaxLength(3)
    @MinLength(3)
    @IsOptional()
    currency?: string = 'USD';

    @ApiProperty({ example: 2, description: 'Quantity to order' })
    @IsNumber()
    @Min(1)
    quantity: number;

    @ApiProperty({ example: 0, default: 0, required: false, description: 'Discount amount' })
    @IsNumber()
    @Min(0)
    @IsOptional()
    discount?: number = 0;
}

export class PlaceOrderDto {
    @ApiProperty({ example: 'fbcf91f3-f6a4-4a40-9819-1f581fc4b470', description: 'Customer UUID' })
    @IsUUID()
    customerId: string;

    @ApiProperty({ type: [PlaceOrderItemDto], description: 'List of order items' })
    @IsArray()
    @ValidateNested({ each: true })
    @ArrayMinSize(1)
    @Type(() => PlaceOrderItemDto)
    items: PlaceOrderItemDto[];

    @ApiProperty({ example: '123 Market St', description: 'Shipping street address' })
    @IsString()
    shippingStreet: string;

    @ApiProperty({ example: 'San Francisco', description: 'Shipping city' })
    @IsString()
    shippingCity: string;

    @ApiProperty({ example: 'CA', description: 'Shipping state or province' })
    @IsString()
    shippingState: string;

    @ApiProperty({ example: '94103', description: 'Shipping ZIP or postal code' })
    @IsString()
    shippingZipCode: string;

    @ApiProperty({ example: 'USA', description: 'Shipping country' })
    @IsString()
    shippingCountry: string;
}