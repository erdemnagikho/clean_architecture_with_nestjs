import { IsString, MaxLength, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ShipOrderDto {
    @ApiProperty({ example: 'TRK-9876543210', description: 'Shipment tracking number' })
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    trackingNumber: string;
}