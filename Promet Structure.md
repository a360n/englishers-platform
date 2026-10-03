Design a complete high-fidelity interactive web app prototype for a new AI content creation platform called **[PROJECT NAME]**.

The platform transforms viral AI image/video trends into one-click personalized experiences.

## PRODUCT CONCEPT

Today, users discover AI trends on Instagram, TikTok, Facebook, and X. To recreate a trend, they often have to:

1. Find the prompt.
2. Open one AI image-generation platform.
3. Upload their photo.
4. Copy and paste a prompt.
5. Download the generated image.
6. Open another AI video platform.
7. Upload the generated image.
8. Copy another prompt.
9. Generate the video.
10. Download and share it.

This is complicated, repetitive, technical, and often requires multiple subscriptions.

Our platform solves this by turning the entire process into a reusable AI workflow.

A Creator/Influencer creates a "Trend Recipe" once. The recipe defines:

* Required user inputs
* User profile variables
* Images
* Prompts
* AI image-generation steps
* AI video-generation steps
* Image editing
* Upscaling
* Conditional logic
* Output format
* Credit cost

The normal user simply:

**Creates an AI Profile → chooses a Trend → clicks Generate → receives the personalized result.**

The user should NEVER need to understand which AI models or providers are used behind the scenes.

The product should feel like a combination of:

* TikTok/Instagram trend discovery
* Canva-like simplicity
* n8n-like workflow creation for creators
* AI generation platform
* Creator marketplace

---

# DESIGN PRINCIPLES

Create a premium, modern, futuristic AI product.

Visual direction:

* Dark-first interface
* Sophisticated
* Minimal
* Premium
* Modern SaaS
* Strong visual hierarchy
* Large media previews
* Rounded cards
* Subtle glassmorphism where appropriate
* Smooth gradients
* High-quality typography
* Excellent spacing
* Strong contrast
* Avoid excessive neon
* Avoid looking like a generic crypto dashboard
* Avoid clutter
* Make generated images/videos the visual focus

Use a professional dark navy/black foundation with subtle electric blue/purple accents.

The UI should feel like a serious technology company, not a toy AI generator.

Create a consistent design system:

* Typography
* Colors
* Buttons
* Inputs
* Cards
* Navigation
* Modals
* Tabs
* Badges
* Status indicators
* Avatars
* Media containers
* Progress indicators
* Workflow nodes

Use realistic sample content and generated-media placeholders.

---

# RESPONSIVE DESIGN

Design the product primarily as a desktop web application, but make the system responsive.

Create:

* Desktop layout
* Tablet considerations
* Mobile-friendly layouts where relevant

The consumer experience should eventually work very well on mobile.

The Creator Workflow Builder can be optimized for desktop.

---

# USER TYPES

The product has three main roles:

## 1. Normal User

A person who wants to use AI trends.

They can:

* Create an AI Profile
* Upload personal photos
* Browse trends
* Search trends
* Follow creators
* Try trends
* Spend credits
* Generate images/videos
* View previous creations
* Download/share results
* Manage subscription and credits

## 2. Creator / Influencer

A creator who publishes AI Trends.

They can:

* Create trends
* Build workflows
* Configure AI steps
* Define required user inputs
* Define prompts
* Use dynamic variables
* Test workflows
* Publish trends
* View analytics
* Earn revenue

## 3. Admin

Platform administrators can:

* Manage users
* Manage creators
* Manage trends
* Moderate content
* Monitor generations
* Manage AI providers
* Monitor costs
* Monitor failures
* Manage credits
* View platform analytics

---

# GLOBAL NAVIGATION

For normal users, create a sidebar or responsive navigation with:

* Home
* Explore
* Following
* My Creations
* Credits
* Profile

At the top/right:

* Search
* Notifications
* User avatar

For creators:

* Dashboard
* My Trends
* Create Trend
* Analytics
* Earnings
* Creator Profile

For admins:

* Dashboard
* Users
* Creators
* Trends
* Generations
* AI Providers
* Credits
* Moderation
* System

---

# SCREEN 01 — LANDING PAGE

Create a premium marketing landing page.

Hero headline:

**Create Viral AI Trends in One Click.**

Supporting text:

"Discover AI trends created by your favorite creators. Build your AI identity once, choose a trend, and get your personalized result automatically."

Primary CTA:

**Explore Trends**

Secondary CTA:

**Become a Creator**

Hero visual:

Show a before → AI workflow → after transformation.

Example:

User Photo → AI Workflow → Cinematic AI Result

