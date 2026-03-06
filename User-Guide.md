# GravBlog User Guide

Welcome to GravBlog! This guide will explain everything you need to know to use your new blog application effectively, whether you are a reader or an administrator.

## 1. User Roles and Access (RBAC)

GravBlog has a strict Role-Based Access Control (RBAC) system to keep your content secure.

### Regular Users
- **What they can do:** 
  - Read published blog posts.
  - Search for content using the advanced Semantic Search.
  - View their user profile.
- **What they CANNOT do:** 
  - Create, edit, or delete posts, categories, or tags.
  - Access the Admin Dashboard. The "Write" and "Dashboard" buttons are securely hidden from their view.

### Administrators
- **What they can do:**
  - Everything a regular user can do.
  - Access the **Admin Dashboard** to view statistics.
  - **Create, edit, and delete** blog posts.
  - Manage **Categories** and **Tags**.
- **How to become an Admin:**
  - By default, new users sign up as regular `USER`s. To make someone an `ADMIN`, their role must be manually updated in the database by the database administrator.

## 2. Navigating the Site

### The Header
- **Home / Blog / Categories / About:** Links to browse content.
- **Search Icon (Magnifying Glass):** Opens the search bar. Try searching for abstract concepts instead of exact words!
- **Write / Dashboard (Admins Only):** Quick links to authoring tools.
- **Profile Picture:** Click this to go to your **Profile Page**, where you can see your account details and **Sign Out**.
- **Sun/Moon Icon:** Toggles between Light and Dark mode.

### The Profile Page
- Click your avatar in the top right corner.
- Here you can see your Name, Email, and your current Role (e.g., `USER` or `ADMIN`).
- Click the red **Sign Out** button at the bottom to log out of your account safely.

## 3. Creating Content (Admins Only)

1. Click the **Write** button in the header (or go to **Dashboard -> New Post**).
2. **Title:** Give your post a catchy title.
3. **Slug:** The URL path for your post (e.g., `my-awesome-post`). This must be unique!
4. **Content:** Write your blog post using the editor.
5. **Excerpt & Cover Image:** Add a short summary and an image URL to make your post look great on the home page.
6. **Publishing:** Toggle "Published" to make it visible to readers. If left unchecked, it remains a draft.
7. **Save:** When you save, GravBlog's AI will automatically read your post and generate a invisible "concept vector" so it can be found via Semantic Search!

## 4. Semantic Search

GravBlog doesn't just look for matching words; it understands *meaning*.
- If you write a post about "Tailwind CSS", a user can search for "How to style a website" and still find your post.
- Just click the Search icon in the header, type your question or concept, and press Enter.

## 5. Mobile Experience
GravBlog is fully responsive. On mobile devices (phones/tablets):
- The navigation links move into a "Hamburger Menu" (three lines) on the top right.
- You can access your Dashboard, Write buttons, and the **Sign Out** button directly from this mobile menu.
