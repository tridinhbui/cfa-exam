import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://cfa-exam.vercel.app';

    // Các trang tĩnh chính
    const staticPages = [
        '',
        '/pricing',
        '/login',
        '/register',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return [...staticPages];
}