Add a small "Try this trend" CTA.

Below the hero:

## How It Works

Four steps:

1. Create your AI Profile
2. Choose a Trend
3. Generate
4. Share

Then show:

## Trending Now

Display 6 realistic trend cards.

Each card should contain:

* Preview image/video
* Trend title
* Creator
* Number of uses
* Image/Video badge
* Credit cost
* Try button

Then:

## For Creators

Explain that creators can turn AI prompts into monetizable workflows.

CTA:

**Create Your First Trend**

Then:

## Why [PROJECT NAME]?

Highlight:

* One-click AI workflows
* No technical knowledge required
* Multiple AI models behind one experience
* Personalized results
* Creator marketplace
* One subscription instead of many AI subscriptions

Finish with footer.

---

# SCREEN 02 — SIGN UP / LOGIN

Create a simple authentication flow.

Options:

* Continue with Google
* Continue with Apple
* Continue with email

Include:

* Login
* Sign up
* Forgot password

After signup, route the user to AI Profile onboarding.

---

# SCREEN 03 — AI PROFILE ONBOARDING

Title:

**Create Your AI Identity**

Subtitle:

"Your AI Identity lets you personalize trends without repeatedly entering the same information."

Progress indicator:

Step 1 of 4

Collect:

* Name
* Age
* Gender
* Height
* Optional basic information

Do not overwhelm the user.

Clearly separate required and optional fields.

CTA:

**Continue**

---

# SCREEN 04 — APPEARANCE PROFILE

Step 2 of onboarding.

Collect or allow AI to infer:

* Hair color
* Hair style
* Eye color
* Skin tone
* Body type
* Other useful appearance information

Include an option:

**Let AI detect from my photos**

Explain that users can edit detected information.

CTA:

**Continue**

---

# SCREEN 05 — UPLOAD PHOTOS

Title:

**Help AI Know You**

Subtitle:

"Use clear, high-quality photos for better results."

Create upload cards:

1. Front Face Photo
2. Side Face Photo
3. Full Body Photo
4. Optional Additional Photo

Each card should show photo guidelines:

* Good lighting
* Clear face
* No sunglasses
* No heavy filters
* High resolution

After upload, show validation:

✓ Face detected
✓ Good lighting
✓ High resolution
✓ Suitable framing

Show:

**AI Profile Quality: 94%**

CTA:

**Create My AI Profile**

---

# SCREEN 06 — AI PROFILE READY

Create a visually impressive success screen.

Headline:

**Your AI Identity is Ready**

Show the user's profile preview.

Show:

* Profile completeness
* Number of usable photos
* Profile quality

Message:

"You can now use your identity across AI trends."

Primary CTA:

**Explore Trends**

Secondary:

**Edit Profile**

---

# SCREEN 07 — HOME

Create the logged-in user homepage.

Top greeting:

**Good evening, Ali**

Hero section:

**What do you want to create today?**

Search bar:

"Search AI trends..."

Then:

## Trending Now

Trend cards.

Then:

## Recommended For You

Personalized trends.

Then:

## From Creators You Follow

Creator-based recommendations.

Then:

## Continue Creating

Recently used trends.

---

# SCREEN 08 — EXPLORE TRENDS

Create a discovery page.

Header:

**Explore Trends**

Large search bar.

Categories:

* Trending
* New
* Image
* Video
* Portrait
* Sci-Fi
* Characters
* Professional
* Travel
* Cars
* Fashion
* Couples
* Cinematic

Add filters:

* Image / Video
* Price
* Popularity
* Newest
* Generation time

Display a responsive grid of trend cards.

Each card:

* Large preview
* Trend name
* Creator
* Uses
* Content type
* Credit cost
* Try Trend button

Do NOT show technical prompts to normal users.

---

# SCREEN 09 — TREND DETAILS

Create a detailed trend page.

Large media preview at the top.

Title example:

**Cinematic Astronaut**

Creator:

@FutureCreator

Statistics:

* 24.5K uses
* 96% generation success rate
* Image → Video
* Approximately 60 seconds

Show:

## Example Result

Large video/image preview.

Show:

## What You Need

* Front face photo
* Full-body photo

Show:

## What Happens

Simple visual workflow:

Your AI Profile
↓
AI Image Generation
↓
Cinematic Animation
↓
Final Enhancement

Do not expose technical provider details.

Show:

**25 Credits**

Primary CTA:

**Try This Trend**

Secondary:

**Save**

Creator section:

Avatar
Creator name
Followers
View Creator

Then:

