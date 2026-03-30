import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addToCart } from '../../services/cartService';
import { toggleWishlist } from '../../services/wishlistService';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const token = useAuthStore(state => state.token);

    const wishlistMutation = useMutation({
        mutationFn: (id) => toggleWishlist(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['wishlist'] });
            const previousWishlist = queryClient.getQueryData(['wishlist']);
            queryClient.setQueryData(['wishlist'], (old) => {
                const updatedData = old?.data ? { ...old } : { data: [] };
                const exists = updatedData.data.some(p => p.id === id);
                if (exists) {
                    updatedData.data = updatedData.data.filter(p => p.id !== id);
                } else {
                    updatedData.data = [...updatedData.data, product];
                }
                return updatedData;
            });
            return { previousWishlist };
        },
        onError: (err, id, context) => {
            queryClient.setQueryData(['wishlist'], context.previousWishlist);
            toast.error(err.response?.data?.message || 'Wishlist operation failed');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['wishlist'] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['category'] });
            queryClient.invalidateQueries({ queryKey: ['featuredProducts'] });
        },
        onSuccess: (data) => {
            toast.success(data.message);
        }
    });

    const cartMutation = useMutation({
        mutationFn: (data) => addToCart(data),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['cart'] });
            const previousCart = queryClient.getQueryData(['cart']);
            queryClient.setQueryData(['cart'], (old) => {
                const updated = old ? { ...old } : { items: [] };
                return {
                    ...updated,
                    items: [...(updated.items || []), { id: 'temp-' + Date.now() }]
                };
            });
            return { previousCart };
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['cart']);
            toast.success('Added to your bag');
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['cart'], context.previousCart);
            toast.error(err.response?.data?.message || 'Cart operation failed');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        }
    });

    const handleQuickAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!token) {
            toast.error('Please login to add items to cart');
            navigate('/login');
            return;
        }

        const variantId = product.variants?.[0]?.id || null;
        cartMutation.mutate({
            product_id: product.id,
            quantity: 1,
            variant_id: variantId
        });
    };

    const handleToggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!token) {
            toast.error('Please login to save items');
            navigate('/login');
            return;
        }
        wishlistMutation.mutate(product.id);
    };

    if (!product) return null;

    const imageUrl = product.image_url || product.images?.[0]?.image_path || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(product.name) + '&background=f6f3f4&color=b0004a&size=400';
    const avgRating = product.reviews_avg_rating || product.average_rating || null;
    
    return (
        <article className="group relative flex flex-col bg-surface-container-low rounded-lg p-4 transition-transform duration-500 hover:-translate-y-2">
            {/* Image Container */}
            <div className="relative aspect-[4/5] rounded-DEFAULT overflow-hidden mb-4 bg-white">
                <Link to={`/products/${product.slug}`} className="block h-full w-full">
                    <img
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt={product.name}
                        src={imageUrl}
                        onError={(e) => { 
                            console.error('Image failed to load:', imageUrl);
                            e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(product.name) + '&background=f6f3f4&color=b0004a&size=400'; 
                        }}
                    />
                </Link>

                {/* Wishlist Button */}
                <button
                    onClick={handleToggleWishlist}
                    className={`absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-sm ${
                        product.is_wishlisted
                            ? 'bg-primary text-white'
                            : 'bg-white/80 text-primary hover:bg-primary hover:text-white'
                    }`}
                >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: `'FILL' ${product.is_wishlisted ? 1 : 0}` }}>
                        favorite
                    </span>
                </button>

                {/* Badges */}
                {product.is_featured && (
                    <div className="absolute bottom-4 left-4">
                        <span className="bg-primary/90 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                            Bestseller
                        </span>
                    </div>
                )}
                {!product.is_featured && product.is_new && (
                    <div className="absolute bottom-4 left-4">
                        <span className="bg-secondary-fixed text-on-secondary-fixed-variant text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                            New
                        </span>
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="flex justify-between items-start mb-1">
                <Link to={`/products/${product.slug}`} className="block group/title flex-1 min-w-0">
                    <h3 className="text-base font-bold text-on-surface font-headline truncate group-hover/title:text-primary transition-colors">
                        {product.name}
                    </h3>
                </Link>
                {avgRating && (
                    <div className="flex items-center text-secondary ml-2 shrink-0">
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="text-xs font-bold ml-0.5">{parseFloat(avgRating).toFixed(1)}</span>
                    </div>
                )}
            </div>

            <p className="text-sm text-on-surface-variant mb-4 line-clamp-1">
                {product.description || product.category?.name || 'Premium quality product'}
            </p>

            {/* Price & Add to Cart */}
            <div className="mt-auto flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-primary">${parseFloat(product.price).toFixed(2)}</span>
                    {product.sale_price && (
                        <span className="text-sm text-on-surface-variant line-through">${parseFloat(product.sale_price).toFixed(2)}</span>
                    )}
                </div>
                <button
                    onClick={handleQuickAdd}
                    disabled={cartMutation.isPending}
                    className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center active:scale-90 transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
                >
                    {cartMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                    )}
                </button>
            </div>
        </article>
    );
};

export default ProductCard;
