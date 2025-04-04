import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentService } from './payment.service';
import type { Order } from '../models/order.model';
import { PaymentMethod } from '../models/payment.model';

describe('PaymentService', () => {
  let paymentService: PaymentService;

  beforeEach(() => {
    paymentService = new PaymentService();
  });

  describe('buildPaymentMethod', () => {
    it('should return all methods if totalPrice is low', () => {
      const result = paymentService.buildPaymentMethod(100000);
      expect(result).toBe('credit,paypay,aupay');
    });

    it('should exclude PAYPAY if totalPrice > 500000', () => {
      const result = paymentService.buildPaymentMethod(510000);
      expect(result).toBe('credit');
    });

    it('should exclude AUPAY if totalPrice > 300000', () => {
      const result = paymentService.buildPaymentMethod(310000);
      expect(result).toBe('credit,paypay');
    });

    it('should exclude both PAYPAY and AUPAY if totalPrice > 500000', () => {
      const result = paymentService.buildPaymentMethod(600000);
      expect(result).toBe('credit');
    });
  });

  describe('payViaLink', () => {
    it('should call window.open with the correct URL', async () => {
      const order: Order = {
        id: 'abc123',
        paymentMethod: PaymentMethod.CREDIT,
        items: [
          {
            id: '1',
            productId: 'product1',
            price: 100,
            quantity: 1,
          },
        ],
        couponId: 'FULL_DISCOUNT',
        totalPrice: 100
      };

      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      await paymentService.payViaLink(order);

      expect(openSpy).toHaveBeenCalledWith(
        'https://payment.example.com/pay?orderId=abc123',
        '_blank'
      );

      openSpy.mockRestore();
    });
  });
});
