import { OrderCancelledHandler } from "./order-cancelled.handler";
import { OrderConfirmedHandler } from "./order-confirmed.handler";
import { OrderDeliveredHandler } from "./order-delivered.handler";
import { OrderPlaceHandler } from "./order-placed.handler";
import { OrderShippedHandler } from "./order-shipped.handler";

export const EventHandlers = [
    OrderPlaceHandler,
    OrderConfirmedHandler,
    OrderShippedHandler,
    OrderDeliveredHandler,
    OrderCancelledHandler,
];