# 🎭 Demo Mode

Demo mode lets you see the Hot Wheels Alerts app working with sample data, even before you configure the real APIs!

## Quick Start with Demo Mode

### Option 1: Run Everything with Demo Mode

```bash
npm run dev:demo
```

This will:
- Start the backend with demo mode enabled (port 5001)
- Start the frontend (port 3000)
- Show sample Hot Wheels products from all platforms

### Option 2: Run Backend Only with Demo Mode

```bash
npm run start:demo
```

Then in another terminal:
```bash
npm run client
```

## What Demo Mode Shows

Demo mode displays sample Hot Wheels products:
- **Blinkit**: 2 sample products
- **Zepto**: 1 sample product  
- **Swiggy Instamart**: 2 sample products

You'll see a yellow banner at the top indicating demo mode is active.

## Why Use Demo Mode?

1. **Test the UI** - See how the app looks and works
2. **Verify Setup** - Make sure everything is installed correctly
3. **Show Functionality** - Demonstrate features before configuring APIs
4. **Development** - Work on the frontend without needing real API access

## Switching to Real APIs

When you're ready to use real APIs:

1. Configure the APIs (see `CAPTURE_APIS.md`)
2. Stop the demo server
3. Run without demo mode:
   ```bash
   npm run dev
   ```

Or set `DEMO_MODE=false` or just don't set it (it defaults to false).

## Environment Variables

You can also set demo mode using environment variables:

```bash
# Enable demo mode
export DEMO_MODE=true
npm start

# Or in a .env file
DEMO_MODE=true
PORT=5001
```

Enjoy testing with demo mode! 🔥🚗

