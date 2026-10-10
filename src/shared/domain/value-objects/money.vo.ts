import { DomainException } from "../exceptions/domain.exception";

export class Money {
    private constructor(
        private readonly amount: number,
        private readonly currency: string,
    ) { }

    static create(amount: number, currency: string = 'USD'): Money {
        if (amount < 0) {
            throw new DomainException('Amount must be positive');
        }

        const normalized = Math.round(amount * 100) / 100;

        return new Money(normalized, currency.toUpperCase());
    }

    static zero(currency: string = 'USD'): Money {
        return new Money(0, currency.toUpperCase());
    }

    add(other: Money): Money {
        this.assertSameCurrency(other);
        const amount = this.amount + other.amount;
        return Money.create(amount, this.currency);
    }

    multipy(factor: number): Money {
        if (factor < 0) {
            throw new DomainException('Multiplication factor cannot be negative');
        }

        return Money.create(this.amount * factor, this.currency);
    }

    subtract(other: Money): Money {
        this.assertSameCurrency(other);
        const result = this.amount - other.amount;
        if (result < 0) {
            throw new DomainException('Result of subtraction cannot be negative');
        }

        return Money.create(result, this.currency);
    }

    isGreaterThan(other: Money): boolean {
        this.assertSameCurrency(other);
        return this.amount >= other.amount;
    }

    getAmount(): number {
        return this.amount;
    }

    getCurrency(): string {
        return this.currency;
    }

    toCents() {
        return Math.round(this.amount * 100);
    }

    private assertSameCurrency(other: Money): void {
        if (this.currency !== other.currency) {
            throw new DomainException(
                `Currencies do not match: ${this.currency} vs ${other.currency}`
            );
        }
    }
}