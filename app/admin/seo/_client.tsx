'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
	ArrowLeft,
	Plus,
	Sparkles,
	Target,
	FileText,
	Calendar,
	Search,
	Folder,
	BarChart3,
	Lightbulb,
	Trash2,
	Check,
	X,
	ChevronDown,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';

import {
	getCategoriesAction,
	createCategoryAction,
	deleteCategoryAction,
	createKeywordAction,
	deleteKeywordAction,
	createContentPlanAction,
	updateContentPlanAction,
	deleteContentPlanAction,
	aiAnalyzeKeywordsAction,
	aiGenerateContentBriefAction,
	aiSuggestCategoriesAction,
	aiGenerateWeeklyCalendarAction,
	getContentCalendarsAction,
	toggleCalendarItemCompletionAction,
	deleteContentCalendarAction,
	createContentPlansFromCalendarAction,
	assignPostCategoryAction,
	aiGenerateDraftFromPlanAction,
} from '@/app/actions/seo';

// Types
interface Category {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	color: string | null;
	order: number;
	isActive: boolean;
	hubTitle: string | null;
	hubDescription: string | null;
	hubMetaDescription: string | null;
	_count: {
		posts: number;
		keywords: number;
		contentPlans: number;
	};
}

interface Keyword {
	id: string;
	keyword: string;
	searchVolume: number | null;
	difficulty: number | null;
	intent: string | null;
	priority: string;
	status: string;
	categoryId: string | null;
	category: { name: string } | null;
	notes: string | null;
}

interface ContentPlan {
	id: string;
	title: string;
	targetKeyword: string | null;
	secondaryKeywords: string[];
	searchIntent: string | null;
	contentType: string;
	categoryId: string | null;
	category: { name: string } | null;
	outline: string | null;
	targetWordCount: number | null;
	internalLinks: string[];
	status: string;
	priority: string;
	dueDate: Date | null;
	notes: string | null;
}

interface Post {
	id: string;
	title: string;
	slug: string;
	status: string;
	categoryId: string | null;
	focusKeyword: string | null;
	metaDescription: string | null;
	publishedAt: Date | null;
	category: { name: string } | null;
}

interface Stats {
	totalPosts: number;
	postsWithCategory: number;
	postsWithFocusKeyword: number;
	postsWithMetaDescription: number;
	totalCategories: number;
	totalKeywords: number;
	contentPlansIdea: number;
	contentPlansPlanned: number;
	contentPlansWriting: number;
}

interface CalendarItem {
	day: string;
	title: string;
	targetKeyword: string;
	contentType: string;
	category: string;
	priority: string;
	estimatedTime: string;
	notes: string;
}

// Saved calendar from database
interface SavedCalendarItem {
	id: string;
	day: string;
	title: string;
	targetKeyword: string | null;
	contentType: string | null;
	category: string | null;
	priority: string;
	estimatedTime: string | null;
	notes: string | null;
	isCompleted: boolean;
	completedAt: Date | null;
	postId: string | null;
	order: number;
}

interface SavedCalendar {
	id: string;
	weekStart: Date;
	weekEnd: Date;
	name: string | null;
	items: SavedCalendarItem[];
	createdAt: Date;
	_count?: { items: number };
}

interface KeywordResearchResult {
	primaryKeyword: string;
	secondaryKeywords: string[];
	longTailKeywords: string[];
	questions: string[];
	searchIntent: string;
	difficulty: string;
	suggestedTitle: string;
	suggestedMetaDescription: string;
}

interface ContentBrief {
	title: string;
	targetKeyword: string;
	searchIntent: string;
	targetWordCount: number;
	outline: {
		h2: string;
		h3s?: string[];
		keyPoints: string[];
	}[];
	mustInclude: string[];
	internalLinkSuggestions: string[];
	faqQuestions: string[];
	competitorAngles: string[];
	uniqueAngle: string;
	callToAction: string;
}

interface CategorySuggestion {
	name: string;
	slug: string;
	description: string;
	color: string;
	sampleTopics: string[];
	hubPageTitle: string;
	hubPageDescription: string;
}

// Schemas
const categorySchema = z.object({
	name: z.string().min(1, 'Name is required'),
	slug: z.string().min(1, 'Slug is required'),
	description: z.string().optional(),
	color: z.string().optional(),
	hubTitle: z.string().optional(),
	hubMetaDescription: z.string().optional(),
});

const keywordSchema = z.object({
	keyword: z.string().min(1, 'Keyword is required'),
	categoryId: z.string().optional(),
	intent: z.string().optional(),
	priority: z.string().optional(),
	notes: z.string().optional(),
});

const contentPlanSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	targetKeyword: z.string().optional(),
	categoryId: z.string().optional(),
	contentType: z.string().optional(),
	priority: z.string().optional(),
	notes: z.string().optional(),
});

interface Props {
	initialCategories: Category[];
	initialKeywords: Keyword[];
	initialContentPlans: ContentPlan[];
	initialPosts: Post[];
	stats: Stats;
}

