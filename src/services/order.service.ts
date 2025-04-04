import { Order } from '../models/order.model';
import { PaymentService } from './payment.service';
import { CouponService } from './coupon.service';
import { CoreService } from './core.service';

export class OrderService {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly couponService: CouponService,
    private readonly coreService: CoreService
  ) { }

  async createOrder(order: Record<string, any>): Promise<any> {
    try {
      return await this.coreService.post('/orders', order);
    } catch (error) {
      return null;
    }
  }

  async process(order: Partial<Order>) {
    if (!order.items?.length) {
      throw new Error('Order items are required');
    }

    if (order.items.some(item => item.price <= 0 || item.quantity <= 0)) {
      throw new Error('Order items are invalid');
    }

    let totalPrice = order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    if (order.couponId) {
      const coupon = await this.couponService.getCoupon(order.couponId);

      if (!coupon) {
        throw new Error('Invalid coupon');
      }

      totalPrice -= coupon.discount;

      if (totalPrice < 0) {
        totalPrice = 0;
      }
    }

    const orderPayload = {
      ...order,
      totalPrice,
      paymentMethod: this.paymentService.buildPaymentMethod(totalPrice),
    }

    const createdOrder = await this.createOrder(orderPayload);
  
    if (!createdOrder) {
      throw new Error('Failed to create order');
    }

    this.paymentService.payViaLink(createdOrder);
  }
}
