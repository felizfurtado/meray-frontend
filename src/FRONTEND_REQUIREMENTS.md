# Frontend Requirements – Meray CRM

## Overview
This frontend is built using React with Vite, designed to work with a
multi-tenant Django backend (django-tenants) using JWT authentication
and subdomain-based tenant resolution.

---

## Core Technologies

| Tool | Purpose | Version |
|----|-------|--------|
| Node.js | JavaScript runtime | >= 18.x |
| Vite | Build tool & dev server | ^5.x |
| React | UI library | **18.2.0** |
| React DOM | React renderer | **18.2.0** |
| React Router DOM | Client-side routing | **6.22.3** |
| Axios | HTTP client | ^1.x |

---

## Authentication & Architecture

- JWT-based authentication (access + refresh tokens)
- Multi-tenant support via subdomain (e.g. `bigco.localhost`)
- Global auth state using React Context API
- Protected routes using `RequireAuth`
- Automatic token refresh using Axios interceptors

---

## Required NPM Packages

```bash
npm install \
react@18.2.0 \
react-dom@18.2.0 \
react-router-dom@6.22.3 \
axios

npm install recharts