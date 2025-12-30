# Migration Guide - Restructured Codebase

This guide will help you migrate from the old codebase to the new restructured version.

## Prerequisites

1. **Backup your database** (if you have existing data)
2. **Update environment variables** (see below)
3. **Install dependencies** if needed

## Step-by-Step Migration

### 1. Database Migration

The Prisma schema has been updated with new fields. Run the migration:

```bash
# Option A: Create a new migration (recommended for production)
npx prisma migrate dev --name restructure_for_prd

# Option B: Reset database (only for development)
npx prisma migrate reset
```

### 2. Update Environment Variables

Create or update your `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/trendpulse?schema=public"

# OpenAI (Required)
OPENAI_API_KEY="sk-your-key-here"
OPENAI_MODEL="gpt-4o-mini"  # or "gpt-4o" for better quality

# Image Services (At least ONE required)
UNSPLASH_ACCESS_KEY="your-unsplash-access-key"
PEXELS_API_KEY="your-pexels-api-key"

# Admin
ADMIN_PASSWORD="your-secure-admin-password"
ADMIN_SECRET="your-jwt-secret-key-change-in-production"

# Environment
NODE_ENV="development"
```

### 3. Update Imports in Existing Code

If you have custom code that imports from the old structure, update as follows:

#### Database Client

```typescript
// OLD
import { prisma } from '@/lib/db';

// NEW
import { prisma } from '@/lib/prisma/client';
```

#### Admin Session

```typescript
// OLD
import { getTokenFromCookies, verifySessionToken } from '@/lib/adminSession';

// NEW
import { getTokenFromCookies, verifySessionToken } from '@/lib/auth/session';
```

#### OpenAI (if you have custom implementations)

```typescript
// OLD
import { generatePostFromTrend } from '@/lib/openai';

// NEW
import { generateArticleContent } from '@/lib/services/contentGeneration';
import { performWebResearch } from '@/lib/services/webResearch';
```

### 4. Admin Panel Updates

The admin panel now uses the new Server Actions. If you've customized the admin client:

```typescript
// Import new actions
import {
	generateDraftAction,
	publishPostAction,
	deletePostAction,
} from '@/app/actions/admin';

// Use with new response structure
const result = await generateDraftAction({
	trendId: 'trend-id',
	trendTitle: 'Trend Title',
	performResearch: true, // Enable web research
	relatedQueries: ['query 1', 'query 2'], // Optional
});

if (result.success) {
	console.log('Draft created:', result.data);
} else {
	console.error('Error:', result.message, result.errors);
}
```

### 5. Update Admin Client Component

If you've modified `app/admin/_client.tsx`, update the action calls:

```typescript
// Generate draft with new parameters
const handleGenerate = async (trendId: string, trendTitle: string) => {
	const result = await generateDraftAction({
		trendId,
		trendTitle,
		performResearch: true, // Enable OpenAI web research
	});

	if (result.success) {
		toast.success(result.message);
		// Update UI with result.data
	} else {
		toast.error(result.message);
	}
};
```

### 6. Database Schema Changes

Key changes to be aware of:

#### Post Model

-   **Added**: `featuredImageUrl`, `featuredImageAlt`, `featuredImageCredit`
-   **Added**: `metaDescription`
-   **Added**: `updatedAt` (auto-managed)
-   **Changed**: `content` now uses `@db.Text` for longer content
-   **Added**: Indexes for better query performance

#### Trend Model

-   **Added**: Index on `fetchedAt`

#### Job Model

-   **Added**: `createdAt`
-   **Added**: Index on `status`

### 7. API Routes (If You Have Custom Ones)

The restructure moves away from API routes to Server Actions. If you have custom API routes:

#### Convert API Route to Server Action

**Before** (`app/api/my-route/route.ts`):

```typescript
export async function POST(req: Request) {
	const body = await req.json();
	// ... logic
	return Response.json({ success: true });
}
```

**After** (`app/actions/myActions.ts`):

```typescript
'use server';

export async function myAction(input: MyInput) {
	// Validate
	const parsed = mySchema.safeParse(input);
	if (!parsed.success) {
		return {
			success: false,
			message: 'Invalid input',
			errors: parsed.error,
		};
	}

	// Check auth
	if (!(await getSessionValid())) {
		return { success: false, message: 'Unauthorized' };
	}

	// Logic
	try {
		// ... your logic
		return { success: true, message: 'Success', data: result };
	} catch (error) {
		return { success: false, message: 'Error', errors: error };
	}
}
```

