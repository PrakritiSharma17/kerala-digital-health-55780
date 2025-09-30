import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  MessageCircle, 
  User, 
  LogOut, 
  Menu,
  Heart,
  Bell,
  Globe
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const { user, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const navigation = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'appointments', label: t('nav.appointments'), icon: Calendar },
    { id: 'records', label: t('nav.records'), icon: FileText },
    { id: 'chat', label: t('nav.chat'), icon: MessageCircle },
    { id: 'profile', label: t('nav.profile'), icon: User },
  ];

  const handleNavClick = (pageId: string) => {
    onPageChange(pageId);
    setIsSheetOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsSheetOpen(false);
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-4 border-b">
        <Heart className="h-6 w-6 text-primary" />
        <span className="font-bold text-lg">{t('app.title')}</span>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={currentPage === item.id ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => handleNavClick(item.id)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ml">മലയാളം</SelectItem>
              <SelectItem value="hi">हिंदी</SelectItem>
              <SelectItem value="ta">தமிழ்</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span className="truncate">{user?.name}</span>
        </div>
        
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          {t('nav.logout')}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
          <div className="flex h-16 items-center justify-between px-4">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80">
                <NavContent />
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              <span className="font-bold">{t('app.title')}</span>
            </div>
            
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </header>
        
        <main className="pb-4">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 border-r bg-card shadow-sm">
        <NavContent />
      </aside>
      
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-40 w-full border-b bg-card shadow-sm">
          <div className="flex h-16 items-center justify-between px-6">
            <h1 className="text-xl font-semibold">
              {navigation.find(nav => nav.id === currentPage)?.label || t('nav.dashboard')}
            </h1>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span>{user?.name}</span>
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}