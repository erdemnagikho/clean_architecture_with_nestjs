import { Type } from "class-transformer";
import { IsString, IsUUID, MinLength, MaxLength, IsNumber, Min, IsOptional, IsArray, ValidateNested, ArrayMinSize } from "class-validator";

export class PlaceOrderItemDto {
    @IsUUID()
    productId: string;

    @IsString()
    @MinLength(1)
    @MaxLength(255)
    productName: string;

    @IsNumber()
    @Min(0)
    unitPrice: number;

    @IsString()
    @MaxLength(3)
    @MinLength(3)
    @IsOptional()
    currency?: string = 'USD'

    @IsNumber()
    @Min(1)
    quantity: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    discount?: number = 0;
}

export class PlaceOrderDto {
    @IsUUID()
    customerId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @ArrayMinSize(1)
    @Type(() => PlaceOrderItemDto)
    items: PlaceOrderItemDto[];

    @IsString()
    shippingStreet: string;

    @IsString()
    shippingCity: string;

    @IsString()
    shippingState: string;

    @IsString()
    shippingZipCode: string;

    @IsString()
    shippingCountry: string;
}