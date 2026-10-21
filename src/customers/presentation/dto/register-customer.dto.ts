import {
    IsEmail,
    IsNotEmpty,
    IsPhoneNumber,
    IsString,
    MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterCustomerDto {
    @ApiProperty({ example: 'customer@example.com', description: 'Customer email address' })
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(100)
    email: string;

    @ApiProperty({ example: 'John', description: 'Customer first name' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    firstName: string;

    @ApiProperty({ example: 'Doe', description: 'Customer last name' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    lastName: string;

    @ApiProperty({ example: '+1234567890', description: 'Customer phone number' })
    @IsPhoneNumber()
    phone: string;
}