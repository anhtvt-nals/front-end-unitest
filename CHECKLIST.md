## Test Report

- Coverage report page: [LINK](https://github.com/anhtvt-nals/front-end-unitest/tree/main/coverage)

#### `#CoreService` (4 tests)

- should build correct path
- should call API with GET and return data
- should call API with POST and send data
- should reject when response is not ok


#### `#CouponService` (2 tests)

- should return coupon data when API call is successful
- should return null when API call fails


#### `#OrderService` (11 tests)

- createOrder -> should create order successfully
- createOrder -> should return null if create order error
- process -> should process order error when no have order items
- process -> should process order error when order have item have negative quanity
- process -> should process order error when order have item have negative price
- process -> should process order error for invalid coupon
- process -> should process create order for without coupon
- process -> should process order handle zero total after discount
- process -> should process order error when create order
- process -> should process order error when create order null
- process -> should process order when create order success

#### `#PaymentService` (5 tests)
- buildPaymentMethod -> should return all methods if totalPrice is low
- buildPaymentMethod -> should exclude PAYPAY if totalPrice > 500000
- buildPaymentMethod -> should exclude AUPAY if totalPrice > 300000
- buildPaymentMethod -> should exclude both PAYPAY and AUPAY if totalPrice > 500000
- payViaLink -> should call window.open with the correct URL