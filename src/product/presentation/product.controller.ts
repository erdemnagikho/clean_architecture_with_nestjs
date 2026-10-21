import { Body, Controller, Post, Get, Query, Param, ParseUUIDPipe, Delete } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from "@nestjs/swagger";
import { CreateProductDto } from "./dtos/create-product.dto";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateProductCommand } from "../application/use-cases/create-product/create-product.command";
import { ListProductsQuery } from "../application/queries/list-products.query";
import { Product } from "../domain/entities/product.entity";
import { ProductResponseDto } from "./dtos/product-response.dto";
import { GetProductQuery } from "../application/queries/get-product.query";
import { DeleteProductCommand } from "../application/use-cases/delete-product/delete-product.command";

@ApiTags('products')
@Controller('products')
export class ProductsController {
    constructor(
        private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a new product' })
    @ApiResponse({ status: 201, description: 'Product created successfully' })
    @ApiResponse({ status: 400, description: 'Validation or domain error' })
    @ApiResponse({ status: 409, description: 'Product with this SKU already exists' })
    async create(@Body() dto: CreateProductDto): Promise<void> {
        await this.commandBus.execute<CreateProductCommand, void>(
            new CreateProductCommand(
                dto.name,
                dto.description,
                dto.sku,
                dto.price,
                dto.currency || 'USD',
                dto.stock,
            ),
        );
    }

    @Get()
    @ApiOperation({ summary: 'List products with optional filters' })
    @ApiQuery({ name: 'isActive', required: false, type: Boolean, description: 'Filter by active status' })
    @ApiQuery({ name: 'minPrice', required: false, type: Number, description: 'Filter by minimum price' })
    @ApiQuery({ name: 'maxPrice', required: false, type: Number, description: 'Filter by maximum price' })
    @ApiResponse({ status: 200, description: 'List of products', type: [ProductResponseDto] })
    async findAll(
        @Query('isActive') isActive?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
    ): Promise<ProductResponseDto[]> {
        const products = await this.queryBus.execute<ListProductsQuery, Product[]>(
            new ListProductsQuery(
                isActive !== undefined ? isActive === 'true' : undefined,
                minPrice !== undefined ? parseFloat(minPrice) : undefined,
                maxPrice !== undefined ? parseFloat(maxPrice) : undefined,
            ),
        );
        return products.map(ProductResponseDto.fromDomain);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get product by ID' })
    @ApiParam({ name: 'id', description: 'Product UUID' })
    @ApiResponse({ status: 200, description: 'Product details', type: ProductResponseDto })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async findOne(
        @Param('id', new ParseUUIDPipe()) id: string,
    ): Promise<ProductResponseDto> {
        const product = await this.queryBus.execute<GetProductQuery, Product>(
            new GetProductQuery(id),
        );
        return ProductResponseDto.fromDomain(product);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete product by ID' })
    @ApiParam({ name: 'id', description: 'Product UUID' })
    @ApiResponse({ status: 200, description: 'Product deleted successfully' })
    @ApiResponse({ status: 404, description: 'Product not found' })
    async remove(
        @Param('id', new ParseUUIDPipe()) id: string,
    ): Promise<void> {
        await this.commandBus.execute<DeleteProductCommand, void>(
            new DeleteProductCommand(id),
        );
    }
}
