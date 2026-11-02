import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RfqCartItem {
	productId: string;
	productName: string;
	verticalId: string;
	verticalSlug: string;
	categoryId: string;
	categorySlug: string;
	categoryName: string;
	companyId: string;
	companyName: string;
	unit: string;
	quantity: number;
	indicativeMin: number | null;
	currency: string;
	specifications: Record<string, string>;
}

interface RfqCartState {
	items: RfqCartItem[];
	isOpen: boolean;
	setOpen: (open: boolean) => void;
	addItem: (item: RfqCartItem) => void;
	removeItem: (productId: string) => void;
	updateQuantity: (productId: string, quantity: number) => void;
	clearVerticalItems: (verticalSlug: string) => void;
	clearAll: () => void;
}

export const useRfqCartStore = create<RfqCartState>()(
	persist(
		(set) => ({
			items: [],
			isOpen: false,
			setOpen: (open) => set({ isOpen: open }),
			addItem: (item) =>
				set((state) => {
					const existing = state.items.find(
						(i) => i.productId === item.productId
					);
					if (existing) {
						return {
							isOpen: true,
							items: state.items.map((i) =>
								i.productId === item.productId
									? {
											...i,
											quantity:
												i.quantity +
												Math.max(1, item.quantity),
										}
									: i
							),
						};
					}
					return {
						isOpen: true,
						items: [
							...state.items,
							{ ...item, quantity: Math.max(1, item.quantity) },
						],
					};
				}),
			removeItem: (productId) =>
				set((state) => ({
					items: state.items.filter((i) => i.productId !== productId),
				})),
			updateQuantity: (productId, quantity) =>
				set((state) => ({
					items: state.items.map((i) =>
						i.productId === productId
							? { ...i, quantity: Math.max(0.1, quantity) }
							: i
					),
				})),
			clearVerticalItems: (verticalSlug) =>
				set((state) => ({
					items: state.items.filter(
						(i) => i.verticalSlug !== verticalSlug
					),
				})),
			clearAll: () => set({ items: [] }),
		}),
		{
			name: 'trndzz-rfq-basket-v1',
			partialize: (state) => ({ items: state.items }),
		}
	)
);

