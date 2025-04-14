import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

interface MainHeaderProps {
  title: string;
  onAddClick: () => void;
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
}

export function MainHeader({ 
  title, 
  onAddClick,
  searchPlaceholder = "Search...",
  onSearch
}: MainHeaderProps) {
  return (
    <header className="bg-white shadow border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-blue-900">{title}</h1>
          
          <div className="flex space-x-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-blue-400" />
              </div>
              <Input 
                type="text" 
                placeholder={searchPlaceholder} 
                className="pl-10 pr-3 py-2 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                onChange={(e) => onSearch && onSearch(e.target.value)}
              />
            </div>
            
            <Button onClick={onAddClick} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-5 w-5 mr-2" />
              Add Shift
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
