'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Book as BookIcon,
  ChevronRight,
  BookOpen,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/auth-context';

interface Module {
  id: string;
  code: string;
  title: string;
  order: number;
}

interface Reading {
  id: string;
  code: string;
  title: string;
  order: number;
  modules: Module[];
}

interface Book {
  id: string;
  title: string;
  description: string | null;
  level: string | null;
  readings: Reading[];
}

function ItemSetsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedReading, setSelectedReading] = useState<Reading | null>(null);
  const [loading, setLoading] = useState(true);
  const [visibleReadingsCount, setVisibleReadingsCount] = useState(8);

  const readingId = searchParams.get('readingId');
  const bookId = searchParams.get('bookId');

  useEffect(() => {
    async function fetchBooks() {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const response = await fetch('/api/books', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        setBooks(data);

        if (bookId) {
          const book = data.find((b: Book) => b.id === bookId);
          if (book) {
            setSelectedBook(book);
            if (readingId) {
              const reading = book.readings.find((r: Reading) => r.id === readingId);
              if (reading) setSelectedReading(reading);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch books:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, [user, bookId, readingId]);

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setVisibleReadingsCount(8); // Reset count when book changes
    router.push(`/item-sets?bookId=${book.id}`, { scroll: false });
  };

  const handleSelectReading = (reading: Reading) => {
    setSelectedReading(reading);
    if (selectedBook) {
      router.push(`/item-sets?bookId=${selectedBook.id}&readingId=${reading.id}`, { scroll: false });
    }
  };

  const handleBack = () => {
    if (selectedReading) {
      setSelectedReading(null);
      router.push(`/item-sets?bookId=${selectedBook?.id}`, { scroll: false });
    } else {
      setSelectedBook(null);
      setVisibleReadingsCount(8); // Reset count when going back to books
      router.push('/item-sets', { scroll: false });
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        {selectedBook && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-foreground"
          >
            {selectedReading
              ? selectedReading.title
              : selectedBook
                ? selectedBook.title
                : 'Study Materials'}
          </motion.h1>
          <p className="text-muted-foreground mt-1 text-lg">
            {selectedReading
              ? `Reviewing ${selectedReading.modules.length} modules for this reading`
              : selectedBook
                ? `Exploring ${selectedBook.readings.length} readings from this curriculum`
                : 'Choose a textbook or item set to start your study session'
            }
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!selectedBook ? (
          <motion.div
            key="books-grid"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {books.map((book) => (
              <Card key={book.id} className="overflow-hidden hover:border-primary/50 transition-all group border-2 border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="h-32 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 flex items-center justify-center border-b border-border/50">
                    <div className="p-4 rounded-full bg-background/50 backdrop-blur-md shadow-xl">
                      <BookIcon className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="font-bold border-primary text-primary px-3 py-1 bg-primary/5">
                          {book.level?.replace('_', ' ') || 'CFA LEVEL'}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {book.readings.length} Readings
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                        {book.title}
                      </h3>
                    </div>

                    <p className="text-muted-foreground text-sm line-clamp-3 min-h-[3.75rem]">
                      {book.description || 'Access complete readings and curriculum materials for this level.'}
                    </p>

                    <Button
                      className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all rounded-xl"
                      onClick={() => handleSelectBook(book)}
                    >
                      Study Now
                      <ChevronRight className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        ) : !selectedReading ? (
          <div className="space-y-10">
            <motion.div
              key="readings-grid"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {selectedBook.readings.slice(0, visibleReadingsCount).map((reading: Reading, index: number) => (
                <motion.div
                  key={reading.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => handleSelectReading(reading)}
                >
                  <Card className="h-full hover:bg-muted/30 transition-colors border border-border/60 hover:border-primary/40 group cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardContent className="p-5 flex flex-col justify-between h-full">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20 shadow-sm shadow-primary/5">
                            Reading {reading.order}
                          </span>
                          {reading.modules.length > 0 && (
                            <span className="text-[10px] text-muted-foreground font-semibold">
                              {reading.modules.length} MODULES
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-base leading-snug group-hover:text-primary transition-colors">
                          {reading.title}
                        </h4>
                      </div>

                      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {reading.code}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-0.5" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {visibleReadingsCount < selectedBook.readings.length && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setVisibleReadingsCount(prev => prev + 8)}
                  className="px-12 py-6 rounded-2xl border-2 border-primary/20 hover:border-primary/50 hover:bg-primary/5 text-primary font-bold transition-all shadow-xl shadow-primary/5"
                >
                  Load More Readings
                  <ChevronRight className="h-5 w-5 ml-2 rotate-90" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <motion.div
            key="modules-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid sm:grid-cols-1 md:grid-cols-2 gap-4"
          >
            {selectedReading.modules.map((module: Module, index: number) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => window.location.href = `/item-sets/module/${module.id}/quiz`}
              >
                <Card className="hover:bg-muted/30 transition-all border border-border/60 hover:border-indigo-500/40 group cursor-pointer relative overflow-hidden bg-gradient-to-r from-transparent to-transparent hover:to-indigo-500/5">
                  <CardContent className="p-6 flex items-center gap-6">
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
                      <span className="text-sm font-black text-indigo-500 tracking-tighter">
                        M {module.code}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          Module {module.code}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-lg leading-tight group-hover:text-indigo-400 transition-colors">
                        {module.title}
                      </h4>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-sm">
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            {selectedReading.modules.length === 0 && (
              <div className="col-span-full py-12 text-center">
                <p className="text-muted-foreground">No modules found for this reading. Check back soon!</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ItemSetsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ItemSetsContent />
    </Suspense>
  );
}