### 8. Component Updates

If you have custom components using the old post structure:

```typescript
// Update to handle new image fields
interface PostProps {
	post: {
		// ... existing fields
		featuredImageUrl?: string | null;
		featuredImageAlt?: string | null;
		featuredImageCredit?: string | null;
	};
}

// In component
{
	post.featuredImageUrl && (
		<div>
			<Image
				src={post.featuredImageUrl}
				alt={post.featuredImageAlt || post.title}
				// ...
			/>
			{post.featuredImageCredit && (
				<p className='text-xs text-muted-foreground'>
					{post.featuredImageCredit}
				</p>
			)}
		</div>
	);
}
```

### 9. Testing the Migration

After migration, test these critical flows:

1. **Homepage**

    - Visit `/`
    - Should show published posts with images
    - Pagination should work

2. **Article Page**

    - Visit `/posts/[slug]`
    - Should show full article with image
    - Related posts should appear

3. **Admin Login**

    - Visit `/admin`
    - Login with your admin password
    - Should see dashboard

4. **Generate Draft**

    - Select a trend
    - Click generate
    - Should create draft with research

5. **Publish Post**
    - Select a draft
    - Publish it
    - Should appear on homepage

### 10. Common Issues & Solutions

#### Issue: "Cannot find module '@/lib/db'"

**Solution**: Update import to `@/lib/prisma/client`

#### Issue: "Column 'featuredImageUrl' does not exist"

**Solution**: Run database migration: `npx prisma migrate dev`

#### Issue: "OpenAI API key not configured"

**Solution**: Add `OPENAI_API_KEY` to `.env.local`

#### Issue: "No images showing on posts"

**Solution**:

1. Add `UNSPLASH_ACCESS_KEY` or `PEXELS_API_KEY` to `.env.local`
2. Regenerate drafts to fetch images

#### Issue: "Server Actions not working"

**Solution**: Make sure files start with `'use server';` directive

### 11. Rollback Plan (If Needed)

If you need to rollback:

1. **Database**: Restore from backup

    ```bash
    psql $DATABASE_URL < backup.sql
    ```

2. **Code**: Use git to revert

    ```bash
    git log  # Find commit before restructure
    git revert <commit-hash>
    ```

3. **Dependencies**: Restore old package.json if changed
    ```bash
    git checkout HEAD~1 package.json
    pnpm install
    ```

## What's New and Improved

### New Services

-   ✅ Web research using OpenAI
-   ✅ Structured content generation
-   ✅ Image sourcing with fallback
-   ✅ Proper error handling

### Better UX

-   ✅ Loading skeletons
-   ✅ Error boundaries
-   ✅ Not found pages
-   ✅ Empty states

### Improved Performance

-   ✅ Database indexes
-   ✅ Optimized queries
-   ✅ Server Components by default

### Better Code Quality

-   ✅ Type safety with Zod
-   ✅ Separation of concerns
-   ✅ Reusable services
-   ✅ Clear folder structure

## Support

If you encounter issues during migration:

1. Check the [RESTRUCTURE_SUMMARY.md](RESTRUCTURE_SUMMARY.md) for architecture details
2. Review [docs/PRD.md](docs/PRD.md) for product requirements
3. Check environment variables are correctly set
4. Verify database migration completed successfully

## Post-Migration Checklist

-   [ ] Database migrated successfully
-   [ ] Environment variables configured
-   [ ] Dependencies installed
-   [ ] Homepage loads correctly
-   [ ] Article pages render properly
-   [ ] Admin panel accessible
-   [ ] Can generate new drafts
-   [ ] Can publish posts
-   [ ] Images display correctly
-   [ ] All error states work
-   [ ] All loading states work

## Next Steps

After successful migration:

1. **Generate new content** using the improved pipeline
2. **Review existing posts** for missing images
3. **Configure image API keys** for better quality
4. **Set up monitoring** for errors
5. **Review admin workflows** for efficiency

---

**Migration Complete!** 🎉

Your codebase is now fully restructured and aligned with the PRD.
