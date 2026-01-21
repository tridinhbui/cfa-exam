'use client';

import { useEffect, useRef } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useAuth } from '@/context/auth-context';
import { useUserStore } from '@/store/user-store';

export function OnboardingTour() {
    const { user } = useAuth();
    const { user: dbUser, setUser } = useUserStore();
    const hasStartedTour = useRef(false);

    useEffect(() => {
        if (!user || !dbUser || dbUser.hasCompletedOnboarding || hasStartedTour.current) {
            return;
        }

        hasStartedTour.current = true;

        const driverObj = driver({
            showProgress: true,
            animate: true,
            overlayColor: 'rgba(0, 0, 0, 0.75)',
            steps: [
                {
                    element: '#tour-dashboard',
                    popover: {
                        title: 'Dashboard',
                        description: 'Your central hub for tracking progress, streaks, and quick stats.',
                        side: 'right',
                        align: 'start'
                    }
                },
                {
                    element: '#tour-lessons',
                    popover: {
                        title: 'Lessons',
                        description: 'Access complete curriculum modules, readings, and study materials.',
                        side: 'right',
                        align: 'start'
                    }
                },
                {
                    element: '#tour-mistakes',
                    popover: {
                        title: 'Mistakes Bank',
                        description: 'Review questions you missed and turn failures into mastery.',
                        side: 'right',
                        align: 'start'
                    }
                },
                {
                    element: '#tour-quiz',
                    popover: {
                        title: 'Practice Quiz',
                        description: 'Generate customized practice sessions by topic, difficulty, or time mode.',
                        side: 'right',
                        align: 'start'
                    }
                },
                {
                    element: '#tour-item-sets',
                    popover: {
                        title: 'Item Sets',
                        description: 'Practice complex scenario-based questions typical of the CFA exam.',
                        side: 'right',
                        align: 'start'
                    }
                },
                {
                    element: '#tour-analytics',
                    popover: {
                        title: 'Analytics',
                        description: 'Dive deep into your performance trends and identify areas for improvement.',
                        side: 'right',
                        align: 'start'
                    }
                },
                {
                    element: '#tour-study-plan',
                    popover: {
                        title: 'Study Plan',
                        description: 'Follow your structured path to exam day with weekly goals and tasks.',
                        side: 'right',
                        align: 'start'
                    }
                },
                {
                    element: '#tour-global-chat',
                    popover: {
                        title: 'AI Study Assistant',
                        description: 'Stuck on a difficult concept? Click here to chat with our advanced AI mentor anytime for instant explanations.',
                        side: 'left',
                        align: 'end'
                    }
                },
            ],
            onDestroyStarted: async () => {
                // If user skips or completes, mark as finished
                try {
                    const token = await user.getIdToken();
                    await fetch('/api/user/onboarding', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            hasCompletedOnboarding: true
                        })
                    });

                    // Update local store to prevent re-triggering
                    if (dbUser) {
                        setUser({ ...dbUser, hasCompletedOnboarding: true });
                    }
                } catch (err) {
                    console.error('Failed to update onboarding status:', err);
                }
                driverObj.destroy();
            }
        });

        driverObj.drive();
    }, [user, dbUser, setUser]);

    return null;
}
