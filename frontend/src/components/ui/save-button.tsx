import { BookmarkIcon } from 'lucide-react';
import { Button } from './button';
import { useSavedStore, SavedItem } from '../../stores/savedStore';
import { useToast } from '../../hooks/use-toast';

interface SaveButtonProps {
  item: SavedItem;
  className?: string;
  showText?: boolean;
}

export function SaveButton({ item, className = '', showText = true }: SaveButtonProps) {
  const { addSavedItem, removeSavedItem, isSaved } = useSavedStore();
  const { toast } = useToast();
  const saved = isSaved(item.id);

  const handleToggleSave = () => {
    if (saved) {
      removeSavedItem(item.id);
      toast({
        title: 'Removed',
        description: `${item.brand} removed from saved`,
      });
    } else {
      addSavedItem(item);
      toast({
        title: 'Saved!',
        description: `${item.brand} added to your saved deals`,
      });
    }
  };

  return (
    <Button
      onClick={handleToggleSave}
      variant={saved ? 'default' : 'outline'}
      size="sm"
      className={className}
    >
      <BookmarkIcon
        className={`w-4 h-4 ${showText ? 'mr-2' : ''} ${saved ? 'fill-current' : ''}`}
      />
      {showText && (saved ? 'Saved' : 'Save')}
    </Button>
  );
}
