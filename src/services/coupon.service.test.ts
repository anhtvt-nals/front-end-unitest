import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CouponService } from './coupon.service';
import { CoreService } from './core.service';

describe('CouponService', () => {
  let couponService: CouponService;
  let coreService: CoreService;

  beforeEach(() => {
    coreService = {
      get: vi.fn()
    } as any;
    
    couponService = new CouponService(coreService);
  });

  describe('getCoupon', () => {
    it('should return coupon data when API call is successful', async () => {
      const mockCoupon = { id: '123', code: 'TEST10' };
      coreService.get = vi.fn<(url: string) => Promise<any>>().mockResolvedValue(mockCoupon);
      const result = await couponService.getCoupon('123');
      expect(coreService.get).toHaveBeenCalledWith('/coupons/123');
      expect(result).toEqual(mockCoupon);
    });

    it('should return null when API call fails', async () => {
      coreService.get = vi.fn<(url: string) => Promise<any>>().mockRejectedValue('API Error');
      const result = await couponService.getCoupon('123');
      expect(coreService.get).toHaveBeenCalledWith('/coupons/123');
      expect(result).toBeNull();
    });
  });
});