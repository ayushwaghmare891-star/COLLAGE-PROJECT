import { useState } from 'react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertTriangleIcon } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountDialog({ isOpen, onClose }: DeleteAccountDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    if (confirmText !== 'DELETE') {
      toast({
        title: "Confirmation failed",
        description: "Please type DELETE to confirm",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setLoading(false);

    toast({
      title: "Account deleted",
      description: "Your account has been permanently deleted",
    });

    logout();
    navigate('/login');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card text-card-foreground border-border sm:max-w-md">
        <DialogHeader>
          <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <AlertTriangleIcon className="w-6 h-6 text-destructive" strokeWidth={2} />
          </div>
          <DialogTitle className="text-h3 text-card-foreground text-center">Delete Account</DialogTitle>
          <DialogDescription className="text-muted-foreground text-center">
            This action cannot be undone. All your data will be permanently deleted.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleDelete} className="space-y-4 mt-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-2">
            <p className="text-small font-semibold text-destructive">Warning:</p>
            <ul className="text-small text-muted-foreground space-y-1 list-disc list-inside">
              <li>All your personal data will be deleted</li>
              <li>Your discount history will be lost</li>
              <li>This action is irreversible</li>
            </ul>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-delete" className="text-foreground">
              Type <span className="font-bold text-destructive">DELETE</span> to confirm
            </Label>
            <input
              id="confirm-delete"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              required
              className="w-full px-4 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-neutral text-neutral-foreground border-border hover:bg-muted hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || confirmText !== 'DELETE'}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? 'Deleting...' : 'Delete Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

