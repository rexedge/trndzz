import { create } from 'zustand';

export interface RfqPrefillDraft {
	verticalSlug: string | null;
	categoryId: string | null;
	categoryName: string | null;
	sourceArticleId: string | null;
	sourceArticleTitle: string | null;
	targetCompanyId: string | null;
	targetCompanyName: string | null;
	specifications: Record<string, string>;
}

interface RfqDraftState {
	draft: RfqPrefillDraft;
	setPrefill: (partial: Partial<RfqPrefillDraft>) => void;
	resetDraft: () => void;
}

const initialDraft: RfqPrefillDraft = {
	verticalSlug: null,
	categoryId: null,
	categoryName: null,
	sourceArticleId: null,
	sourceArticleTitle: null,
	targetCompanyId: null,
	targetCompanyName: null,
	specifications: {},
};

export const useRfqDraftStore = create<RfqDraftState>((set) => ({
	draft: initialDraft,
	setPrefill: (partial) =>
		set((state) => ({
			draft: { ...state.draft, ...partial },
		})),
	resetDraft: () => set({ draft: initialDraft }),
}));

