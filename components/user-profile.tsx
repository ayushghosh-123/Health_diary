'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  User, 
  Edit, 
  Save, 
  X, 
  Heart, 
  Target, 
  Calendar,
  TrendingUp,
  Award,
  Activity,
  Moon,
  Brain,
  Droplets
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import type { HealthEntry } from '@/lib/supabase';

interface UserProfileProps {
  entries: HealthEntry[];
}

interface UserHealthProfile {
  id: string;
  name: string;
  email: string;
  age?: number;
  height?: number;
  weight?: number;
  healthGoals: string[];
  medicalConditions: string[];
  medications: string[];
  emergencyContact: string;
  doctorInfo: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export function UserProfile({ entries }: UserProfileProps) {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserHealthProfile>({
    id: user?.id || '',
    name: user?.firstName || '',
    email: user?.emailAddresses[0]?.emailAddress || '',
    age: undefined,
    height: undefined,
    weight: undefined,
    healthGoals: [],
    medicalConditions: [],
    medications: [],
    emergencyContact: '',
    doctorInfo: '',
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [newGoal, setNewGoal] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');

  // Calculate health metrics
  const calculateHealthMetrics = () => {
    if (entries.length === 0) return null;

    const last30Days = entries.slice(0, 30);
    const moodValues = { excellent: 5, good: 4, neutral: 3, poor: 2, terrible: 1 };
    const avgMood = last30Days.reduce((sum, entry) => 
      sum + (moodValues[entry.mood as keyof typeof moodValues] || 3), 0) / last30Days.length;
    
    const avgSleep = last30Days.reduce((sum, entry) => sum + entry.sleep_hours, 0) / last30Days.length;
    const totalExercise = last30Days.reduce((sum, entry) => sum + entry.exercise_minutes, 0);
    const avgWater = last30Days.reduce((sum, entry) => sum + entry.water_intake, 0) / last30Days.length;

    return {
      avgMood: avgMood.toFixed(1),
      avgSleep: avgSleep.toFixed(1),
      totalExercise,
      avgWater: avgWater.toFixed(1),
      totalEntries: entries.length,
      streak: calculateStreak()
    };
  };

  const calculateStreak = () => {
    if (entries.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < entries.length; i++) {
      const entryDate = new Date(entries[i].entry_date);
      entryDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const healthMetrics = calculateHealthMetrics();

  const handleSave = () => {
    // Here you would save to your database
    console.log('Saving profile:', profile);
    setIsEditing(false);
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setProfile(prev => ({
        ...prev,
        healthGoals: [...prev.healthGoals, newGoal.trim()]
      }));
      setNewGoal('');
    }
  };

  const removeGoal = (index: number) => {
    setProfile(prev => ({
      ...prev,
      healthGoals: prev.healthGoals.filter((_, i) => i !== index)
    }));
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setProfile(prev => ({
        ...prev,
        medicalConditions: [...prev.medicalConditions, newCondition.trim()]
      }));
      setNewCondition('');
    }
  };

  const removeCondition = (index: number) => {
    setProfile(prev => ({
      ...prev,
      medicalConditions: prev.medicalConditions.filter((_, i) => i !== index)
    }));
  };

  const addMedication = () => {
    if (newMedication.trim()) {
      setProfile(prev => ({
        ...prev,
        medications: [...prev.medications, newMedication.trim()]
      }));
      setNewMedication('');
    }
  };

  const removeMedication = (index: number) => {
    setProfile(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback className="bg-rose-100 text-rose-600 text-xl">
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{profile.name}</CardTitle>
                <p className="text-slate-600">{profile.email}</p>
                {healthMetrics && (
                  <div className="flex items-center gap-4 mt-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      <Calendar className="h-3 w-3 mr-1" />
                      {healthMetrics.streak} day streak
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <Activity className="h-3 w-3 mr-1" />
                      {healthMetrics.totalEntries} entries
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit className="h-4 w-4 mr-2" />}
              {isEditing ? 'Save' : 'Edit Profile'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Health Metrics Overview */}
      {healthMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-600" />
              Current Health Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-800">{healthMetrics.avgMood}</div>
                <div className="text-sm text-slate-600">Avg Mood</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <Moon className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-800">{healthMetrics.avgSleep}h</div>
                <div className="text-sm text-slate-600">Avg Sleep</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <Activity className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-800">{healthMetrics.totalExercise}m</div>
                <div className="text-sm text-slate-600">Total Exercise</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-lg">
                <Droplets className="h-6 w-6 text-cyan-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-slate-800">{healthMetrics.avgWater}</div>
                <div className="text-sm text-slate-600">Avg Water</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-rose-600" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || undefined }))}
                    placeholder="25"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={profile.height || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, height: parseInt(e.target.value) || undefined }))}
                    placeholder="170"
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={profile.weight || ''}
                    onChange={(e) => setProfile(prev => ({ ...prev, weight: parseInt(e.target.value) || undefined }))}
                    placeholder="70"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-slate-600">Age</Label>
                <div className="text-lg">{profile.age ? `${profile.age} years` : 'Not specified'}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-600">Height</Label>
                <div className="text-lg">{profile.height ? `${profile.height} cm` : 'Not specified'}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-600">Weight</Label>
                <div className="text-lg">{profile.weight ? `${profile.weight} kg` : 'Not specified'}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-rose-600" />
            Health Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Add a health goal..."
                  onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                />
                <Button onClick={addGoal} size="sm">Add</Button>
              </div>
              <div className="space-y-2">
                {profile.healthGoals.map((goal, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <span>{goal}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeGoal(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {profile.healthGoals.length > 0 ? (
                profile.healthGoals.map((goal, index) => (
                  <Badge key={index} variant="outline" className="mr-2 mb-2">
                    {goal}
                  </Badge>
                ))
              ) : (
                <p className="text-slate-500">No health goals set yet</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medical Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Medical Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newCondition}
                    onChange={(e) => setNewCondition(e.target.value)}
                    placeholder="Add condition..."
                    onKeyPress={(e) => e.key === 'Enter' && addCondition()}
                  />
                  <Button onClick={addCondition} size="sm">Add</Button>
                </div>
                <div className="space-y-2">
                  {profile.medicalConditions.map((condition, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span>{condition}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCondition(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {profile.medicalConditions.length > 0 ? (
                  profile.medicalConditions.map((condition, index) => (
                    <Badge key={index} variant="outline" className="mr-2 mb-2">
                      {condition}
                    </Badge>
                  ))
                ) : (
                  <p className="text-slate-500">No medical conditions recorded</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Medications</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newMedication}
                    onChange={(e) => setNewMedication(e.target.value)}
                    placeholder="Add medication..."
                    onKeyPress={(e) => e.key === 'Enter' && addMedication()}
                  />
                  <Button onClick={addMedication} size="sm">Add</Button>
                </div>
                <div className="space-y-2">
                  {profile.medications.map((medication, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span>{medication}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedication(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {profile.medications.length > 0 ? (
                  profile.medications.map((medication, index) => (
                    <Badge key={index} variant="outline" className="mr-2 mb-2">
                      {medication}
                    </Badge>
                  ))
                ) : (
                  <p className="text-slate-500">No medications recorded</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Emergency Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-600" />
            Emergency & Medical Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Input
                  id="emergencyContact"
                  value={profile.emergencyContact}
                  onChange={(e) => setProfile(prev => ({ ...prev, emergencyContact: e.target.value }))}
                  placeholder="Name and phone number"
                />
              </div>
              <div>
                <Label htmlFor="doctorInfo">Doctor Information</Label>
                <Input
                  id="doctorInfo"
                  value={profile.doctorInfo}
                  onChange={(e) => setProfile(prev => ({ ...prev, doctorInfo: e.target.value }))}
                  placeholder="Doctor name and contact"
                />
              </div>
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={profile.notes}
                  onChange={(e) => setProfile(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional health information..."
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-600">Emergency Contact</Label>
                <div className="text-lg">{profile.emergencyContact || 'Not specified'}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-600">Doctor Information</Label>
                <div className="text-lg">{profile.doctorInfo || 'Not specified'}</div>
              </div>
              {profile.notes && (
                <div>
                  <Label className="text-sm font-medium text-slate-600">Additional Notes</Label>
                  <div className="text-lg">{profile.notes}</div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {isEditing && (
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-rose-600 hover:bg-rose-700">
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}
