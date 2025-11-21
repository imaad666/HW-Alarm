const puppeteer = require('puppeteer');
const UserAgent = require('user-agents');

class BrowserManager {
    constructor() {
        this.sessions = new Map(); // sessionId -> { browser, pages: { blinkit, zepto, swiggy } }
    }

    async initSession(sessionId) {
        if (this.sessions.has(sessionId)) {
            return this.sessions.get(sessionId);
        }

        console.log(`Initializing session: ${sessionId}`);
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-blink-features=AutomationControlled',
                '--window-size=1920,1080',
                '--ignore-certificate-errors'
            ]
        });

        const session = {
            browser,
            pages: {},
            locationSet: { blinkit: false, zepto: false, swiggy: false }
        };

        this.sessions.set(sessionId, session);
        return session;
    }

    async getPage(sessionId, platform) {
        const session = await this.initSession(sessionId);

        if (!session.pages[platform]) {
            const page = await session.browser.newPage();
            await page.setViewport({ width: 1920, height: 1080 });
            await page.setUserAgent(new UserAgent({ deviceCategory: 'desktop' }).toString());

            // Stealth scripts
            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
                window.navigator.permissions.query = (parameters) => (
                    parameters.name === 'notifications' ?
                        Promise.resolve({ state: Notification.permission }) :
                        window.navigator.permissions.query(parameters)
                );
            });

            session.pages[platform] = page;
        }

        return session.pages[platform];
    }

    async closeSession(sessionId) {
        if (this.sessions.has(sessionId)) {
            const session = this.sessions.get(sessionId);
            await session.browser.close();
            this.sessions.delete(sessionId);
            console.log(`Closed session: ${sessionId}`);
        }
    }
}

module.exports = new BrowserManager();
