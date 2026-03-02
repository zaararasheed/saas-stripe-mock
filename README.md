# Velvety Analytics
Production Ready Subscription Architecture
Velvety Analytics is a fully deployed SaaS subscription infrastructure built to demonstrate a stable, production grade billing and access control system using Stripe and Firebase.
This project focuses on subscription architecture, not UI demos.
Overview
This system implements a complete subscription lifecycle including authentication, billing, webhook handling, and tier based access enforcement.
It is designed to simulate how a real SaaS product manages recurring payments and protected feature access.
Live deployment includes frontend on Netlify and backend on Render.
Tech Stack
Frontend
* React with Vite
* TypeScript
Backend
* Bun runtime
* Express with TypeScript
Infrastructure
* Stripe Subscriptions
* Stripe Webhooks
* Firebase Authentication
* Firestore database
Core Features
* Secure Firebase authentication with token verification
* Stripe Checkout in subscription mode
* Webhook driven subscription state synchronization
* Plan upgrades and downgrades
* Subscription cancellation handling
* Tier based feature gating Free Basic Pro
* Protected backend routes
* Production deployment configuration
Subscription Flow
User authenticates via Firebase
User selects subscription plan
Stripe Checkout session is created
Webhook events validate and update Firestore
Plan state is enforced on protected routes
Dashboard reflects real time subscription status
All subscription state changes are validated server side.
Deployment
Frontend
Deployed on Netlify
Backend
Deployed on Render
Environment variables securely configured for Stripe and Firebase.
Purpose
This repository demonstrates:
* Clean subscription architecture
* Reliable webhook handling
* Safe upgrade and downgrade logic
* Production ready structure
It is structured to reflect how real SaaS billing systems should be implemented.
