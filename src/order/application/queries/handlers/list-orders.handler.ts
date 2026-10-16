import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ListOrdersQuery } from "../list-order.query";
import { Order } from "../../../domain/entities/order.entity";
import { Inject } from "@nestjs/common";
import { ORDER_REPOSITORY, OrderRepository } from "../../ports/order.repository.port";

@QueryHandler(ListOrdersQuery)
export class ListOrdersHandler implements IQueryHandler<ListOrdersQuery, Order[]> {
    constructor(
        @Inject(ORDER_REPOSITORY)
        private readonly orderRepository: OrderRepository,
    ) { }

    async execute(query: ListOrdersQuery): Promise<Order[]> {
        if (query.customerId) {
            return this.orderRepository.findByCustomerId(query.customerId);
        }

        return this.orderRepository.findAll();
    }
}