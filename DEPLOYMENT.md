# Craft MVP - Deployment Guide

This guide covers environment configuration and deployment for the Craft AI-native project management platform.

## Environment Configuration

### 1. Local Development

1. Copy the environment template:
   ```bash
   cp env.example .env.local
   ```

2. Fill in your environment variables in `.env.local`:
   - **Supabase**: Create a project at [supabase.com](https://supabase.com)
   - **OpenRouter**: Get unified AI API key from [openrouter.ai](https://openrouter.ai)

### Get Required API Keys

**Supabase** (Database & Auth):
1. Go to [supabase.com](https://supabase.com) → Create new project
2. Go to Project Settings → API
3. Copy `URL` and `anon public` key to your `.env.local`
4. Copy `service_role` key (keep this secret!)

**OpenRouter** (Unified AI Access):
1. Go to [openrouter.ai](https://openrouter.ai) → Create account
2. Go to [Keys](https://openrouter.ai/keys) → Create API key  
3. Copy to `OPENROUTER_API_KEY` in your `.env.local`
4. (Optional) Set `OPENROUTER_APP_NAME=Craft MVP` for app identification

3. Start the development server:
   ```bash
   npm run dev
   ```

### 2. Production Environment Variables

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJ0eXAiOiJKV1QiLCJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJ0eXAiOiJKV1QiLCJhbGc...` |
| `OPENROUTER_API_KEY` | OpenRouter unified AI API key | `sk-or-v1-...` |
| `NEXTAUTH_SECRET` | NextAuth.js secret | Random 32-character string |
| `NEXTAUTH_URL` | Application URL | `https://craft.yourdomain.com` |

#### Optional Integration Variables

| Variable | Description | Required For |
|----------|-------------|--------------|
| `GMAIL_CLIENT_ID` | Gmail OAuth client ID | Email parsing |
| `GMAIL_CLIENT_SECRET` | Gmail OAuth secret | Email parsing |
| `SLACK_BOT_TOKEN` | Slack bot token | Slack integration |
| `SLACK_SIGNING_SECRET` | Slack signing secret | Slack integration |

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides the best experience for Next.js applications with automatic deployments and optimizations.

#### Setup Steps

1. **Connect Repository**
   - Link your GitHub repository to Vercel
   - Vercel will automatically detect Next.js and configure build settings

2. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all required variables from your `.env.local`
   - Set different values for Preview and Production environments

3. **Configure Domains**
   - Add your custom domain in Project Settings → Domains
   - Configure DNS records as instructed

4. **Enable GitHub Integration**
   - Automatic deployments on push to main branch
   - Preview deployments for pull requests
   - Automatic rollbacks if needed

#### Vercel Configuration

The project includes `vercel.json` with optimized settings:
- API routes have 30-second timeout
- CORS headers for API access
- Cron jobs for daily briefings (8 AM weekdays)

### Option 2: Docker Deployment

For self-hosted or cloud deployments using Docker.

#### Create Dockerfile

```dockerfile
FROM node:20-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Build the app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  craft:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
      # Add other environment variables
    restart: unless-stopped
```

### Option 3: Railway

Railway offers simple deployments with automatic SSL and domains.

1. Connect your GitHub repository
2. Configure environment variables
3. Railway automatically deploys on git push

## CI/CD Pipeline

### GitHub Actions Workflow

The project includes a comprehensive GitHub Actions workflow (`.github/workflows/deploy.yml`) that:

1. **Tests**: Runs linting, type checking, and unit tests
2. **Builds**: Creates production build with environment variables
3. **Deploys**: 
   - Preview deployments for pull requests
   - Production deployment for main branch
   - Development deployment for development branch

### Required GitHub Secrets

Configure these secrets in your GitHub repository:

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel CLI token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `NEXT_PUBLIC_APP_URL` | Production app URL |

## Environment-Specific Configurations

### Development
- Enable debug logging
- Use development API endpoints
- Relaxed CORS policies
- Hot reloading enabled

### Staging/Preview
- Production-like environment
- Test integrations with sandbox APIs
- Performance monitoring
- Limited rate limiting

### Production
- Optimized builds
- Production API endpoints
- Strict security headers
- Full rate limiting
- Error tracking and monitoring

## Monitoring and Maintenance

### Health Checks

The application includes health check endpoints:
- `/api/health` - Basic health check
- `/api/health/database` - Database connectivity
- `/api/health/ai` - AI service availability

### Logging

Configure logging based on environment:
- Development: Console logging with debug level
- Production: Structured JSON logging
- Error tracking with services like Sentry

### Performance Monitoring

- Next.js built-in analytics
- Core Web Vitals tracking
- API response time monitoring
- Database query performance

## Security Considerations

### Environment Variables
- Never commit `.env*` files to repository
- Use different secrets for each environment
- Rotate API keys regularly
- Use environment-specific database instances

### Security Headers
- Configured in `next.config.ts`
- CSRF protection
- XSS protection
- Content Security Policy

### Rate Limiting
- AI API calls are rate-limited
- User-specific rate limiting
- Cost control mechanisms

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check environment variables are set
   - Verify API keys are valid
   - Ensure TypeScript compilation passes

2. **Runtime Errors**
   - Check database connectivity
   - Verify AI API quotas
   - Review logs for specific errors

3. **Performance Issues**
   - Monitor API response times
   - Check database query performance
   - Review AI model usage patterns

### Support

- Check GitHub Issues for known problems
- Review deployment logs in Vercel dashboard
- Monitor application health endpoints 