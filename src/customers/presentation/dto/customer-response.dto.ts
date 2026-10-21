import { Customer } from '../../domain/entities/customer.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CustomerResponseDto {
    @ApiProperty({ example: 'fbcf91f3-f6a4-4a40-9819-1f581fc4b470', description: 'Customer UUID' })
    id: string;

    @ApiProperty({ example: 'customer@example.com', description: 'Customer email' })
    email: string;

    @ApiProperty({ example: 'John', description: 'Customer first name' })
    firstName: string;

    @ApiProperty({ example: 'Doe', description: 'Customer last name' })
    lastName: string;

    @ApiProperty({ example: 'John Doe', description: 'Customer full name' })
    fullName: string;

    @ApiProperty({ example: true, description: 'Customer active status' })
    isActive: boolean;

    @ApiProperty({ example: '+1234567890', nullable: true, description: 'Customer phone number' })
    phone: string | null;

    @ApiProperty({ example: '2026-10-21T14:30:00.000Z', description: 'Registration timestamp' })
    createdAt: string;

    @ApiProperty({ example: '2026-10-21T14:30:00.000Z', description: 'Last update timestamp' })
    updatedAt: string;

    static fromDomain(customer: Customer): CustomerResponseDto {
        const dto = new CustomerResponseDto();

        dto.id = customer.getId().getValue();
        dto.email = customer.getEmail().getValue();
        dto.firstName = customer.getFirstName();
        dto.lastName = customer.getLastName();
        dto.fullName = customer.getFullName();
        dto.phone = customer.getPhone();
        dto.createdAt = customer.getCreatedAt().toISOString();
        dto.updatedAt = customer.getUpdatedAt().toISOString();

        return dto;
    }
}