## Similar Trends

---

# SCREEN 10 — TREND INPUT

After clicking "Try This Trend".

Show a clean generation configuration screen.

Title:

**Cinematic Astronaut**

Show:

**Your AI Profile**

✓ Ready

Required inputs:

✓ Face photo
✓ Full-body photo

If the workflow requires additional choices, show dynamic inputs.

Example:

**Choose your suit**

* NASA
* Futuristic
* Military

**Choose environment**

* Space Station
* Moon
* Mars

Show:

**Cost: 25 Credits**

Primary CTA:

**Generate**

---

# SCREEN 11 — GENERATION PROCESS

Create an immersive processing screen.

Title:

**Creating your trend...**

Show the workflow progress:

✓ Preparing your AI Identity
✓ Preparing your photos
✓ Generating scene
● Creating cinematic motion
○ Final enhancement
○ Preparing result

Show estimated time:

"Usually takes about 60 seconds."

Do not show technical errors or provider names to the normal user.

Include subtle animated/progress visual.

---

# SCREEN 12 — GENERATION RESULT

This is one of the most important screens.

Display the generated image/video prominently.

Title:

**Your creation is ready.**

Show:

Trend name
Creator

Primary actions:

**Download**

**Share**

Secondary:

**Try Again**

**Create Another Trend**

Include sharing options:

* Instagram
* TikTok
* X
* WhatsApp

Add:

**Create another version**

if the workflow supports variations.

---

# SCREEN 13 — MY CREATIONS

Create a personal media library.

Header:

**My Creations**

Tabs:

* All
* Images
* Videos
* Favorites

Grid of generated results.

Each result card contains:

* Preview
* Trend name
* Date
* Content type

Clicking an item opens a detail view with:

* View
* Download
* Share
* Delete
* Try this Trend again

---

# SCREEN 14 — CREDITS

Create a credits management page.

Header:

**Your Credits**

Large balance:

**245 Credits**

Show:

Used this month
180

Remaining
245

CTA:

**Buy Credits**

Then show:

## Credit History

Columns:

* Date
* Activity
* Trend
* Credits
* Status

---

# SCREEN 15 — SUBSCRIPTION

Create pricing/subscription UI.

Plans:

## Free

50 Credits/month

## Creator

500 Credits/month

## Pro

1,500 Credits/month

Each plan should show:

* Monthly credits
* Image generation
* Video generation
* Priority processing
* Storage
* Other relevant benefits

Clearly display:

Current plan

Upgrade

Manage subscription

Do not invent final pricing yet. Use placeholder pricing such as "$—" where necessary.

---

# SCREEN 16 — CREATOR DASHBOARD

Create a completely different creator workspace.

Header:

**Creator Studio**

Overview cards:

* Revenue
* Generations
* Users
* Active Trends

Example:

Revenue
$1,248

Generations
12,842

Users
4,921

Active Trends
8

Then:

## Your Trends

Grid/list of published trends.

Each card:

* Preview
* Name
* Generations
* Revenue
* Status

Primary CTA:

**+ Create Trend**

---

# SCREEN 17 — CREATOR MY TRENDS

Show all creator trends.

Tabs:

* Published
* Drafts
* Archived

Each trend displays:

* Thumbnail
* Name
* Status
* Generations
* Revenue
* Last updated

Actions:

* Edit
* Duplicate
* Analytics
* Archive

---

# SCREEN 18 — CREATE TREND / WORKFLOW BUILDER

This is the most important creator screen.

Design a professional visual workflow builder inspired by tools such as n8n, but simpler and more consumer-friendly.

Desktop layout:

LEFT:
Node Library

CENTER:
Workflow Canvas

RIGHT:
Node Configuration Panel

Top bar:

* Trend name
* Save
* Preview
* Publish

Node Library categories:

## Inputs

* User Photo
* User Profile
* Text
* Choice
* Number

## AI

* Generate Image
* Edit Image
* Generate Video
* Image → Video
* Upscale
* Background Removal
* Face Enhancement
* AI Text

## Logic

* Condition
* Branch
* Combine
* Loop

## Output

* Image
* Video
* Result

Canvas example:

User Profile
↓
User Photo
↓
Generate Image
↓
Quality Check
↓
Image → Video
↓
Upscale
↓
Output

Nodes should be draggable and connectable visually.

---

# SCREEN 19 — NODE CONFIGURATION

When selecting a "Generate Image" node, show:

Node title:

**Generate Image**

Provider:

[Select Provider]

Model:

[Select Model]

