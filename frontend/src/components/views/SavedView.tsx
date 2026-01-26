import { useEffect } from 'react';
import { BookmarkIcon, TrashIcon, CalendarIcon, TagIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useSavedStore } from '../../stores/savedStore';
import { useToast } from '../../hooks/use-toast';

export function SavedView() {
  const { savedItems, removeSavedItem, clearAllSaved } = useSavedStore();
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleRemove = (id: string, title: string) => {
    removeSavedItem(id);
    toast({
      title: 'Removed',
      description: `${title} removed from saved items`,
    });
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all saved items?')) {
      clearAllSaved();
      toast({
        title: 'Cleared',
        description: 'All saved items have been removed',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-4">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookmarkIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Saved Deals
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            {savedItems.length} {savedItems.length === 1 ? 'deal' : 'deals'} saved
          </p>
        </div>

        {/* Clear All Button */}
        {savedItems.length > 0 && (
          <div className="mb-6 flex justify-end">
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-700"
            >
              Clear All
            </Button>
          </div>
        )}

        {/* Empty State */}
        {savedItems.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="pt-12 text-center">
              <BookmarkIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2">No saved deals yet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Start saving deals to see them here. Saved deals are stored locally in your browser.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedItems.map((item) => (
              <Card
                key={item.id}
                className="hover:shadow-lg transition-shadow overflow-hidden group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{item.brand}</CardTitle>
                      <CardDescription className="mt-1">{item.title}</CardDescription>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id, item.brand)}
                      className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                      title="Remove from saved"
                    >
                      <TrashIcon className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Discount Badge */}
                  <div className="inline-block px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold rounded-full">
                    {item.discount}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {item.description}
                  </p>

                  {/* Metadata */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <TagIcon className="w-4 h-4" />
                      <span>{item.category}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CalendarIcon className="w-4 h-4" />
                      <span>
                        {item.expiryDays === 1
                          ? 'Expires today'
                          : `Expires in ${item.expiryDays} days`}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-500 pt-2">
                      Saved on {formatDate(item.savedAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Storage Info */}
        <div className="mt-12 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-semibold">💾 Local Storage:</span> Your saved deals are stored
            locally in your browser and will persist even after you close it.
          </p>
        </div>
      </div>
    </div>
  );
}
