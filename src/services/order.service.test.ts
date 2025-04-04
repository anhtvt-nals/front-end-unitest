import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { OrderService } from './order.service';
import { PaymentService } from './payment.service';
import { CouponService } from './coupon.service';
import { CoreService } from './core.service';
import { Order } from '../models/order.model';

// Define interfaces for better type safety
interface OrderItem {
  price: number;
  quantity: number;
}

interface Coupon {
  discount: number;
}

interface MockPaymentService extends Partial<PaymentService> {
  buildPaymentMethod: Mock;
  payViaLink: Mock;
}

interface MockCouponService extends Partial<CouponService> {
  getCoupon: Mock;
}

interface MockCoreService extends Partial<CoreService> {
  get: Mock;
  post: Mock;
}

describe('OrderService', () => {
  let orderService: OrderService;
  let paymentService: MockPaymentService;
  let couponService: MockCouponService;
  let coreService: MockCoreService;

  beforeEach(() => {
    paymentService = {
      buildPaymentMethod: vi.fn(),
      payViaLink: vi.fn()
    };

    couponService = {
      getCoupon: vi.fn()
    };

    coreService = {
      post: vi.fn(),
      get: vi.fn()
    };

    orderService = new OrderService(
      paymentService as unknown as PaymentService,
      couponService as unknown as CouponService,
      coreService as unknown as CoreService,
    );
  });

  describe('createOrder', () => {
    const order: Partial<Order> = {
      items: [
        {
          id: '1',
          productId: 'product1',
          price: 100,
          quantity: 2,
        },
        {
          id: '2',
          productId: 'product2',
          price: 200,
          quantity: 1,
        },
      ],
    };

    it('should create order successfully', async () => {
      const mockOrder: Partial<Order> = { id: "1", ...order };
      coreService.post.mockResolvedValue(mockOrder);
      const result = await orderService.createOrder(mockOrder);
      expect(result).toEqual(mockOrder);
      expect(coreService.post).toHaveBeenCalledWith('/orders', mockOrder);
    });

    it('should return null if create order error', async () => {
      const mockOrder: Partial<Order> = { id: "1", ...order };
      coreService.post.mockRejectedValue(new Error('Failed to create order'));
      const result = await orderService.createOrder(mockOrder);
      expect(result).toEqual(null);
      expect(coreService.post).toHaveBeenCalledWith('/orders', mockOrder);
    });
  });

  describe('process', () => {
    it('should process order error when no have order items', async () => {
      await expect(orderService.process({ id: "123", items: [] })).rejects.toThrow('Order items are required');
    });

    it('should process order error when order have item have negative quanity', async () => {
      const order: Partial<Order> = {
        items: [
          {
            id: '1',
            productId: 'product1',
            price: 100,
            quantity: -1,
          },
          {
            id: '2',
            productId: 'product2',
            price: 200,
            quantity: 1,
          },
        ],
      };
      await expect(orderService.process({ id: "123", ...order })).rejects.toThrow('Order items are invalid');
    });

    it('should process order error when order have item have negative price', async () => {
      const order: Partial<Order> = {
        items: [
          {
            id: '1',
            productId: 'product1',
            price: -100,
            quantity: 1,
          },
          {
            id: '2',
            productId: 'product2',
            price: 200,
            quantity: 1,
          },
        ],
      };
      await expect(orderService.process({ id: "123", ...order })).rejects.toThrow('Order items are invalid');
    });

    it('should process order error for invalid coupon', async () => {
      const orderWithInvalidCoupon: Partial<Order> = {
        items: [
          {
            id: '1',
            productId: 'product1',
            price: 100,
            quantity: 1,
          },
        ],
        couponId: 'INVALID',
      };
      couponService.getCoupon.mockResolvedValue(null);
      await expect(
        orderService.process(orderWithInvalidCoupon)
      ).rejects.toThrow('Invalid coupon');
    });

    it('should process create order for without coupon', async () => {
      const orderWithCoupon: Partial<Order> = {
        items: [
          {
            id: '1',
            productId: 'product1',
            price: 100,
            quantity: 1,
          },
        ],
      };
      paymentService.buildPaymentMethod.mockReturnValue('CREDIT');

      orderService.createOrder = vi.fn().mockResolvedValue({ ...orderWithCoupon, id: '1' });

      await orderService.process(orderWithCoupon);

      expect(paymentService.payViaLink).toHaveBeenCalledWith({ ...orderWithCoupon, id: '1' });
    });

    it('should process order handle zero total after discount', async () => {
      const orderWithFullCoupon: Partial<Order> = {
        items: [
          {
            id: '1',
            productId: 'product1',
            price: 100,
            quantity: 1,
          },
        ],
        couponId: 'FULL_DISCOUNT',
      };
      couponService.getCoupon.mockResolvedValue({ discount: 300 });
      paymentService.buildPaymentMethod.mockReturnValue('CREDIT');
      orderService.createOrder = vi.fn().mockResolvedValue({ ...orderWithFullCoupon, id: '1' });
      await orderService.process(orderWithFullCoupon);
      expect(paymentService.buildPaymentMethod).toHaveBeenCalledWith(0);
    });

    it('should process order error when create order', async () => {
      const orderWithCoupon: Partial<Order> = {
        items: [
          {
            id: '1',
            productId: 'product1',
            price: 100,
            quantity: 1,
          },
        ],
        couponId: 'FULL_DISCOUNT',
      };
      orderService.createOrder = vi.fn().mockResolvedValue(null);
      couponService.getCoupon.mockResolvedValue({ discount: 50 });
      paymentService.buildPaymentMethod.mockReturnValue('CREDIT');
      await expect(orderService.process(orderWithCoupon)).rejects.toThrow('Failed to create order');
    });

  });
});
