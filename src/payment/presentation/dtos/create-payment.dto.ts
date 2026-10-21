import { IsOptional, IsUrl, IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreatePaymentDto {
    @ApiProperty({ example: '6fd56de6-e0e6-481e-947c-9029aab4f8ec', description: 'Order UUID to initiate payment for' })
    @IsUUID()
    orderId: string;

    @ApiProperty({ example: 'http://localhost:3000/orders/success', required: false, description: 'Redirect URL on successful payment' })
    @IsOptional()
    @IsUrl({ require_tld: false })
    successUrl?: string;

    @ApiProperty({ example: 'http://localhost:3000/orders/cancel', required: false, description: 'Redirect URL if customer cancels payment' })
    @IsOptional()
    @IsUrl({ require_tld: false })
    cancelUrl?: string;
}