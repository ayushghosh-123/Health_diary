'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  BookOpen, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  FileText,
  Tag,
  Heart,
  Lock,
  Globe
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { dbHelpers, type Journal, type JournalEntry } from '@/lib/supabase';
import { useToast } from '@/components/hooks/use-toast';

interface JournalManagerProps {
  userId: string;
  onSelectJournal: (journal: Journal) => void;
  onSelectEntry: (entry: JournalEntry) => void;
  className?: string;
}

export function JournalManager({ 
  userId, 
  onSelectJournal, 
  onSelectEntry,
  className 
}: JournalManagerProps) {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateJournal, setShowCreateJournal] = useState(false);
  const [showCreateEntry, setShowCreateEntry] = useState(false);
  const { toast } = useToast();

  // Form states
  const [journalTitle, setJournalTitle] = useState('');
  const [journalDescription, setJournalDescription] = useState('');
  const [journalColor, setJournalColor] = useState('#6366f1');
  const [entryTitle, setEntryTitle] = useState('');
  const [entryContent, setEntryContent] = useState('');
  const [entryMood, setEntryMood] = useState<'excellent' | 'good' | 'neutral' | 'poor' | 'terrible'>('neutral');
  const [entryTags, setEntryTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
    '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#84cc16'
  ];

  useEffect(() => {
    loadJournals();
  }, [userId]);

  useEffect(() => {
    if (selectedJournal) {
      loadJournalEntries(selectedJournal.id);
    }
  }, [selectedJournal]);

  const loadJournals = async () => {
    try {
      setLoading(true);
      const { data, error } = await dbHelpers.getUserJournals(userId);
      if (error) throw error;
      setJournals(data || []);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load journals.',
        variant: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadJournalEntries = async (journalId: string) => {
    try {
      const { data, error } = await dbHelpers.getJournalEntries(journalId);
      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load journal entries.',
        variant: 'error'
      });
    }
  };

  const createJournal = async () => {
    if (!journalTitle.trim()) return;

    try {
      const { data, error } = await dbHelpers.createJournal({
        user_id: userId,
        title: journalTitle,
        description: journalDescription,
        color: journalColor,
        is_public: false
      });

      if (error) throw error;

      setJournals(prev => [data, ...prev]);
      setJournalTitle('');
      setJournalDescription('');
      setJournalColor('#6366f1');
      setShowCreateJournal(false);

      toast({
        title: 'Success',
        description: 'Journal created successfully!',
        variant: 'default'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create journal.',
        variant: 'error'
      });
    }
  };

  const createEntry = async () => {
    if (!entryContent.trim() || !selectedJournal) return;

    try {
      const { data, error } = await dbHelpers.createJournalEntry({
        journal_id: selectedJournal.id,
        user_id: userId,
        title: entryTitle,
        content: entryContent,
        mood: entryMood,
        tags: entryTags,
        is_private: true
      });

      if (error) throw error;

      setEntries(prev => [data, ...prev]);
      setEntryTitle('');
      setEntryContent('');
      setEntryMood('neutral');
      setEntryTags([]);
      setShowCreateEntry(false);

      toast({
        title: 'Success',
        description: 'Journal entry created successfully!',
        variant: 'default'
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to create journal entry.',
        variant: 'error'
      });
    }
  };

  const addTag = () => {
    if (newTag.trim() && !entryTags.includes(newTag.trim())) {
      setEntryTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEntryTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const getMoodColor = (mood: string) => {
    const colors = {
      excellent: 'bg-green-100 text-green-800 border-green-200',
      good: 'bg-blue-100 text-blue-800 border-blue-200',
      neutral: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      poor: 'bg-orange-100 text-orange-800 border-orange-200',
      terrible: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[mood as keyof typeof colors] || colors.neutral;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading journals...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Journals</h2>
          <p className="text-slate-600">Organize your thoughts and experiences</p>
        </div>
        <Button 
          onClick={() => setShowCreateJournal(true)}
          className="bg-rose-600 hover:bg-rose-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Journal
        </Button>
      </div>

      {/* Create Journal Modal */}
      {showCreateJournal && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Journal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="journal-title">Journal Title</Label>
              <Input
                id="journal-title"
                value={journalTitle}
                onChange={(e) => setJournalTitle(e.target.value)}
                placeholder="My Personal Journal"
              />
            </div>
            <div>
              <Label htmlFor="journal-description">Description (Optional)</Label>
              <Textarea
                id="journal-description"
                value={journalDescription}
                onChange={(e) => setJournalDescription(e.target.value)}
                placeholder="What is this journal for?"
                rows={3}
              />
            </div>
            <div>
              <Label>Journal Color</Label>
              <div className="flex gap-2 mt-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setJournalColor(color)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2",
                      journalColor === color ? "border-slate-400" : "border-slate-200"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowCreateJournal(false)}>
                Cancel
              </Button>
              <Button onClick={createJournal} className="bg-rose-600 hover:bg-rose-700">
                Create Journal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Journals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {journals.map((journal) => (
          <Card 
            key={journal.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setSelectedJournal(journal);
              onSelectJournal(journal);
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: journal.color }}
                  />
                  <CardTitle className="text-lg">{journal.title}</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  {journal.is_public ? (
                    <Globe className="h-4 w-4 text-green-600" />
                  ) : (
                    <Lock className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              </div>
              {journal.description && (
                <p className="text-sm text-slate-600">{journal.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-slate-500">
                <span>Created {format(new Date(journal.created_at), 'MMM d, yyyy')}</span>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>0 entries</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Journal Entries */}
      {selectedJournal && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: selectedJournal.color }}
                />
                <div>
                  <CardTitle>{selectedJournal.title}</CardTitle>
                  <p className="text-sm text-slate-600">{selectedJournal.description}</p>
                </div>
              </div>
              <Button 
                onClick={() => setShowCreateEntry(true)}
                className="bg-rose-600 hover:bg-rose-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">No entries yet</p>
                <p className="text-sm text-slate-400">Start writing your first entry</p>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <Card 
                    key={entry.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onSelectEntry(entry)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CardTitle className="text-lg">
                            {entry.title || 'Untitled Entry'}
                          </CardTitle>
                          {entry.mood && (
                            <Badge variant="outline" className={getMoodColor(entry.mood)}>
                              {entry.mood}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(entry.created_at), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-700 line-clamp-3 mb-3">
                        {entry.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>{entry.word_count} words</span>
                          <span>{entry.reading_time} min read</span>
                        </div>
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex gap-1">
                            {entry.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {entry.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{entry.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Entry Modal */}
      {showCreateEntry && selectedJournal && (
        <Card>
          <CardHeader>
            <CardTitle>New Journal Entry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="entry-title">Entry Title (Optional)</Label>
              <Input
                id="entry-title"
                value={entryTitle}
                onChange={(e) => setEntryTitle(e.target.value)}
                placeholder="Today's thoughts..."
              />
            </div>
            <div>
              <Label htmlFor="entry-content">Content</Label>
              <Textarea
                id="entry-content"
                value={entryContent}
                onChange={(e) => setEntryContent(e.target.value)}
                placeholder="Write your thoughts, feelings, and experiences..."
                rows={8}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="entry-mood">Mood</Label>
                <select
                  id="entry-mood"
                  value={entryMood}
                  onChange={(e) => setEntryMood(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-md"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="neutral">Neutral</option>
                  <option value="poor">Poor</option>
                  <option value="terrible">Terrible</option>
                </select>
              </div>
              <div>
                <Label htmlFor="entry-tags">Tags</Label>
                <div className="flex gap-2">
                  <Input
                    id="entry-tags"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag..."
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} size="sm">Add</Button>
                </div>
                {entryTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entryTags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="cursor-pointer"
                        onClick={() => removeTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowCreateEntry(false)}>
                Cancel
              </Button>
              <Button onClick={createEntry} className="bg-rose-600 hover:bg-rose-700">
                Create Entry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
