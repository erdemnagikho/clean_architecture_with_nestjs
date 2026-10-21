import { Body, Controller, Headers, Inject, Logger, Post, RawBody } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from "@nestjs/swagger";
import { CreatePaymentDto } from "./dtos/create-payment.dto";
import { CommandBus } from "@nestjs/cqrs";
import { CreatePaymentCommand } from "../application/use-cases/create-payment/create-payment.command";
import { PAYMENT_GATEWAY, PaymentGatewayPort } from "../ports/payment-gateway.port";
import { ConfirmPaymentCommand } from "../application/use-cases/confirm-payment/confirm-payment.command";

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
    private readonly logger = new Logger(PaymentController.name);

    constructor(
        private readonly commandBus: CommandBus,
        @Inject(PAYMENT_GATEWAY) private readonly paymentGateway: PaymentGatewayPort,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create Stripe checkout session for an order' })
    @ApiResponse({
        status: 201,
        description: 'Checkout session created',
        schema: {
            type: 'object',
            properties: {
                checkoutUrl: { type: 'string', example: 'https://checkout.stripe.com/c/pay/cs_test_...' }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Invalid amount or already paid' })
    @ApiResponse({ status: 404, description: 'Order not found' })
    async createPayment(@Body() dto: CreatePaymentDto) {
        return this.commandBus.execute(
            new CreatePaymentCommand(dto.orderId, dto.successUrl, dto.cancelUrl),
        );
    }

    @Post('webhook')
    @ApiOperation({ summary: 'Stripe webhook receiver' })
    @ApiHeader({ name: 'stripe-signature', description: 'Stripe signature header for cryptographic verification' })
    @ApiResponse({ status: 200, description: 'Webhook received and processed' })
    @ApiResponse({ status: 400, description: 'Invalid signature or payload' })
    async handleWebhook(
        @RawBody() payload: Buffer,
        @Headers('stripe-signature') signature: string,
    ) {
        const event = this.paymentGateway.constructWebhookEvent(payload, signature);
        this.logger.log('Got stripe webhook event', event);

        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                const paymentId = session.metadata?.paymentId;
                const gatewayTransactionId =
                    typeof session.payment_intent === 'string'
                        ? session.payment_intent
                        : session.payment_intent?.id;

                if (paymentId && gatewayTransactionId) {
                    await this.commandBus.execute(
                        new ConfirmPaymentCommand(paymentId, gatewayTransactionId),
                    );
                }
                break;
            }
            default:
                break;
        }
    }
}