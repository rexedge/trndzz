# Content Pipeline Guide

## Overview

The SEO Command Center includes a **Content Pipeline** that helps you move content ideas through different stages of production. Each column represents a stage in your content creation workflow.

---

## Pipeline Stages

### 🌟 Idea Stage

**What to do:**

-   Brainstorm content topics
-   Collect trend-based ideas from Google Trends or your calendar
-   Capture initial thoughts and notes

**AI Help Available:**

-   **"View in Brief Tool"** button: Reminds you to use the "Generate Content Brief" section at the top to research and create a detailed brief for this topic
-   Use the AI Brief generator to get: outline, key points, research sources, and SEO recommendations

**Next Step:** Move to "Planned" when you're ready to structure the content

---

### 📋 Planned Stage

**What to do:**

-   Review and refine your content outline
-   Set target keywords and categories
-   Schedule writing time
-   Gather research materials

**AI Help Available:**

-   **"✨ Generate Draft"** button: Instantly creates and saves a complete article draft including:
    -   SEO-optimized title
    -   URL-friendly slug
    -   Engaging excerpt
    -   Full article content (1200+ words)
    -   Relevant tags
    -   Featured image prompt for AI image generation

**How it works:**

1. Click "Generate Draft" on any planned item
2. AI researches the topic using web search
3. Generates a complete article in your chosen tone
4. **Automatically saves as a draft post** in the database
5. Redirects you to the draft editor to review and publish

**Next Step:** The draft is automatically saved - you'll be redirected to edit it

---

### ✍️ Writing Stage

**What to do:**

-   Actually write your content (or use the AI draft as a starting point)
-   Add images, videos, and formatting
-   Refine tone and style
-   Check word count and SEO elements

**AI Help Available:**

-   **"✨ Generate Draft"** button: Same as "Planned" stage - generates and saves a complete draft if you haven't done so yet
-   Useful if you need a fresh start or want to compare different angles
-   Draft is automatically saved to the database

**Next Step:** Move to "Review" when first draft is complete

---

### 🔍 Review Stage

**What to do:**

-   Proofread for grammar and spelling
-   Check SEO optimization (keywords, meta tags, headings)
-   Verify all links and images work
-   Get feedback from team members if needed
-   Make final edits

**AI Help Available:**

-   Currently: Draft is automatically saved when generated
-   Future: AI-powered content critique and optimization suggestions

**Final Step:** Publish when everything looks perfect!

---

## Tips for Using the Pipeline

### Batch Processing

-   Use the **"Add all to plan"** button in the Calendar dialog to quickly move multiple content ideas into the pipeline at once
-   All incomplete calendar items get added to the "idea" stage

### Navigation

-   Use **←** and **→** buttons on each card to move items between stages
-   Delete items you no longer need with the **X** button

### AI-Powered Workflow

The recommended workflow with AI assistance:

1. **Generate Calendar** → Get a week's worth of trend-based content ideas
2. **Add all to plan** → Move them to the "idea" stage
3. **Generate Brief** (optional) → Research and outline each topic
4. **Move to "Planned"** → When you're ready to write
5. **Generate Draft** → AI creates and saves a complete article as a draft in seconds
6. **Review & Edit** → Polish the draft in the draft editor
7. **Publish** → Go live with confidence!

---

## What the AI Draft Includes

When you click "Generate Draft", the AI creates:

### Title

SEO-optimized, attention-grabbing headline

### Slug

URL-friendly version of the title (e.g., "how-to-use-ai-content-tools")

### Excerpt

Engaging summary (150-160 characters) perfect for meta descriptions and social shares

### Content

Full article (1200+ words by default) with:

-   Introduction
-   Multiple sections with clear headings
-   Actionable insights
-   Nigerian context when relevant
-   Natural keyword integration
-   Strong conclusion

### Tags

3-5 relevant tags for categorization and SEO

### Featured Image Prompt

AI-ready description you can use with DALL-E or other image generators

---

## Pipeline Stats

Track your progress at a glance:

-   **Content Pipeline**: Total items in planning stages (idea + planned + writing + review)
-   See live counts update as you move items through stages

---

## Best Practices

✅ **Do:**

-   Start with the calendar generator for trending topics
-   Use AI drafts as a foundation, not final copy
-   Review and add your unique voice and expertise
-   Keep items moving through the pipeline regularly

❌ **Don't:**

-   Leave items stuck in one stage for too long
-   Publish AI content without review and editing
-   Skip the research step for important topics
-   Forget to optimize for your specific audience

---

## Environment Variables

To see detailed AI request/response logs (useful for debugging):

```bash
AI_DEBUG_LOG=true
```

Add this to your `.env` file to enable console logging of all AI operations.

---

**Happy content creating! 🚀**