Prompt:

Large text area.

Allow dynamic variables.

Example:

{{user.age}}
{{user.gender}}
{{user.height}}
{{user.photo}}

Show a Variables picker.

Example prompt:

"Create a cinematic portrait of {{user.age}} year old {{user.gender}}..."

Output:

* Resolution
* Aspect ratio
* Quality

Show:

**Estimated generation cost: 18 Credits**

Do not require the creator to understand APIs.

---

# SCREEN 20 — USER INPUT CONFIGURATION

Creator can define exactly what the user must provide.

Section:

**Required Inputs**

✓ Face Photo
✓ Full Body Photo

Optional Inputs:

○ Outfit
○ Location
○ Mood
○ Custom Text

Allow the creator to configure each input as:

* Required
* Optional
* Hidden/system generated

Show preview of what the user will see.

---

# SCREEN 21 — WORKFLOW VARIABLES

Create a variable management interface.

Available system variables:

{{user.name}}
{{user.age}}
{{user.gender}}
{{user.height}}
{{user.hair_color}}
{{user.eye_color}}
{{user.photo}}
{{user.full_body_photo}}

Creator can insert variables into prompts using a variable picker.

Make this visually simple.

---

# SCREEN 22 — WORKFLOW PREVIEW

Creator should be able to test the workflow before publishing.

Title:

**Preview Trend**

Allow creator to upload a test user profile/photo.

Show:

Test User

[Upload Test Photos]

Then:

**Run Preview**

Display the workflow execution visually.

Each node shows:

✓ Completed
Time
Cost

Then show the final result.

Buttons:

**Back to Workflow**

**Publish Trend**

---

# SCREEN 23 — PUBLISH TREND

Create a publishing form.

Fields:

Trend Name

Description

Category

Thumbnail

Preview media

Required inputs

Estimated generation time

Credit cost

Creator revenue share

Content type:

* Image
* Video
* Image → Video

Visibility:

* Public
* Unlisted
* Draft

Show a final preview card.

Primary CTA:

**Publish Trend**

---

# SCREEN 24 — CREATOR ANALYTICS

Trend analytics dashboard.

Header:

**Cinematic Astronaut**

Metrics:

* Views
* Unique Users
* Generations
* Success Rate
* Credits Generated
* Creator Revenue

Show charts for:

* Generations over time
* Revenue over time
* Success/failure rate

Show:

**Top Countries**

**Average Generation Time**

**Most Popular User Inputs**

Keep this visually clean.

---

# SCREEN 25 — CREATOR EARNINGS

Show:

Available balance
$842

Pending
$214

Lifetime earnings
$3,421

Revenue history.

Revenue by trend.

Primary CTA:

**Withdraw**

Include payout status and transaction history.

---

# SCREEN 26 — CREATOR PROFILE

Public creator page.

Show:

* Avatar
* Creator name
* Username
* Followers
* Total trends
* Total generations

Bio.

Buttons:

**Follow**

Grid:

**Trending Trends**

Show creator's published trends.

---

# SCREEN 27 — ADMIN DASHBOARD

Create a professional internal admin dashboard.

Navigation:

* Dashboard
* Users
* Creators
* Trends
* Generations
* AI Providers
* Credits
* Moderation
* System

Dashboard metrics:

* Total users
* Active users
* Creators
* Generations today
* Revenue
* AI cost
* Platform margin
* Failed generations

Show charts.

---

# SCREEN 28 — AI PROVIDERS

Admin can manage AI providers.

Provider cards:

Provider Name

Status:

✓ Online
⚠ Rate Limited
✕ Offline

Show:

* Supported capabilities
* Average latency
* Success rate
* Cost per generation
* Current usage

Capabilities:

Image
Video
Upscale
LLM

Include:

**Fallback Provider**

configuration concept.

The UI should communicate that the platform uses an abstraction layer so workflows do not necessarily depend directly on one provider.

---

# SCREEN 29 — GENERATION MONITOR

Admin generation monitoring.

Table columns:

* Generation ID
* User
* Trend
* Workflow
* Provider
* Status
* Duration
* Cost
* Created

Statuses:

Success
Processing
Failed
Cancelled

Clicking a generation opens detailed execution information.

---

# SCREEN 30 — WORKFLOW EXECUTION DETAILS

Show a visual execution trace:

INPUT
↓
USER PROFILE
↓
IMAGE GENERATION
↓
QUALITY CHECK
↓
IMAGE → VIDEO
↓
UPSCALE
↓
OUTPUT

Each node shows:

