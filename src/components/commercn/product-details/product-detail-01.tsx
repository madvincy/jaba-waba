"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Minus, Plus, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/lib/redux-hooks";
import { addToCart, Product } from "@/lib/store";

export interface ProductDetailProps {
	product?: Partial<Product> & {
		currency?: string;
		images?: string[];
		sizes?: string[];
		venue?: string;
		location?: string;
		ticketPhone?: string;
	};
}

const defaultProduct: ProductDetailProps["product"] = {
	name: "Jaba Waba Signature Juice",
	description:
		"A delicious blend of seasonal fruits crafted for refreshing flavour and everyday wellness.",
	category: "Juice",
	price: 6.5,
	currency: "KSH ",
	images: [
		"https://images.unsplash.com/photo-1551024709-8f23befc6fd4?auto=format&fit=crop&q=80&w=900",
		"https://images.unsplash.com/photo-1508747703725-7197e5119a04?auto=format&fit=crop&q=80&w=900",
		"https://images.unsplash.com/photo-1543353071-087092ec393a?auto=format&fit=crop&q=80&w=900",
	],
	ticketPhone: "254700000000",
};

export function ProductDetailOne({ product }: ProductDetailProps) {
	const dispatch = useAppDispatch();
	const detailProduct = { ...defaultProduct, ...product };
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [selectedOption, setSelectedOption] = useState("");
	const [quantity, setQuantity] = useState(1);

	const isJuice = detailProduct.category === "Juice";
	const isMerch = detailProduct.category === "Merch";
	const isEvent = detailProduct.category === "Event";

	const options = detailProduct.variants?.length
		? detailProduct.variants.map((variant) => variant.name)
		: isJuice
		? detailProduct.sizes ?? ["500ml", "1L", "2L"]
		: isMerch
		? detailProduct.sizes ?? ["S", "M", "L", "XL"]
		: isEvent
		? ["Standard Ticket"]
		: ["Standard"];

	useEffect(() => {
		setCurrentImageIndex(0);
		setQuantity(1);
		setSelectedOption(options[0] ?? "");
	}, [product, options]);

	const nextImage = () => {
		setCurrentImageIndex((prev) =>
			(prev + 1) % (detailProduct.images?.length ?? 1),
		);
	};

	const prevImage = () => {
		setCurrentImageIndex((prev) =>
			(prev - 1 + (detailProduct.images?.length ?? 1)) %
			(detailProduct.images?.length ?? 1),
		);
	};

	const incrementQuantity = () => setQuantity((prev) => prev + 1);
	const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

	const whatsappUrl = `https://wa.me/${detailProduct.ticketPhone ?? "254700000000"}?text=${encodeURIComponent(
		`Hi Jaba Waba! I would like to book ${detailProduct.name}${
			isEvent ? " ticket(s)" : ""
		}.`,
	)}`;

	const displayPrice = detailProduct.price ?? 0;
	const showDiscount = (detailProduct.discount ?? 0) > 0;
	const discountedPrice = showDiscount
		? displayPrice - (detailProduct.discount ?? 0)
		: displayPrice;

	// Find selected variant and its price
	const selectedVariant = (detailProduct.variants ?? []).find(
		(v) => v.name === selectedOption
	);
	const variantPrice = selectedVariant?.price ?? null;
	const effectivePrice = variantPrice ?? discountedPrice;
	const selectedVariantId = selectedVariant?.id;
	const selectedVariantName = selectedVariant?.name;

	return (
		<div className="w-full max-w-6xl mx-auto p-6 not-prose">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
				<div className="flex gap-2">
					<div className="flex flex-col w-28 gap-2">
						{(detailProduct.images ?? []).map((image, index) => (
							<button
								key={index}
								onClick={() => setCurrentImageIndex(index)}
								className={cn(
									"aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors",
									currentImageIndex === index ? "border-gray-900" : "border-transparent",
								)}
							>
								<img
									src={image}
									alt={`${detailProduct.name ?? "product"} ${index + 1}`}
									className="w-full h-full object-cover"
								/>
							</button>
						))}
					</div>

					<div className="flex-1 relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
						<img
							src={detailProduct.images?.[currentImageIndex] ?? "https://images.unsplash.com/photo-1508747703725-7197e5119a04?auto=format&fit=crop&q=80&w=900"}
							alt={detailProduct.name}
							className="w-full h-full object-cover"
						/>

						<Button
							variant="outline"
							size="icon"
							className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full"
							onClick={prevImage}
						>
							<ChevronLeft className="w-4 h-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full"
							onClick={nextImage}
						>
							<ChevronRight className="w-4 h-4" />
						</Button>
					</div>
				</div>

				<div className="space-y-6">
					<div>
						<span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:bg-slate-900 dark:text-slate-300">
							{detailProduct.category}
						</span>
						<h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">
							{detailProduct.name}
						</h1>
						<p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
							{detailProduct.description}
						</p>
					</div>

					<div className="flex flex-wrap items-center gap-4">
						{detailProduct.rating ? (
							<div className="flex items-center gap-2 text-yellow-500">
								<Star className="h-5 w-5" />
								<span className="font-semibold">{detailProduct.rating.toFixed(1)}</span>
							</div>
						) : null}
						<div className="text-3xl font-bold text-green-600">
							{detailProduct.currency}
						{effectivePrice.toFixed(1)}
						</div>
						{showDiscount ? (
							<div className="text-sm line-through text-slate-400">
								{detailProduct.currency}
								{displayPrice.toFixed(1)}
							</div>
						) : null}
					</div>

					<div>
						<h3 className="text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
							{isJuice ? "Choose Volume" : isMerch ? "Choose Size" : "Ticket Type"}
						</h3>
						<div className="flex flex-wrap gap-2">
							{options.map((option) => (
								<Button
									key={option}
									variant={selectedOption === option ? "default" : "outline"}
									size="sm"
									onClick={() => setSelectedOption(option)}
								>
									{option}
								</Button>
							))}
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-4">
						{(!isEvent || isJuice || isMerch) && (
							<div className="flex items-center border border-slate-200 rounded-lg dark:border-slate-800">
								<Button
									variant="ghost"
									size="icon"
									className="h-10 w-10 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
									onClick={decrementQuantity}
								>
									<Minus className="w-4 h-4" />
								</Button>
								<span className="w-12 text-center font-medium text-slate-900 dark:text-slate-100">{quantity}</span>
								<Button
									variant="ghost"
									size="icon"
									className="h-10 w-10 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
									onClick={incrementQuantity}
								>
									<Plus className="w-4 h-4" />
								</Button>
							</div>
						)}

						{isEvent ? (
							<a
								href={whatsappUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center justify-center rounded-full bg-green-600 px-6 py-3 text-sm font-semibold text-white hover:bg-green-700"
							>
								Book on WhatsApp
							</a>
						) : (
							<Button 
								size="lg" 
								onClick={() => {
									if (!detailProduct.id) return;
									dispatch(addToCart({
										productId: detailProduct.id,
									variantId: selectedVariantId,
									variantPrice: variantPrice ?? undefined,
									}));
								}}
							>
								Add to cart
							</Button>
						)}
					</div>

					{isEvent && (
						<div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
							<div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 mb-2">
								<span className="font-semibold">Location:</span>
								<span>{detailProduct.location ?? detailProduct.venue ?? "Freedom Heights Market"}</span>
							</div>
							<p className="text-slate-600 dark:text-slate-400">
								Experience music, juice tastings, and live community connection at the venue.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
