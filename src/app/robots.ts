import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/dashboard/'], // Chặn Google cào dữ liệu trong Dashboard riêng tư và API
        },
        sitemap: 'https://cfa-exam.vercel.app/sitemap.xml',
    };
}
