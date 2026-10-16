import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { Inject } from "@nestjs/common";
import { NOTIFICATION_SERVICE, NotificationPort } from "../../../customers/application/ports/notification.port";
import { OrderDeliveredEvent } from "../../domain/events/order-delivered.event";

@EventsHandler(OrderDeliveredEvent)
export class OrderDeliveredHandler implements IEventHandler<OrderDeliveredEvent> {
    constructor(
        @Inject(NOTIFICATION_SERVICE)
        private readonly notificationService: NotificationPort,
    ) { }

    async handle(event: OrderDeliveredEvent) {
        await this.notificationService.sendNotification({
            recipientId: event.customerId,
            subject: 'Order Delivered',
            message: `Your Clean Shop order ${event.orderId} has been delivered.`,
        });
    }
}