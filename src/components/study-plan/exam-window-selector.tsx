'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Check, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getExamWindows, ExamWindowData } from '@/app/actions/exam-window';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';

interface ExamWindowSelectorProps {
    currentSelectedDate: Date | null;
    onSelect: (date: Date, label: string) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ExamWindowSelector({ currentSelectedDate, onSelect, open, onOpenChange }: ExamWindowSelectorProps) {
    const [windows, setWindows] = useState<ExamWindowData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedWindow, setSelectedWindow] = useState<ExamWindowData | null>(null);

    useEffect(() => {
        if (open) {
            setLoading(true);
            getExamWindows()
                .then(data => {
                    setWindows(data);
                    // Pre-select the card that matches currentSelectedDate
                    if (currentSelectedDate) {
                        const selectedTime = new Date(currentSelectedDate).getTime();
                        const match = data.find(w =>
                            Math.abs(new Date(w.startDate).getTime() - selectedTime) < 86400000
                        );
                        if (match) setSelectedWindow(match);
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [open, currentSelectedDate]);

    const handleCardClick = (window: ExamWindowData) => {
        if (!window.isActive) return;
        setSelectedWindow(window);
    };

    const handleConfirm = () => {
        if (!selectedWindow) return;

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const d = new Date(selectedWindow.startDate);
        const label = `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;

        onSelect(d, label);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Select Exam Window</DialogTitle>
                    <DialogDescription>
                        Choose your target CFA exam session.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading exam schedules...</div>
                    ) : windows.length === 0 ? (
                        <div className="text-center py-8 text-amber-500">No upcoming exam windows found.</div>
                    ) : (
                        windows.map((window) => {
                            const isSelected = selectedWindow?.id === window.id;

                            return (
                                <div
                                    key={window.id}
                                    onClick={() => handleCardClick(window)}
                                    className={cn(
                                        "relative flex items-center space-x-4 rounded-xl border p-4 transition-all",
                                        window.isActive
                                            ? "cursor-pointer hover:bg-accent hover:text-accent-foreground hover:border-amber-500/50"
                                            : "opacity-60 bg-muted/50 cursor-not-allowed",
                                        isSelected ? "border-amber-500 bg-amber-500/10" : "border-border"
                                    )}
                                >
                                    <div className={cn(
                                        "p-3 rounded-full",
                                        window.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                    )}>
                                        <CalendarIcon className="h-6 w-6" />
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium leading-none">
                                                {window.sessionName}
                                            </p>
                                            {!window.isActive && (
                                                <Badge variant="secondary" className="text-xs h-5 px-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/10">
                                                    Closed
                                                </Badge>
                                            )}
                                            {isSelected && (
                                                <Badge variant="default" className="text-xs h-5 px-1.5 bg-amber-500 hover:bg-amber-600">
                                                    Selected
                                                </Badge>
                                            )}
                                        </div>

                                        <p className="text-sm text-muted-foreground">
                                            Exam Window: {format(new Date(window.startDate), 'MMM d')} - {format(new Date(window.endDate), 'MMM d, yyyy')}
                                        </p>
                                    </div>

                                    {isSelected && (
                                        <div className="text-amber-600">
                                            <Check className="h-5 w-5" />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!selectedWindow}
                        className={cn(selectedWindow ? "bg-amber-500 hover:bg-amber-600 text-white" : "")}
                    >
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
