import { CoreService } from "./core.service";

export class CouponService {
  private readonly COUPON_URL = '/coupons';

  constructor(
    private readonly coreService: CoreService
  ) { }

  /**
   * Get coupon by id
   * @param couponId 
   * @returns 
   */
  async getCoupon(couponId: string): Promise<any> {
    try {
      return await this.coreService.get(this.COUPON_URL + '/' + couponId);
    } catch (error) {
      return null;
    }
  }
}