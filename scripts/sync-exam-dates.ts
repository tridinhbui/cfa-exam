
import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting exam date sync...');

    let browser = null;
    try {
        // Launch standard Puppeteer (works great in GitHub Actions environment)
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
        });

        const page = await browser.newPage();
        console.log('Browser launched, navigating to CFA site...');

        // Navigate to CFA Website
        await page.goto('https://www.cfainstitute.org/programs/cfa-program/dates-fees', {
            waitUntil: 'networkidle2',
            timeout: 60000,
        });

        console.log('Page loaded, extracting data...');

        // Scrape Data - FULL AUTOMATION INTERACTION
        // 1. Select Level I
        const levelSelectSelector = 'select[aria-label="Exam Level"]';
        await page.waitForSelector(levelSelectSelector, { timeout: 10000 });
        await page.select(levelSelectSelector, 'Level I');
        console.log('Selected Level I');

        // 2. Wait for Exam Period dropdown to populate
        const periodSelectSelector = 'select[aria-label="Exam Period"]';
        await page.waitForFunction(
            (selector) => {
                const select = document.querySelector(selector) as HTMLSelectElement;
                return select && select.options.length > 1;
            },
            { timeout: 10000 },
            periodSelectSelector
        );
        console.log('Exam Period dropdown populated');

        // 3. Get all available 2026 options
        const options = await page.evaluate((selector) => {
            const select = document.querySelector(selector) as HTMLSelectElement;
            return Array.from(select.options)
                .map(opt => ({ text: opt.text, value: opt.value }))
                .filter(opt => opt.text.includes('2026'));
        }, periodSelectSelector);

        console.log(`Found ${options.length} options for 2026:`, options.map(o => o.text));

        const results: any[] = [];

        // 4. Iterate and scrape each option
        for (const option of options) {
            console.log(`Processing: ${option.text}`);

            // Select the option
            await page.select(periodSelectSelector, option.value);

            // Wait for dynamic content to update. 
            // We look for a container that changes. The text "CFA Program Exam Dates" is distinct.
            // We wait for a specific element that appears in the timeline for the selected date.
            try {
                // Simple wait for network idle or a short pause to allow React/Angular to render
                await new Promise(r => setTimeout(r, 2000));

                // Check if registration is closed
                // Logic: Look for the specific alert text shown in the screenshot
                const isClosed = await page.evaluate(() => {
                    const text = document.body.innerText;
                    return text.includes('exam registration is closed') ||
                        text.includes('Registration is closed') ||
                        text.includes('Please choose another exam period');
                });

                console.log(`  -> Status: ${isClosed ? 'CLOSED' : 'OPEN'}`);

                // Extract dates
                const dates = await page.evaluate(() => {
                    // Strategy: Locate "CFA Program Exam Dates" and find the date associated with it
                    // Based on screenshot: Date is to the left of the label

                    let dateText = '';

                    // Try to find the label element
                    // Use XPath to find the text
                    const xpathResult = document.evaluate(
                        "//*[contains(text(), 'CFA Program Exam Dates')]",
                        document,
                        null,
                        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
                        null
                    );

                    if (xpathResult.snapshotLength > 0) {
                        // Usually the last one is the visible one in the dynamics list, or we check bounding box
                        // Let's assume the last one corresponds to the active view if multiple exist
                        const labelEl = xpathResult.snapshotItem(xpathResult.snapshotLength - 1) as HTMLElement;

                        // Look at siblings or parent's text
                        // The structure is likely: <div class="row"> <div class="date">2 - 8 Feb</div> <div class="label">CFA Program Exam Dates</div> </div>
                        if (labelEl) {
                            // Option A: Check Previous Sibling
                            let sibling = labelEl.previousElementSibling;
                            while (sibling) {
                                if (sibling.textContent && sibling.textContent.trim().length > 0) {
                                    dateText += ' ' + sibling.textContent;
                                }
                                sibling = sibling.previousElementSibling;
                            }

                            // Option B: Check Parent text (if they are in same span/div)
                            if (labelEl.parentElement) {
                                dateText += ' ' + labelEl.parentElement.innerText;
                            }
                        }
                    } else {
                        // Fallback to body text if label not found
                        dateText = document.body.innerText;
                    }

                    // Clean up text
                    dateText = dateText.replace(/\s+/g, ' ');

                    // Regex to parse "2 - 8 Feb" or "Feb 2 - 8" or "May 12 - 18"
                    // Supports: "2 - 8 Feb", "Feb 2-8", "May 12-18", "12-18 May"
                    // Note: The screenshot showed "2 - 8 Feb". 

                    // Pattern 1: DD - DD Month (e.g. "2 - 8 Feb")
                    const dayMonthRegex = /(\d{1,2})\s*[^0-9a-zA-Z]+\s*(\d{1,2})\s+([a-zA-Z]+)/;
                    const match1 = dateText.match(dayMonthRegex);

                    // Pattern 2: Month DD - DD (e.g. "Feb 2 - 8")
                    const monthDayRegex = /([a-zA-Z]+)\s+(\d{1,2})\s*[^0-9a-zA-Z]+\s*(\d{1,2})/;
                    const match2 = dateText.match(monthDayRegex);

                    // Pattern 3: Cross Month (e.g. "May 28 – June 3")
                    const complexRegex = /([a-zA-Z]+)\s+(\d{1,2})\s*[^0-9a-zA-Z]+\s*([a-zA-Z]+)\s+(\d{1,2})/;
                    const complexMatch = dateText.match(complexRegex);

                    // We need to pass the year of the OPTION being processed, but here we can just default to '2026' 
                    // since we filtered options by '2026'. Or pass it in.
                    // let's rely on hardcoded 2026 for now as we are strictly looking for 2026 options.
                    const year = '2026';

                    if (complexMatch) {
                        const [_, m1, d1, m2, d2] = complexMatch;
                        return { start: `${year}-${m1}-${d1}`, end: `${year}-${m2}-${d2}` };
                    }

                    if (match1) {
                        // DD - DD Month -> "2 - 8 Feb"
                        const [_, d1, d2, m] = match1;
                        return { start: `${year}-${m}-${d1}`, end: `${year}-${m}-${d2}` };
                    }

                    if (match2) {
                        // Month DD - DD -> "Feb 2 - 8"
                        const [_, m, d1, d2] = match2;
                        return { start: `${year}-${m}-${d1}`, end: `${year}-${m}-${d2}` };
                    }

                    return null;
                });

                if (dates) {
                    // Convert to ISO (using Node context to parse properly)
                    const startDate = new Date(dates.start).toISOString();
                    const endDate = new Date(dates.end).toISOString();

                    results.push({
                        sessionName: option.text,
                        startDate: startDate,
                        endDate: endDate,
                        isActive: !isClosed // If closed, set isActive = false
                    });
                    console.log(`  -> Scraped: ${dates.start} to ${dates.end}`);
                } else {
                    console.log(`  -> No dates found for ${option.text}`);
                }

            } catch (e) {
                console.error(`  -> Failed to scrape ${option.text}:`, e);
            }
        }

        const examWindows = results;

        // Fallback if automation failed completely (e.g. selector changed)
        if (examWindows.length === 0) {
            console.log("Automation returned 0 results. Using Fallback.");
            // ... fallback logic (optional, but requested to keep 2026) ...
            return [
                { sessionName: 'February 2020', startDate: '2026-02-17', endDate: '2026-02-23' },
                { sessionName: 'May 2020', startDate: '2026-05-20', endDate: '2026-05-26' },
                { sessionName: 'August 2020', startDate: '2026-08-20', endDate: '2026-08-26' },
                { sessionName: 'November 2020', startDate: '2026-11-20', endDate: '2026-11-26' }
            ];
        }

        console.log(`Found ${examWindows.length} exam windows.`);

        // Save to Database
        for (const window of examWindows) {
            await prisma.examWindow.upsert({
                where: { sessionName: window.sessionName },
                update: {
                    startDate: new Date(window.startDate),
                    endDate: new Date(window.endDate),
                    updatedAt: new Date(),
                    isActive: window.isActive ?? true
                },
                create: {
                    id: crypto.randomUUID(),
                    sessionName: window.sessionName,
                    startDate: new Date(window.startDate),
                    endDate: new Date(window.endDate),
                    isActive: window.isActive ?? true
                },
            });
            console.log(`Synced: ${window.sessionName}`);
        }

        console.log('Sync completed successfully.');

    } catch (error) {
        console.error('Scraping failed:', error);
        process.exit(1);
    } finally {
        if (browser) {
            await browser.close();
        }
        await prisma.$disconnect();
    }
}

main();