export function SeoClient({
	initialCategories,
	initialKeywords,
	initialContentPlans,
	initialPosts,
	stats: initialStats,
}: Props) {
	const [isPending, startTransition] = useTransition();
	const [categories, setCategories] = useState<Category[]>(initialCategories);
	const [keywords, setKeywords] = useState<Keyword[]>(initialKeywords);
	const [contentPlans, setContentPlans] =
		useState<ContentPlan[]>(initialContentPlans);
	const [posts] = useState<Post[]>(initialPosts);
	const [stats] = useState<Stats>(initialStats);

	// Dialog states
	const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
	const [keywordDialogOpen, setKeywordDialogOpen] = useState(false);
	const [contentPlanDialogOpen, setContentPlanDialogOpen] = useState(false);
	const [calendarDialogOpen, setCalendarDialogOpen] = useState(false);
	const [keywordResearchDialogOpen, setKeywordResearchDialogOpen] =
		useState(false);
	const [contentBriefDialogOpen, setContentBriefDialogOpen] = useState(false);

	// AI states
	const [aiLoading, setAiLoading] = useState(false);
	const [suggestedCategories, setSuggestedCategories] = useState<
		CategorySuggestion[]
	>([]);
	const [keywordResearch, setKeywordResearch] =
		useState<KeywordResearchResult | null>(null);
	const [contentBrief, setContentBrief] = useState<ContentBrief | null>(null);
	const [researchTopic, setResearchTopic] = useState('');
	const [briefTopic, setBriefTopic] = useState('');
	const [briefKeyword, setBriefKeyword] = useState('');

	// Saved calendars state
	const [savedCalendars, setSavedCalendars] = useState<SavedCalendar[]>([]);
	const [selectedCalendar, setSelectedCalendar] =
		useState<SavedCalendar | null>(null);
	const [calendarsLoading, setCalendarsLoading] = useState(true);

	// Forms
	const categoryForm = useForm({
		resolver: zodResolver(categorySchema),
		defaultValues: {
			name: '',
			slug: '',
			description: '',
			color: '#6366f1',
			hubTitle: '',
			hubMetaDescription: '',
		},
	});

	const keywordForm = useForm({
		resolver: zodResolver(keywordSchema),
		defaultValues: {
			keyword: '',
			categoryId: '',
			intent: 'informational',
			priority: 'medium',
			notes: '',
		},
	});

	const contentPlanForm = useForm({
		resolver: zodResolver(contentPlanSchema),
		defaultValues: {
			title: '',
			targetKeyword: '',
			categoryId: '',
			contentType: 'post',
			priority: 'medium',
			notes: '',
		},
	});

	// Handlers
	const handleCreateCategory = async (
		data: z.infer<typeof categorySchema>
	) => {
		startTransition(async () => {
			const result = await createCategoryAction(data);
			if (result.success) {
				toast.success('Category created');
				setCategoryDialogOpen(false);
				categoryForm.reset();
				refreshCategories();
			} else {
				toast.error(
					'message' in result
						? result.message
						: 'Failed to create category'
				);
			}
		});
	};

	const handleDeleteCategory = async (id: string) => {
		if (!confirm('Delete this category?')) return;
		startTransition(async () => {
			const result = await deleteCategoryAction(id);
			if (result.success) {
				toast.success('Category deleted');
				refreshCategories();
			} else {
				toast.error(
					'message' in result
						? result.message
						: 'Failed to delete category'
				);
			}
		});
	};

	const handleCreateKeyword = async (data: z.infer<typeof keywordSchema>) => {
		startTransition(async () => {
			const result = await createKeywordAction({
				...data,
				categoryId: data.categoryId || undefined,
			});
			if (result.success) {
				toast.success('Keyword added');
				setKeywordDialogOpen(false);
				keywordForm.reset();
				refreshKeywords();
			} else {
				toast.error(
					'message' in result
						? result.message
						: 'Failed to add keyword'
				);
			}
		});
	};

	const handleDeleteKeyword = async (id: string) => {
		startTransition(async () => {
			const result = await deleteKeywordAction(id);
			if (result.success) {
				toast.success('Keyword deleted');
				setKeywords((prev) => prev.filter((k) => k.id !== id));
			} else {
				toast.error(
					'message' in result
						? result.message
						: 'Failed to delete keyword'
				);
			}
		});
	};

	const handleCreateContentPlan = async (
		data: z.infer<typeof contentPlanSchema>
	) => {
		startTransition(async () => {
			const result = await createContentPlanAction({
				...data,
				categoryId: data.categoryId || undefined,
			});
			if (result.success) {
				toast.success('Content plan created');
				setContentPlanDialogOpen(false);
				contentPlanForm.reset();
				refreshContentPlans();
			} else {
				toast.error(
					'message' in result
						? result.message
						: 'Failed to create plan'
				);
			}
		});
	};

	const handleUpdateContentPlanStatus = async (
		id: string,
		status: string
	) => {
		startTransition(async () => {
			const result = await updateContentPlanAction(id, { status });
			if (result.success) {
				setContentPlans((prev) =>
					prev.map((p) => (p.id === id ? { ...p, status } : p))
				);
				toast.success('Status updated');
			} else {
				toast.error(
					'message' in result ? result.message : 'Failed to update'
				);
			}
		});
	};

	const handleDeleteContentPlan = async (id: string) => {
		startTransition(async () => {
			const result = await deleteContentPlanAction(id);
			if (result.success) {
				toast.success('Plan deleted');
				setContentPlans((prev) => prev.filter((p) => p.id !== id));
			} else {
				toast.error(
					'message' in result ? result.message : 'Failed to delete'
				);
			}
		});
	};

	// AI Handlers
	const handleSuggestCategories = async () => {
		setAiLoading(true);
		try {
			const result = await aiSuggestCategoriesAction();
			if (result.success && 'data' in result) {
				setSuggestedCategories(result.data);
				toast.success('Categories suggested!');
			} else {
				toast.error(
					'message' in result
						? result.message
						: 'Failed to suggest categories'
				);
			}
		} catch {
			toast.error('Failed to suggest categories');
		} finally {
			setAiLoading(false);
		}
	};

	const handleAcceptCategory = async (suggestion: CategorySuggestion) => {
		startTransition(async () => {
			const result = await createCategoryAction({
				name: suggestion.name,
				slug: suggestion.slug,
				description: suggestion.description,
				color: suggestion.color,
				hubTitle: suggestion.hubPageTitle,
				hubMetaDescription: suggestion.hubPageDescription,
			});
			if (result.success) {
				toast.success(`Category "${suggestion.name}" created`);
				setSuggestedCategories((prev) =>
					prev.filter((s) => s.slug !== suggestion.slug)
				);
				refreshCategories();
			} else {
				toast.error(
					'message' in result
						? result.message
						: 'Failed to create category'
				);
			}
		});
	};

	const handleGenerateCalendar = async () => {
		setAiLoading(true);
		try {
			const result = await aiGenerateWeeklyCalendarAction();
			if (result.success && 'data' in result) {
				// Calendar is now saved to DB, add to local state
				const newCalendar = result.data as SavedCalendar;
				setSavedCalendars((prev) => [newCalendar, ...prev]);
				setSelectedCalendar(newCalendar);
				setCalendarDialogOpen(true);
				toast.success('Calendar generated and saved!');
			} else {
				toast.error(
					'message' in result
						? result.message
						: 'Failed to generate calendar'
				);
			}
		} catch {
			toast.error('Failed to generate calendar');
		} finally {
			setAiLoading(false);
		}
	};

	const handleKeywordResearch = async () => {
		if (!researchTopic.trim()) {
			toast.error('Enter a topic to research');
			return;
		}
		setAiLoading(true);
		try {
			const result = await aiAnalyzeKeywordsAction(researchTopic);
			if (result.success && 'data' in result) {
				setKeywordResearch(result.data);
				toast.success('Research complete!');
			} else {
				toast.error(
					'message' in result
						? result.message
						: 'Failed to research keywords'
				);
			}
		} catch {
			toast.error('Failed to research keywords');
		} finally {
			setAiLoading(false);
		}
	};

	const handleGenerateBrief = async () => {
		if (!briefTopic.trim() || !briefKeyword.trim()) {
			toast.error('Enter topic and keyword');
			return;
		}
		setAiLoading(true);
		try {
			const result = await aiGenerateContentBriefAction(
				briefTopic,
				briefKeyword
			);
			if (result.success && 'data' in result) {
				setContentBrief(result.data);
				toast.success('Brief generated!');
			} else {
				toast.error(
					'message' in result
						? result.message
						: 'Failed to generate brief'
				);
			}
		} catch {
			toast.error('Failed to generate brief');
		} finally {
			setAiLoading(false);
		}
	};

	const handleAddCalendarToPlan = async (item: CalendarItem) => {
		startTransition(async () => {
			const result = await createContentPlanAction({
				title: item.title,
				targetKeyword: item.targetKeyword,
				contentType: item.contentType,
				priority: item.priority,
				notes: `${item.notes}\nEstimated time: ${item.estimatedTime}\nCategory: ${item.category}`,
			});
			if (result.success) {
				toast.success('Added to content plans');
				refreshContentPlans();
			} else {
				toast.error(
					'message' in result ? result.message : 'Failed to add plan'
				);
			}
		});
	};

	const handleAddAllCalendarToPlan = async () => {
		if (!selectedCalendar) return;
		const remainingCount = selectedCalendar.items.filter(
			(i) => !i.isCompleted
		).length;
		if (remainingCount === 0) {
			toast.info('No remaining items to add');
			return;
		}

		startTransition(async () => {
			const result = await createContentPlansFromCalendarAction({
				calendarId: selectedCalendar.id,
			});
			if (result.success) {
				const createdCount =
					'data' in result && result.data?.createdCount
						? result.data.createdCount
						: 0;
				toast.success(`Added ${createdCount} items to content plans`);
				refreshContentPlans();
			} else {
				toast.error(
					'message' in result
						? result.message
						: 'Failed to add items to plan'
				);
			}
		});
	};

	const handleGenerateDraftFromPlan = async (planId: string) => {
		startTransition(async () => {
			toast.info('Generating draft with AI...');
			const result = await aiGenerateDraftFromPlanAction(planId);

			if (result.success && 'data' in result && result.data) {
				// Refresh content plans to show updated status
				refreshContentPlans();

				// Show success and redirect to draft
				toast.success('Draft created successfully! Redirecting...');

				// Redirect to the draft editor
				window.location.href = `/admin/drafts/${result.data.postId}`;
			} else {
				toast.error(result.message || 'Failed to generate draft');
			}
		});
	};

	const handleAssignCategory = async (
		postId: string,
		categoryId: string | null
	) => {
		startTransition(async () => {
			const result = await assignPostCategoryAction(postId, categoryId);
			if (result.success) {
				toast.success('Category assigned');
			} else {
				toast.error(
					'message' in result
						? result.message
						: 'Failed to assign category'
				);
			}
		});
	};

	// Refresh functions
	const refreshCategories = async () => {
		const result = await getCategoriesAction();
		if (result.success && 'data' in result) {
			setCategories(result.data as Category[]);
		}
	};

	const refreshKeywords = async () => {
		const { getKeywordsAction } = await import('@/app/actions/seo');
		const result = await getKeywordsAction();
		if (result.success && 'data' in result) {
			setKeywords(result.data as Keyword[]);
		}
	};

	const refreshContentPlans = async () => {
		const { getContentPlansAction } = await import('@/app/actions/seo');
		const result = await getContentPlansAction();
		if (result.success && 'data' in result) {
			setContentPlans(result.data as ContentPlan[]);
		}
	};

	const refreshCalendars = async () => {
		setCalendarsLoading(true);
		try {
			const result = await getContentCalendarsAction();
			if (result.success && 'data' in result) {
				setSavedCalendars(result.data as SavedCalendar[]);
			}
		} finally {
			setCalendarsLoading(false);
		}
	};

	// Load calendars on mount
	useEffect(() => {
		refreshCalendars();
	}, []);

	// Toggle calendar item completion
	const handleToggleItemCompletion = async (itemId: string) => {
		startTransition(async () => {
			const result = await toggleCalendarItemCompletionAction(itemId);
			if (result.success && 'data' in result) {
				// Update local state
				setSavedCalendars((prev) =>
					prev.map((cal) => ({
						...cal,
						items: cal.items.map((item) =>
							item.id === itemId
								? {
										...item,
										isCompleted: result.data.isCompleted,
										completedAt: result.data.completedAt,
								  }
								: item
						),
					}))
				);
				if (selectedCalendar) {
					setSelectedCalendar((prev) =>
						prev
							? {
									...prev,
									items: prev.items.map((item) =>
										item.id === itemId
											? {
													...item,
													isCompleted:
														result.data.isCompleted,
													completedAt:
														result.data.completedAt,
											  }
											: item
									),
							  }
							: null
					);
				}
				toast.success(
					result.data.isCompleted
						? 'Task completed!'
						: 'Task marked incomplete'
				);
			} else {
				toast.error(
					'message' in result
						? result.message
						: 'Failed to update task'
				);
			}
		});
	};

	// Delete calendar
	const handleDeleteCalendar = async (calendarId: string) => {
		startTransition(async () => {
			const result = await deleteContentCalendarAction(calendarId);
			if (result.success) {
				setSavedCalendars((prev) =>
					prev.filter((cal) => cal.id !== calendarId)
				);
				if (selectedCalendar?.id === calendarId) {
					setSelectedCalendar(null);
					setCalendarDialogOpen(false);
				}
				toast.success('Calendar deleted');
			} else {
				toast.error(
					'message' in result
						? result.message
						: 'Failed to delete calendar'
				);
			}
		});
	};

	// Priority badge color
	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case 'high':
				return 'bg-red-100 text-red-800';
			case 'medium':
				return 'bg-yellow-100 text-yellow-800';
			case 'low':
				return 'bg-green-100 text-green-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	const contentPipelineTotal = contentPlans.filter((p) =>
		['idea', 'planned', 'writing'].includes(p.status)
	).length;
	const contentPipelineInProgress = contentPlans.filter(
		(p) => p.status === 'writing'
	).length;

	const normalizeCalendarDay = (day: string): string | null => {
		const normalized = (day ?? '').trim().toLowerCase();
		if (normalized.startsWith('mon')) return 'Monday';
		if (normalized.startsWith('tue')) return 'Tuesday';
		if (normalized.startsWith('wed')) return 'Wednesday';
		if (normalized.startsWith('thu')) return 'Thursday';
		if (normalized.startsWith('fri')) return 'Friday';
		if (normalized.startsWith('sat')) return 'Saturday';
		if (normalized.startsWith('sun')) return 'Sunday';
		return null;
	};

	// Status badge color
	const getStatusColor = (status: string) => {
		switch (status) {
			case 'idea':
				return 'bg-purple-100 text-purple-800';
			case 'planned':
				return 'bg-blue-100 text-blue-800';
			case 'writing':
				return 'bg-orange-100 text-orange-800';
			case 'review':
				return 'bg-yellow-100 text-yellow-800';
			case 'published':
				return 'bg-green-100 text-green-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	return (
		<div className='min-h-screen bg-gray-50 p-4 md:p-6'>
			<div className='mx-auto max-w-7xl space-y-6'>
				{/* Header */}
				<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
					<div className='flex items-center gap-4'>
						<Link href='/admin'>
							<Button
								variant='ghost'
								size='icon'
							>
								<ArrowLeft className='h-5 w-5' />
							</Button>
						</Link>
						<div>
							<h1 className='text-2xl font-bold'>
								SEO Command Center
							</h1>
							<p className='text-sm text-muted-foreground'>
								Keywords, content planning, and optimization
							</p>
						</div>
					</div>
					<div className='flex gap-2'>
						<Button
							onClick={handleGenerateCalendar}
							disabled={aiLoading}
							variant='outline'
						>
							{aiLoading ? (
								<Spinner className='mr-2 h-4 w-4' />
							) : (
								<Calendar className='mr-2 h-4 w-4' />
							)}
							Generate Weekly Calendar
						</Button>
						{calendarsLoading ? (
							<Spinner className='h-5 w-5' />
						) : (
							savedCalendars.length > 0 && (
								<Select
									onValueChange={(value) => {
										const calendar = savedCalendars.find(
											(c) => c.id === value
										);
										if (calendar) {
											setSelectedCalendar(calendar);
											setCalendarDialogOpen(true);
										}
									}}
								>
									<SelectTrigger className='w-50'>
										<SelectValue placeholder='View Saved Calendars' />
									</SelectTrigger>
									<SelectContent>
										{savedCalendars.map((calendar) => (
											<SelectItem
												key={calendar.id}
												value={calendar.id}
											>
												{calendar.name ||
													`Week of ${new Date(
														calendar.weekStart
													).toLocaleDateString()}`}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)
						)}
					</div>
				</div>

				{/* Stats Grid */}
				<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
					<Card>
						<CardHeader className='pb-2'>
							<CardTitle className='text-sm font-medium text-muted-foreground'>
								Total Posts
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{stats.totalPosts}
							</div>
							<p className='text-xs text-muted-foreground'>
								{stats.postsWithCategory} categorized
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className='pb-2'>
							<CardTitle className='text-sm font-medium text-muted-foreground'>
								SEO Coverage
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{stats.totalPosts > 0
									? Math.round(
											(stats.postsWithMetaDescription /
												stats.totalPosts) *
												100
									  )
									: 0}
								%
							</div>
							<p className='text-xs text-muted-foreground'>
								{stats.postsWithFocusKeyword} with focus keyword
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className='pb-2'>
							<CardTitle className='text-sm font-medium text-muted-foreground'>
								Categories
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{stats.totalCategories}
							</div>
							<p className='text-xs text-muted-foreground'>
								Topic clusters
							</p>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className='pb-2'>
							<CardTitle className='text-sm font-medium text-muted-foreground'>
								Content Pipeline
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-2xl font-bold'>
								{contentPipelineTotal}
							</div>
							<p className='text-xs text-muted-foreground'>
								{contentPipelineInProgress} in progress
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Main Tabs */}
				<Tabs
					defaultValue='categories'
					className='space-y-4'
				>
					<TabsList className='grid w-full grid-cols-4'>
						<TabsTrigger value='categories'>
							<Folder className='mr-2 h-4 w-4' />
							<span className='hidden sm:inline'>Categories</span>
						</TabsTrigger>
						<TabsTrigger value='keywords'>
							<Target className='mr-2 h-4 w-4' />
							<span className='hidden sm:inline'>Keywords</span>
						</TabsTrigger>
						<TabsTrigger value='content'>
							<FileText className='mr-2 h-4 w-4' />
							<span className='hidden sm:inline'>
								Content Plan
							</span>
						</TabsTrigger>
						<TabsTrigger value='posts'>
							<BarChart3 className='mr-2 h-4 w-4' />
							<span className='hidden sm:inline'>Posts</span>
						</TabsTrigger>
					</TabsList>

					{/* Categories Tab */}
					<TabsContent
						value='categories'
						className='space-y-4'
					>
						<div className='flex items-center justify-between'>
							<h2 className='text-lg font-semibold'>
								Topic Clusters
							</h2>
							<div className='flex gap-2'>
								<Button
									onClick={handleSuggestCategories}
									disabled={aiLoading}
									variant='outline'
									size='sm'
								>
									{aiLoading ? (
										<Spinner className='mr-2 h-4 w-4' />
									) : (
										<Sparkles className='mr-2 h-4 w-4' />
									)}
									AI Suggest
								</Button>
								<Dialog
									open={categoryDialogOpen}
									onOpenChange={setCategoryDialogOpen}
								>
									<DialogTrigger asChild>
										<Button size='sm'>
											<Plus className='mr-2 h-4 w-4' />
											Add Category
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>
												Create Category
											</DialogTitle>
											<DialogDescription>
												Add a new topic cluster for your
												content
											</DialogDescription>
										</DialogHeader>
										<form
											onSubmit={categoryForm.handleSubmit(
												handleCreateCategory
											)}
											className='space-y-4'
										>
											<div className='space-y-2'>
												<Label>Name</Label>
												<Input
													{...categoryForm.register(
														'name'
													)}
													placeholder='Technology & AI'
												/>
											</div>
											<div className='space-y-2'>
												<Label>Slug</Label>
												<Input
													{...categoryForm.register(
														'slug'
													)}
													placeholder='technology'
												/>
											</div>
											<div className='space-y-2'>
												<Label>Description</Label>
												<Textarea
													{...categoryForm.register(
														'description'
													)}
													placeholder='Articles about tech trends...'
												/>
											</div>
											<div className='grid grid-cols-2 gap-4'>
												<div className='space-y-2'>
													<Label>Color</Label>
													<Input
														{...categoryForm.register(
															'color'
														)}
														type='color'
													/>
												</div>
											</div>
											<div className='space-y-2'>
												<Label>Hub Title (SEO)</Label>
												<Input
													{...categoryForm.register(
														'hubTitle'
													)}
													placeholder='Technology News & AI Trends'
												/>
											</div>
											<div className='space-y-2'>
												<Label>
													Hub Meta Description
												</Label>
												<Textarea
													{...categoryForm.register(
														'hubMetaDescription'
													)}
													placeholder='Latest technology news...'
													maxLength={160}
												/>
											</div>
											<Button
												type='submit'
												className='w-full'
												disabled={isPending}
											>
												{isPending ? (
													<Spinner className='mr-2 h-4 w-4' />
												) : null}
												Create Category
											</Button>
										</form>
									</DialogContent>
								</Dialog>
							</div>
						</div>

						{/* AI Suggested Categories */}
						{suggestedCategories.length > 0 && (
							<Card className='border-purple-200 bg-purple-50'>
								<CardHeader>
									<CardTitle className='flex items-center gap-2 text-purple-700'>
										<Sparkles className='h-5 w-5' />
										AI Suggested Categories
									</CardTitle>
								</CardHeader>
								<CardContent className='space-y-4'>
									{suggestedCategories.map(
										(suggestion, idx) => (
											<div
												key={idx}
												className='flex items-start justify-between rounded-lg border border-purple-200 bg-white p-4'
											>
												<div className='flex-1'>
													<div className='flex items-center gap-2'>
														<div
															className='h-4 w-4 rounded-full'
															style={{
																backgroundColor:
																	suggestion.color,
															}}
														/>
														<h4 className='font-semibold'>
															{suggestion.name}
														</h4>
														<Badge variant='outline'>
															/{suggestion.slug}
														</Badge>
													</div>
													<p className='mt-1 text-sm text-muted-foreground'>
														{suggestion.description}
													</p>
													<div className='mt-2 flex flex-wrap gap-1'>
														{suggestion.sampleTopics
															.slice(0, 3)
															.map((topic, i) => (
																<Badge
																	key={i}
																	variant='secondary'
																	className='text-xs'
																>
																	{topic}
																</Badge>
															))}
													</div>
												</div>
												<div className='flex gap-2'>
													<Button
														size='sm'
														variant='ghost'
														onClick={() =>
															setSuggestedCategories(
																(prev) =>
																	prev.filter(
																		(s) =>
																			s.slug !==
																			suggestion.slug
																	)
															)
														}
													>
														<X className='h-4 w-4' />
													</Button>
													<Button
														size='sm'
														onClick={() =>
															handleAcceptCategory(
																suggestion
															)
														}
														disabled={isPending}
													>
														<Check className='mr-1 h-4 w-4' />
														Accept
													</Button>
												</div>
											</div>
										)
									)}
								</CardContent>
							</Card>
						)}

						{/* Existing Categories */}
						<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
							{categories.map((category) => (
								<Card key={category.id}>
									<CardHeader className='pb-2'>
										<div className='flex items-start justify-between'>
											<div className='flex items-center gap-2'>
												<div
													className='h-4 w-4 rounded-full'
													style={{
														backgroundColor:
															category.color ||
															'#6366f1',
													}}
												/>
												<CardTitle className='text-base'>
													{category.name}
												</CardTitle>
											</div>
											<Button
												variant='ghost'
												size='icon'
												className='h-8 w-8 text-destructive'
												onClick={() =>
													handleDeleteCategory(
														category.id
													)
												}
											>
												<Trash2 className='h-4 w-4' />
											</Button>
										</div>
										<CardDescription>
											/{category.slug}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<p className='text-sm text-muted-foreground line-clamp-2'>
											{category.description ||
												'No description'}
										</p>
										<div className='mt-3 flex gap-4 text-sm'>
											<span>
												{category._count.posts} posts
											</span>
											<span>
												{category._count.keywords}{' '}
												keywords
											</span>
										</div>
									</CardContent>
								</Card>
							))}
							{categories.length === 0 && (
								<div className='col-span-full py-8 text-center text-muted-foreground'>
									No categories yet. Create one or use AI
									suggestions!
								</div>
							)}
						</div>
					</TabsContent>

					{/* Keywords Tab */}
					<TabsContent
						value='keywords'
						className='space-y-4'
					>
						<div className='flex items-center justify-between'>
							<h2 className='text-lg font-semibold'>
								Keyword Research
							</h2>
							<div className='flex gap-2'>
								<Dialog
									open={keywordResearchDialogOpen}
									onOpenChange={setKeywordResearchDialogOpen}
								>
									<DialogTrigger asChild>
										<Button
											variant='outline'
											size='sm'
										>
											<Search className='mr-2 h-4 w-4' />
											AI Research
										</Button>
									</DialogTrigger>
									<DialogContent className='max-h-[80vh] max-w-2xl overflow-y-auto'>
										<DialogHeader>
											<DialogTitle>
												AI Keyword Research
											</DialogTitle>
											<DialogDescription>
												Enter a topic to get
												comprehensive keyword analysis
											</DialogDescription>
										</DialogHeader>
										<div className='space-y-4'>
											<div className='flex gap-2'>
												<Input
													value={researchTopic}
													onChange={(e) =>
														setResearchTopic(
															e.target.value
														)
													}
													placeholder='e.g., ChatGPT alternatives'
												/>
												<Button
													onClick={
														handleKeywordResearch
													}
													disabled={aiLoading}
												>
													{aiLoading ? (
														<Spinner className='h-4 w-4' />
													) : (
														'Research'
													)}
												</Button>
											</div>

											{keywordResearch && (
												<div className='space-y-4'>
													<div className='rounded-lg border p-4'>
														<h4 className='font-semibold'>
															Primary Keyword
														</h4>
														<Badge className='mt-1'>
															{
																keywordResearch.primaryKeyword
															}
														</Badge>
														<div className='mt-2 flex gap-2'>
															<Badge variant='outline'>
																Intent:{' '}
																{
																	keywordResearch.searchIntent
																}
															</Badge>
															<Badge variant='outline'>
																Difficulty:{' '}
																{
																	keywordResearch.difficulty
																}
															</Badge>
														</div>
													</div>

													<div className='rounded-lg border p-4'>
														<h4 className='font-semibold'>
															Suggested Title
														</h4>
														<p className='mt-1 text-sm'>
															{
																keywordResearch.suggestedTitle
															}
														</p>
													</div>

													<div className='rounded-lg border p-4'>
														<h4 className='font-semibold'>
															Meta Description
														</h4>
														<p className='mt-1 text-sm'>
															{
																keywordResearch.suggestedMetaDescription
															}
														</p>
													</div>

													<div className='rounded-lg border p-4'>
														<h4 className='font-semibold'>
															Secondary Keywords
														</h4>
														<div className='mt-2 flex flex-wrap gap-1'>
															{keywordResearch.secondaryKeywords.map(
																(kw, i) => (
																	<Badge
																		key={i}
																		variant='secondary'
																	>
																		{kw}
																	</Badge>
																)
															)}
														</div>
													</div>

													<div className='rounded-lg border p-4'>
														<h4 className='font-semibold'>
															Long-tail Keywords
														</h4>
														<div className='mt-2 flex flex-wrap gap-1'>
															{keywordResearch.longTailKeywords.map(
																(kw, i) => (
																	<Badge
																		key={i}
																		variant='outline'
																	>
																		{kw}
																	</Badge>
																)
															)}
														</div>
													</div>

													<div className='rounded-lg border p-4'>
														<h4 className='font-semibold'>
															Questions (FAQ)
														</h4>
														<ul className='mt-2 space-y-1 text-sm'>
															{keywordResearch.questions.map(
																(q, i) => (
																	<li key={i}>
																		• {q}
																	</li>
																)
															)}
														</ul>
													</div>

													<Button
														className='w-full'
														onClick={() => {
															keywordForm.setValue(
																'keyword',
																keywordResearch.primaryKeyword
															);
															keywordForm.setValue(
																'intent',
																keywordResearch.searchIntent
															);
															setKeywordResearchDialogOpen(
																false
															);
															setKeywordDialogOpen(
																true
															);
														}}
													>
														Add Primary Keyword to
														List
													</Button>
												</div>
											)}
										</div>
									</DialogContent>
								</Dialog>
								<Dialog
									open={keywordDialogOpen}
									onOpenChange={setKeywordDialogOpen}
								>
									<DialogTrigger asChild>
										<Button size='sm'>
											<Plus className='mr-2 h-4 w-4' />
											Add Keyword
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>
												Add Keyword
											</DialogTitle>
										</DialogHeader>
										<form
											onSubmit={keywordForm.handleSubmit(
												handleCreateKeyword
											)}
											className='space-y-4'
										>
											<div className='space-y-2'>
												<Label>Keyword</Label>
												<Input
													{...keywordForm.register(
														'keyword'
													)}
													placeholder='best AI tools 2026'
												/>
											</div>
											<div className='space-y-2'>
												<Label>Category</Label>
												<Select
													value={
														keywordForm.watch(
															'categoryId'
														) || 'none'
													}
													onValueChange={(v) =>
														keywordForm.setValue(
															'categoryId',
															v === 'none'
																? ''
																: v
														)
													}
												>
													<SelectTrigger>
														<SelectValue placeholder='Select category' />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value='none'>
															No category
														</SelectItem>
														{categories.map(
															(cat) => (
																<SelectItem
																	key={cat.id}
																	value={
																		cat.id
																	}
																>
																	{cat.name}
																</SelectItem>
															)
														)}
													</SelectContent>
												</Select>
											</div>
											<div className='grid grid-cols-2 gap-4'>
												<div className='space-y-2'>
													<Label>Intent</Label>
													<Select
														value={
															keywordForm.watch(
																'intent'
															) || 'informational'
														}
														onValueChange={(v) =>
															keywordForm.setValue(
																'intent',
																v
															)
														}
													>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value='informational'>
																Informational
															</SelectItem>
															<SelectItem value='navigational'>
																Navigational
															</SelectItem>
															<SelectItem value='transactional'>
																Transactional
															</SelectItem>
															<SelectItem value='commercial'>
																Commercial
															</SelectItem>
														</SelectContent>
													</Select>
												</div>
												<div className='space-y-2'>
													<Label>Priority</Label>
													<Select
														value={
															keywordForm.watch(
																'priority'
															) || 'medium'
														}
														onValueChange={(v) =>
															keywordForm.setValue(
																'priority',
																v
															)
														}
													>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value='high'>
																High
															</SelectItem>
															<SelectItem value='medium'>
																Medium
															</SelectItem>
															<SelectItem value='low'>
																Low
															</SelectItem>
														</SelectContent>
													</Select>
												</div>
											</div>
											<div className='space-y-2'>
												<Label>Notes</Label>
												<Textarea
													{...keywordForm.register(
														'notes'
													)}
												/>
											</div>
											<Button
												type='submit'
												className='w-full'
												disabled={isPending}
											>
												Add Keyword
											</Button>
										</form>
									</DialogContent>
								</Dialog>
							</div>
						</div>

						{/* Keywords List */}
						<Card>
							<CardContent className='p-0'>
								<div className='divide-y'>
									{keywords.map((kw) => (
										<div
											key={kw.id}
											className='flex items-center justify-between p-4'
										>
											<div className='flex-1'>
												<div className='flex items-center gap-2'>
													<span className='font-medium'>
														{kw.keyword}
													</span>
													<Badge
														className={getPriorityColor(
															kw.priority
														)}
													>
														{kw.priority}
													</Badge>
													{kw.intent && (
														<Badge variant='outline'>
															{kw.intent}
														</Badge>
													)}
												</div>
												{kw.category && (
													<span className='text-sm text-muted-foreground'>
														{kw.category.name}
													</span>
												)}
											</div>
											<Button
												variant='ghost'
												size='icon'
												onClick={() =>
													handleDeleteKeyword(kw.id)
												}
											>
												<Trash2 className='h-4 w-4' />
											</Button>
										</div>
									))}
									{keywords.length === 0 && (
										<div className='py-8 text-center text-muted-foreground'>
											No keywords yet. Use AI Research or
											add manually!
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Content Plan Tab */}
					<TabsContent
						value='content'
						className='space-y-4'
					>
						<div className='flex items-center justify-between'>
							<h2 className='text-lg font-semibold'>
								Content Pipeline
							</h2>
							<div className='flex gap-2'>
								<Dialog
									open={contentBriefDialogOpen}
									onOpenChange={setContentBriefDialogOpen}
								>
									<DialogTrigger asChild>
										<Button
											variant='outline'
											size='sm'
										>
											<Lightbulb className='mr-2 h-4 w-4' />
											Generate Brief
										</Button>
									</DialogTrigger>
									<DialogContent className='max-h-[80vh] max-w-3xl overflow-y-auto'>
										<DialogHeader>
											<DialogTitle>
												AI Content Brief Generator
											</DialogTitle>
											<DialogDescription>
												Get a detailed content brief for
												your article
											</DialogDescription>
										</DialogHeader>
										<div className='space-y-4'>
											<div className='grid gap-4 sm:grid-cols-2'>
												<div className='space-y-2'>
													<Label>Topic</Label>
													<Input
														value={briefTopic}
														onChange={(e) =>
															setBriefTopic(
																e.target.value
															)
														}
														placeholder='e.g., How to use ChatGPT'
													/>
												</div>
												<div className='space-y-2'>
													<Label>
														Primary Keyword
													</Label>
													<Input
														value={briefKeyword}
														onChange={(e) =>
															setBriefKeyword(
																e.target.value
															)
														}
														placeholder='e.g., chatgpt tutorial'
													/>
												</div>
											</div>
											<Button
												onClick={handleGenerateBrief}
												disabled={aiLoading}
												className='w-full'
											>
												{aiLoading ? (
													<Spinner className='mr-2 h-4 w-4' />
												) : (
													<Sparkles className='mr-2 h-4 w-4' />
												)}
												Generate Brief
											</Button>

											{contentBrief && (
												<div className='space-y-4 rounded-lg border p-4'>
													<div>
														<h4 className='font-semibold'>
															Title
														</h4>
														<p>
															{contentBrief.title}
														</p>
													</div>

													<div className='flex gap-4'>
														<Badge>
															{
																contentBrief.searchIntent
															}
														</Badge>
														<span className='text-sm'>
															Target:{' '}
															{
																contentBrief.targetWordCount
															}{' '}
															words
														</span>
													</div>

													<div>
														<h4 className='font-semibold'>
															Outline
														</h4>
														<div className='mt-2 space-y-2'>
															{contentBrief.outline.map(
																(
																	section,
																	i
																) => (
																	<Collapsible
																		key={i}
																	>
																		<CollapsibleTrigger className='flex w-full items-center justify-between rounded border p-2 hover:bg-gray-50'>
																			<span className='font-medium'>
																				H2:{' '}
																				{
																					section.h2
																				}
																			</span>
																			<ChevronDown className='h-4 w-4' />
																		</CollapsibleTrigger>
																		<CollapsibleContent className='mt-1 space-y-1 pl-4'>
																			{section.h3s?.map(
																				(
																					h3,
																					j
																				) => (
																					<p
																						key={
																							j
																						}
																						className='text-sm'
																					>
																						H3:{' '}
																						{
																							h3
																						}
																					</p>
																				)
																			)}
																			<ul className='list-disc pl-4 text-sm text-muted-foreground'>
																				{section.keyPoints.map(
																					(
																						point,
																						k
																					) => (
																						<li
																							key={
																								k
																							}
																						>
																							{
																								point
																							}
																						</li>
																					)
																				)}
																			</ul>
																		</CollapsibleContent>
																	</Collapsible>
																)
															)}
														</div>
													</div>

													<div>
														<h4 className='font-semibold'>
															Must Include
														</h4>
														<ul className='mt-1 list-disc pl-4 text-sm'>
															{contentBrief.mustInclude.map(
																(item, i) => (
																	<li key={i}>
																		{item}
																	</li>
																)
															)}
														</ul>
													</div>

													<div>
														<h4 className='font-semibold'>
															FAQ Questions
														</h4>
														<ul className='mt-1 list-disc pl-4 text-sm'>
															{contentBrief.faqQuestions.map(
																(q, i) => (
																	<li key={i}>
																		{q}
																	</li>
																)
															)}
														</ul>
													</div>

													<div>
														<h4 className='font-semibold'>
															Unique Angle
														</h4>
														<p className='text-sm'>
															{
																contentBrief.uniqueAngle
															}
														</p>
													</div>

													<Button
														className='w-full'
														onClick={() => {
															contentPlanForm.setValue(
																'title',
																contentBrief.title
															);
															contentPlanForm.setValue(
																'targetKeyword',
																contentBrief.targetKeyword
															);
															contentPlanForm.setValue(
																'notes',
																JSON.stringify(
																	contentBrief.outline,
																	null,
																	2
																)
															);
															setContentBriefDialogOpen(
																false
															);
															setContentPlanDialogOpen(
																true
															);
														}}
													>
														Add to Content Plan
													</Button>
												</div>
											)}
										</div>
									</DialogContent>
								</Dialog>
								<Dialog
									open={contentPlanDialogOpen}
									onOpenChange={setContentPlanDialogOpen}
								>
									<DialogTrigger asChild>
										<Button size='sm'>
											<Plus className='mr-2 h-4 w-4' />
											Add Plan
										</Button>
									</DialogTrigger>
									<DialogContent>
										<DialogHeader>
											<DialogTitle>
												Create Content Plan
											</DialogTitle>
										</DialogHeader>
										<form
											onSubmit={contentPlanForm.handleSubmit(
												handleCreateContentPlan
											)}
											className='space-y-4'
										>
											<div className='space-y-2'>
												<Label>Title</Label>
												<Input
													{...contentPlanForm.register(
														'title'
													)}
												/>
											</div>
											<div className='space-y-2'>
												<Label>Target Keyword</Label>
												<Input
													{...contentPlanForm.register(
														'targetKeyword'
													)}
												/>
											</div>
											<div className='grid grid-cols-2 gap-4'>
												<div className='space-y-2'>
													<Label>Category</Label>
													<Select
														value={
															contentPlanForm.watch(
																'categoryId'
															) || 'none'
														}
														onValueChange={(v) =>
															contentPlanForm.setValue(
																'categoryId',
																v === 'none'
																	? ''
																	: v
															)
														}
													>
														<SelectTrigger>
															<SelectValue placeholder='Select' />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value='none'>
																None
															</SelectItem>
															{categories.map(
																(cat) => (
																	<SelectItem
																		key={
																			cat.id
																		}
																		value={
																			cat.id
																		}
																	>
																		{
																			cat.name
																		}
																	</SelectItem>
																)
															)}
														</SelectContent>
													</Select>
												</div>
												<div className='space-y-2'>
													<Label>Priority</Label>
													<Select
														value={
															contentPlanForm.watch(
																'priority'
															) || 'medium'
														}
														onValueChange={(v) =>
															contentPlanForm.setValue(
																'priority',
																v
															)
														}
													>
														<SelectTrigger>
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value='high'>
																High
															</SelectItem>
															<SelectItem value='medium'>
																Medium
															</SelectItem>
															<SelectItem value='low'>
																Low
															</SelectItem>
														</SelectContent>
													</Select>
												</div>
											</div>
											<div className='space-y-2'>
												<Label>Notes / Outline</Label>
												<Textarea
													{...contentPlanForm.register(
														'notes'
													)}
													rows={4}
												/>
											</div>
											<Button
												type='submit'
												className='w-full'
												disabled={isPending}
											>
												Create Plan
											</Button>
										</form>
									</DialogContent>
								</Dialog>
							</div>
						</div>

						{/* Content Plans by Status */}
						<div className='grid gap-4 lg:grid-cols-4'>
							{['idea', 'planned', 'writing', 'review'].map(
								(status) => (
									<Card key={status}>
										<CardHeader className='pb-2'>
											<CardTitle className='flex items-center gap-2 text-sm capitalize'>
												<Badge
													className={getStatusColor(
														status
													)}
												>
													{status}
												</Badge>
												<span>
													(
													{
														contentPlans.filter(
															(p) =>
																p.status ===
																status
														).length
													}
													)
												</span>
											</CardTitle>
										</CardHeader>
										<CardContent className='space-y-2'>
											{contentPlans
												.filter(
													(p) => p.status === status
												)
												.map((plan) => (
													<div
														key={plan.id}
														className='rounded border bg-white p-2 text-sm'
													>
														<div className='flex items-start justify-between'>
															<span className='font-medium line-clamp-2'>
																{plan.title}
															</span>
															<Button
																variant='ghost'
																size='icon'
																className='h-6 w-6'
																onClick={() =>
																	handleDeleteContentPlan(
																		plan.id
																	)
																}
															>
																<X className='h-3 w-3' />
															</Button>
														</div>
														{plan.targetKeyword && (
															<Badge
																variant='outline'
																className='mt-1 text-xs'
															>
																{
																	plan.targetKeyword
																}
															</Badge>
														)}
														<div className='mt-2 flex flex-col gap-1'>
															{/* AI Action Buttons */}
															{(status ===
																'planned' ||
																status ===
																	'writing') && (
																<Button
																	size='sm'
																	variant='default'
																	className='h-7 w-full text-xs'
																	onClick={() =>
																		handleGenerateDraftFromPlan(
																			plan.id
																		)
																	}
																>
																	✨ Generate
																	Draft
																</Button>
															)}
															{status ===
																'idea' && (
																<Button
																	size='sm'
																	variant='outline'
																	className='h-7 w-full text-xs'
																	onClick={() => {
																		// Generate a brief for this plan's topic
																		toast.info(
																			'Use "Generate Brief" section above to create a brief for: ' +
																				plan.title
																		);
																	}}
																>
																	💡 View in
																	Brief Tool
																</Button>
															)}
															{/* Status Navigation Arrows */}
															<div className='flex gap-1'>
																{status !==
																	'idea' && (
																	<Button
																		size='sm'
																		variant='ghost'
																		className='h-6 px-2 text-xs'
																		onClick={() =>
																			handleUpdateContentPlanStatus(
																				plan.id,
																				status ===
																					'planned'
																					? 'idea'
																					: status ===
																					  'writing'
																					? 'planned'
																					: 'writing'
																			)
																		}
																	>
																		←
																	</Button>
																)}
																{status !==
																	'review' && (
																	<Button
																		size='sm'
																		variant='ghost'
																		className='h-6 px-2 text-xs'
																		onClick={() =>
																			handleUpdateContentPlanStatus(
																				plan.id,
																				status ===
																					'idea'
																					? 'planned'
																					: status ===
																					  'planned'
																					? 'writing'
																					: 'review'
																			)
																		}
																	>
																		→
																	</Button>
																)}
															</div>
														</div>
													</div>
												))}
										</CardContent>
									</Card>
								)
							)}
						</div>
					</TabsContent>

					{/* Posts Tab */}
					<TabsContent
						value='posts'
						className='space-y-4'
					>
						<h2 className='text-lg font-semibold'>
							Post SEO Status
						</h2>
						<Card>
							<CardContent className='p-0'>
								<div className='divide-y'>
									{posts.map((post) => (
										<div
											key={post.id}
											className='flex items-center justify-between p-4'
										>
											<div className='flex-1'>
												<div className='flex items-center gap-2'>
													<Link
														href={`/admin/${
															post.status ===
															'published'
																? 'posts'
																: 'drafts'
														}/${post.id}`}
														className='font-medium hover:underline'
													>
														{post.title}
													</Link>
													<Badge
														variant={
															post.status ===
															'published'
																? 'default'
																: 'secondary'
														}
													>
														{post.status}
													</Badge>
												</div>
												<div className='mt-1 flex flex-wrap gap-2 text-sm'>
													{post.focusKeyword ? (
														<Badge
															variant='outline'
															className='text-green-600'
														>
															✓ Keyword:{' '}
															{post.focusKeyword}
														</Badge>
													) : (
														<Badge
															variant='outline'
															className='text-red-600'
														>
															✗ No keyword
														</Badge>
													)}
													{post.metaDescription ? (
														<Badge
															variant='outline'
															className='text-green-600'
														>
															✓ Meta
														</Badge>
													) : (
														<Badge
															variant='outline'
															className='text-red-600'
														>
															✗ No meta
														</Badge>
													)}
													{post.category ? (
														<Badge
															variant='outline'
															className='text-green-600'
														>
															{post.category.name}
														</Badge>
													) : (
														<Badge
															variant='outline'
															className='text-orange-600'
														>
															No category
														</Badge>
													)}
												</div>
											</div>
											<Select
												value={
													post.categoryId ?? 'none'
												}
												onValueChange={(v) =>
													handleAssignCategory(
														post.id,
														v === 'none' ? null : v
													)
												}
											>
												<SelectTrigger className='w-40'>
													<SelectValue placeholder='Category' />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value='none'>
														None
													</SelectItem>
													{categories.map((cat) => (
														<SelectItem
															key={cat.id}
															value={cat.id}
														>
															{cat.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>

				{/* Weekly Calendar Dialog */}
				<Dialog
					open={calendarDialogOpen}
					onOpenChange={setCalendarDialogOpen}
				>
					<DialogContent className='max-h-[80vh] max-w-4xl overflow-y-auto'>
						<DialogHeader>
							<DialogTitle className='flex items-center justify-between'>
								<span className='flex items-center gap-2'>
									<Calendar className='h-5 w-5' />
									{selectedCalendar?.name ||
										'Weekly Content Calendar'}
								</span>
								{selectedCalendar && (
									<div className='flex items-center gap-2'>
										<Button
											size='sm'
											variant='outline'
											onClick={handleAddAllCalendarToPlan}
											disabled={
												isPending ||
												selectedCalendar.items.filter(
													(i) => !i.isCompleted
												).length === 0
											}
										>
											<Plus className='mr-1 h-4 w-4' />
											Add all to plan
										</Button>
										<Button
											size='sm'
											variant='destructive'
											onClick={() =>
												handleDeleteCalendar(
													selectedCalendar.id
												)
											}
											disabled={isPending}
										>
											<Trash2 className='mr-1 h-4 w-4' />
											Delete
										</Button>
									</div>
								)}
							</DialogTitle>
							<DialogDescription>
								{selectedCalendar ? (
									<>
										{selectedCalendar.items.length} content
										pieces •{' '}
										{
											selectedCalendar.items.filter(
												(i) => i.isCompleted
											).length
										}{' '}
										completed
									</>
								) : (
									'No calendar selected'
								)}
							</DialogDescription>
						</DialogHeader>
						{selectedCalendar && (
							<div className='space-y-4'>
								{/* Progress bar */}
								<div className='space-y-1'>
									<div className='flex justify-between text-sm'>
										<span>Progress</span>
										<span>
											{
												selectedCalendar.items.filter(
													(i) => i.isCompleted
												).length
											}
											/{selectedCalendar.items.length}
										</span>
									</div>
									<div className='h-2 w-full rounded-full bg-gray-200'>
										<div
											className='h-2 rounded-full bg-green-500 transition-all'
											style={{
												width: `${
													selectedCalendar.items
														.length > 0
														? (selectedCalendar.items.filter(
																(i) =>
																	i.isCompleted
														  ).length /
																selectedCalendar
																	.items
																	.length) *
														  100
														: 0
												}%`,
											}}
										/>
									</div>
								</div>

								{[
									'Monday',
									'Tuesday',
									'Wednesday',
									'Thursday',
									'Friday',
									'Saturday',
									'Sunday',
									'Other',
								].map((day) => {
									const dayItems =
										selectedCalendar.items.filter(
											(item) => {
												const normalized =
													normalizeCalendarDay(
														item.day
													);
												if (day === 'Other')
													return normalized === null;
												return normalized === day;
											}
										);
									if (dayItems.length === 0) return null;
									return (
										<div key={day}>
											<h4 className='mb-2 font-semibold'>
												{day}
											</h4>
											<div className='space-y-2'>
												{dayItems.map((item) => (
													<div
														key={item.id}
														className={`flex items-start gap-3 rounded border p-3 transition-colors ${
															item.isCompleted
																? 'border-green-200 bg-green-50'
																: ''
														}`}
													>
														<Checkbox
															checked={
																item.isCompleted
															}
															onCheckedChange={() =>
																handleToggleItemCompletion(
																	item.id
																)
															}
															disabled={isPending}
															className='mt-1'
														/>
														<div className='flex-1'>
															<p
																className={`font-medium ${
																	item.isCompleted
																		? 'text-muted-foreground line-through'
																		: ''
																}`}
															>
																{item.title}
															</p>
															<div className='mt-1 flex flex-wrap gap-2'>
																{item.targetKeyword && (
																	<Badge variant='outline'>
																		{
																			item.targetKeyword
																		}
																	</Badge>
																)}
																{item.contentType && (
																	<Badge variant='secondary'>
																		{
																			item.contentType
																		}
																	</Badge>
																)}
																<Badge
																	className={getPriorityColor(
																		item.priority
																	)}
																>
																	{
																		item.priority
																	}
																</Badge>
																{item.isCompleted && (
																	<Badge
																		variant='outline'
																		className='border-green-500 text-green-600'
																	>
																		<Check className='mr-1 h-3 w-3' />
																		Done
																	</Badge>
																)}
															</div>
															<p className='mt-1 text-xs text-muted-foreground'>
																{item.category}{' '}
																•{' '}
																{
																	item.estimatedTime
																}
															</p>
															{item.notes && (
																<p className='mt-1 text-xs text-muted-foreground'>
																	{item.notes}
																</p>
															)}
														</div>
														{!item.isCompleted && (
															<Button
																size='sm'
																variant='outline'
																onClick={() =>
																	handleAddCalendarToPlan(
																		{
																			day: item.day,
																			title: item.title,
																			targetKeyword:
																				item.targetKeyword ||
																				'',
																			contentType:
																				item.contentType ||
																				'post',
																			category:
																				item.category ||
																				'',
																			priority:
																				item.priority,
																			estimatedTime:
																				item.estimatedTime ||
																				'',
																			notes:
																				item.notes ||
																				'',
																		}
																	)
																}
																disabled={
																	isPending
																}
															>
																<Plus className='mr-1 h-4 w-4' />
																Add to Plan
															</Button>
														)}
													</div>
												))}
											</div>
										</div>
									);
								})}
							</div>
						)}
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
