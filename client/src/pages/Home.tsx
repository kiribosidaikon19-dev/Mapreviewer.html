import { useState } from "react";
import { useLocations } from "@/hooks/use-locations";
import { LocationMap } from "@/components/LocationMap";
import { LocationSidebar } from "@/components/LocationSidebar";
import { AddLocationDialog } from "@/components/AddLocationDialog";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Loader2, LogIn, LogOut, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function Home() {
  const { data: locations = [], isLoading } = useLocations();
  const { user, isAuthenticated, logout, login, isLoggingIn } = useAuth();
  
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLocationCoords, setNewLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [username, setUsername] = useState("");

  const handleLocationSelect = (id: number) => {
    setSelectedLocationId(id);
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (!isAuthenticated) {
      setIsLoginDialogOpen(true);
      return;
    }
    setNewLocationCoords({ lat, lng });
    setIsAddDialogOpen(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    await login(username);
    setIsLoginDialogOpen(false);
    setUsername("");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground font-medium animate-pulse">地図を読み込んでいます...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative overflow-hidden flex flex-col">
      {/* Navbar Overlay */}
      <div className="absolute top-0 left-0 w-full z-[400] pointer-events-none p-4 flex justify-between items-start">
        {/* Logo / Brand */}
        <div className="pointer-events-auto bg-background/80 backdrop-blur-md border border-border/50 rounded-2xl shadow-lg px-6 py-3">
          <h1 className="text-xl md:text-2xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            マップレビュー
          </h1>
          <p className="text-xs text-muted-foreground hidden md:block">
            隠れた名所を見つけて共有しましょう
          </p>
        </div>

        {/* User Menu */}
        <div className="pointer-events-auto">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="rounded-full pl-2 pr-4 h-12 shadow-lg border-border/50">
                  <Avatar className="h-8 w-8 mr-2 border border-border">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium hidden sm:inline-block">
                    {user?.username}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>アカウント設定</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>ログアウト</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={() => setIsLoginDialogOpen(true)}
              className="rounded-full h-12 px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
            >
              <LogIn className="mr-2 h-4 w-4" />
              サインイン
            </Button>
          )}
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 relative z-0">
        <LocationMap 
          locations={locations}
          selectedLocationId={selectedLocationId}
          onSelectLocation={handleLocationSelect}
          onAddLocationClick={handleMapClick}
        />
      </div>

      {/* Sidebar Overlay */}
      {selectedLocationId && (
        <LocationSidebar 
          locationId={selectedLocationId} 
          onClose={() => setSelectedLocationId(null)} 
        />
      )}

      {/* Add Location Dialog */}
      <AddLocationDialog 
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        coordinates={newLocationCoords}
      />

      {/* Login Dialog */}
      <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>サインイン</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">ユーザー名</label>
              <Input 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ユーザー名を入力してください"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              ログイン
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
