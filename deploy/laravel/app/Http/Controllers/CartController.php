<?php

namespace App\Http\Controllers;

use App\Http\Resources\CartItemResource;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class CartController extends Controller
{
    /**
     * Get or create current user's cart.
     */
    protected function getCart(Request $request)
    {
        return Cart::firstOrCreate(['user_id' => $request->user()->id]);
    }

    /**
     * Get cart details and totals.
     */
    public function index(Request $request)
    {
        $cart = $this->getCart($request);
        $subtotal = $cart->cartItems->reduce(fn ($carry, $item) => $carry + ($item->price * $item->quantity), 0);
        
        $discount = 0;
        $coupon = null;
        $couponCode = $cart->coupon_code;
        if ($couponCode) {
            $coupon = Coupon::where('code', $couponCode)->first();
            if ($coupon && $coupon->is_active && $subtotal >= $coupon->min_order) {
                // Check expiry
                if ($coupon->expires_at && $coupon->expires_at < now()) {
                    $cart->update(['coupon_code' => null]);
                    $coupon = null;
                } else {
                    if ($coupon->type === 'percentage') {
                        $discount = ($subtotal * $coupon->value) / 100;
                        if ($coupon->max_discount) {
                            $discount = min($discount, $coupon->max_discount);
                        }
                    } elseif ($coupon->type === 'fixed') {
                        $discount = $coupon->value;
                    }
                }
            } else {
                $cart->update(['coupon_code' => null]);
                $coupon = null;
            }
        }

        $shipping = ($subtotal > 100 || ($coupon && $coupon->type === 'free_shipping')) ? 0 : 10;
        $tax = ($subtotal - $discount) * 0.1;
        $total = ($subtotal - $discount) + $shipping + $tax;

        return response()->json([
            'items' => CartItemResource::collection($cart->cartItems),
            'totals' => [
                'subtotal' => $subtotal,
                'discount' => $discount,
                'shipping' => $shipping,
                'tax' => $tax,
                'total' => max(0, $total),
            ],
            'coupon' => $coupon,
        ]);
    }

    /**
     * Add item to cart.
     */
    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'variant_ids' => 'nullable|array',
            'variant_id' => 'nullable|exists:product_variants,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = $this->getCart($request);
        $product = Product::findOrFail($request->product_id);
        
        $price = $product->sale_price ?? $product->price;
        $variantLabel = null;
        $variantIds = $request->variant_ids ?: ($request->variant_id ? [$request->variant_id] : []);

        if (!empty($variantIds)) {
            $variants = ProductVariant::whereIn('id', $variantIds)->get();
            $labels = [];
            foreach ($variants as $v) {
                if ($v->price_override) {
                    $price = $v->price_override;
                }
                $labels[] = ucfirst($v->type) . ': ' . $v->value;
            }
            $variantLabel = implode(', ', $labels);
        }

        // Sort IDs for consistent lookup
        sort($variantIds);
        $variantIdsJson = json_encode($variantIds);

        // Find existing item with the SAME variant combination
        $cartItem = $cart->cartItems()
            ->where('product_id', $request->product_id)
            ->get()
            ->filter(function($item) use ($variantIds) {
                return $item->variant_ids === $variantIds || (empty($item->variant_ids) && empty($variantIds));
            })
            ->first();

        if ($cartItem) {
            $cartItem->increment('quantity', $request->quantity);
        } else {
            $cart->cartItems()->create([
                'product_id' => $request->product_id,
                'variant_id' => $variantIds[0] ?? null, // Fallback for legacy code
                'variant_ids' => $variantIds,
                'variant_label' => $variantLabel,
                'quantity' => $request->quantity,
                'price' => $price,
            ]);
        }

        return $this->index($request);
    }

    /**
     * Update item quantity.
     */
    public function update(Request $request, $itemId)
    {
        $request->validate(['quantity' => 'required|integer|min:1']);

        $cart = $this->getCart($request);
        $cartItem = $cart->cartItems()->findOrFail($itemId);
        $cartItem->update(['quantity' => $request->quantity]);

        return $this->index($request);
    }

    /**
     * Remove item from cart.
     */
    public function remove(Request $request, $itemId)
    {
        $cart = $this->getCart($request);
        $cart->cartItems()->findOrFail($itemId)->delete();

        return $this->index($request);
    }

    /**
     * Clear entire cart.
     */
    public function clear(Request $request)
    {
        $cart = $this->getCart($request);
        $cart->cartItems()->delete();
        Session::forget('coupon_code');

        return $this->index($request);
    }

    /**
     * Apply coupon code.
     */
    public function applyCoupon(Request $request)
    {
        $request->validate(['code' => 'required|string']);
        
        $coupon = Coupon::where('code', $request->code)
            ->where('is_active', true)
            ->where(function($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->first();

        if (!$coupon) {
            return response()->json(['message' => 'Invalid or expired coupon code'], 422);
        }

        $cart = $this->getCart($request);
        $subtotal = $cart->cartItems->reduce(fn ($carry, $item) => $carry + ($item->price * $item->quantity), 0);

        if ($subtotal < $coupon->min_order) {
            return response()->json(['message' => 'Order minimum for this coupon is $' . $coupon->min_order], 422);
        }

        $cart->update(['coupon_code' => $coupon->code]);

        return $this->index($request);
    }

    /**
     * Remove coupon code.
     */
    public function removeCoupon(Request $request)
    {
        $cart = $this->getCart($request);
        $cart->update(['coupon_code' => null]);
        return $this->index($request);
    }
}