* Status
* Provider
* Model
* Duration
* Cost
* Error if applicable

This screen is mainly for creators/admins, not normal users.

---

# SCREEN 31 — MODERATION

Admin moderation center.

Tabs:

* Pending
* Approved
* Rejected
* Flagged

Each item shows:

* Creator
* Trend
* Preview
* Category
* Report reason
* Date

Actions:

Approve
Reject
Review
Disable Trend

---

# SCREEN 32 — NOTIFICATIONS

Create a notification center.

Examples:

"Your generation is ready."

"@Creator published a new trend."

"You earned $42 from your trends."

"Your workflow failed a test."

"Your subscription renews soon."

Use notification categories.

---

# SCREEN 33 — SETTINGS

User settings:

Profile

AI Identity

Privacy

Notifications

Subscription

Credits

Security

Connected accounts

Delete account

For AI Identity, clearly explain what personal information/photos are stored and used for.

---

# IMPORTANT UX RULES

## Normal users should NEVER see:

* API keys
* Provider names unless intentionally exposed
* Model technical names
* Prompt engineering complexity
* Workflow node configuration
* Backend errors
* Technical terminology

They should see:

**Choose → Generate → Result**

## Creators should see:

* Workflow nodes
* Variables
* Prompts
* Models
* Providers
* Costs
* Inputs
* Execution status
* Analytics

## Admins should see:

* Infrastructure
* Providers
* Costs
* Failures
* Moderation
* Users
* Generations
* Revenue

---

# IMPORTANT PRODUCT LOGIC

Represent the following flows in the clickable prototype:

### Normal User

Landing
→ Sign Up
→ AI Profile
→ Upload Photos
→ Profile Ready
→ Explore
→ Trend Details
→ Try Trend
→ Configure Inputs
→ Generate
→ Processing
→ Result
→ Share / Download

### Returning User

Login
→ Home
→ Choose Trend
→ Generate
→ Result

The returning user should NOT need to recreate their AI Profile.

### Creator

Creator Dashboard
→ Create Trend
→ Workflow Builder
→ Configure Inputs
→ Configure AI Node
→ Add Variables
→ Preview
→ Test Generation
→ Publish
→ Analytics

### Admin

Admin Dashboard
→ Monitor Generations
→ Manage Providers
→ Moderate Trends
→ Monitor Costs

---

# PROTOTYPE INTERACTIONS

Make the prototype clickable.

Important interactions:

* Navigation works
* Search opens results
* Trend cards open Trend Details
* Try Trend opens generation configuration
* Generate opens Processing
* Processing opens Result
* Result actions open appropriate states
* Creator Dashboard opens Creator Workflow Builder
* Nodes can visually appear selectable
* Selecting a node opens configuration
* Preview opens test generation
* Publish opens published state
* Admin dashboard navigation works

Use realistic transitions and subtle animations.

---

# DESIGN SYSTEM

Create reusable components for:

* Buttons
* Inputs
* Search
* Trend Cards
* Creator Cards
* Media Cards
* Navigation
* Sidebar
* Avatars
* Badges
* Credits
* Status indicators
* Workflow nodes
* Modals
* Toast notifications
* Progress indicators
* Tables
* Charts

Use consistent spacing and typography.

Use a dark navy/black visual foundation with sophisticated blue/purple accents.

Do not overuse gradients.

Prioritize visual content and usability.

---

# CONTENT STYLE

Use concise, modern product language.

Avoid technical jargon for normal users.

Use realistic examples such as:

* Cinematic Astronaut
* F1 Driver
* Cyberpunk City
* Luxury CEO Portrait
* 90s Camera
* Movie Poster
* Anime Character
* Mars Explorer
* Futuristic Soldier
* Street Fashion

Use realistic creator usernames such as:

@FutureCreator
@AICinema
@VisualLab
@PromptMaster

---

# FINAL REQUIREMENT

The goal of this Figma project is NOT to build the actual backend or application.

The goal is to create a **complete interactive product prototype that allows the founder to understand and validate the product logic before engineering begins.**

Do not generate backend code.

Do not generate database code.

Do not generate API code.

Do not implement real AI generation.

Use mock data and realistic placeholder media.

Focus heavily on:

1. User experience
2. Information architecture
3. User flows
4. Creator workflow builder
5. Trend marketplace
6. AI Profile
7. Credits
8. Generation experience
9. Creator monetization
10. Admin monitoring

The final prototype should feel like a real startup product ready for a product/engineering team to use as the basis for writing technical specifications.
