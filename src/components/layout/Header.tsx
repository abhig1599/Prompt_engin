'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle, User, Trash2 } from 'lucide-react';

export default function Header() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'all';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-surface-canvas/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Logo.svg" alt="PromptBoard Logo" className="h-8" />
        </Link>

        {/* Nav Pill */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-card p-1 rounded-full border border-border/50">
          <Link
            href="/?type=all"
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              type === 'all'
                ? 'bg-obsidian text-chalk shadow-sm'
                : 'text-obsidian hover:bg-black/5'
            }`}
          >
            All
          </Link>
          <Link
            href="/prompts"
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              type === 'prompt'
                ? 'bg-obsidian text-chalk shadow-sm'
                : 'text-obsidian hover:bg-black/5'
            }`}
          >
            Prompts
          </Link>
          <Link
            href="/tools"
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              type === 'tool'
                ? 'bg-obsidian text-chalk shadow-sm'
                : 'text-obsidian hover:bg-black/5'
            }`}
          >
            Tools
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full text-obsidian hidden sm:flex">
            <Trash2 className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon" className="rounded-full text-obsidian">
            <User className="h-5 w-5" />
          </Button>

          <Button className="rounded-full bg-surface-feature text-chalk hover:bg-surface-feature/90 px-6 font-display tracking-widest uppercase">
            <PlusCircle className="mr-2 h-4 w-4" />
            Submit
          </Button>
        </div>
      </div>
    </header>
  );
}
