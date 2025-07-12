import { useState } from 'react';
import { Layout } from '@/components/layout/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SkillForm } from '@/components/skills/skill-form';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { AvailabilitySelector } from '@/components/availability/availability-selector';
import { ProfileFeedback } from '@/components/user/profile-feedback';
import { useAuthStore } from '@/lib/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProfilePage() {
  const { currentUser, updateProfile, togglePublicProfile, addSkillOffered, addSkillWanted, removeSkillOffered, removeSkillWanted, updateAvailability } = useAuthStore();
  
  const [name, setName] = useState(currentUser?.name || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [profilePhoto, setProfilePhoto] = useState(currentUser?.profilePhoto || '');
  const [isEditing, setIsEditing] = useState(false);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };
  
  const handleSaveProfile = () => {
    updateProfile({
      name,
      location,
      profilePhoto,
    });
    setIsEditing(false);
  };
  
  if (!currentUser) return null;
  
  return (
    <Layout requireAuth>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile Info</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location (Optional)</Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profilePhoto">Profile Photo (Optional)</Label>
                      <div className="grid gap-2">
                        <Input
                          id="file-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setProfilePhoto(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        {profilePhoto && (
                          <div className="mt-2">
                            <img
                              src={profilePhoto}
                              alt="Profile Preview"
                              className="w-16 h-16 object-cover rounded-full border"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveProfile} className="flex-1">Save</Button>
                      <Button onClick={() => setIsEditing(false)} variant="outline" className="flex-1">Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={currentUser.profilePhoto} />
                        <AvatarFallback className="text-2xl">{getInitials(currentUser.name)}</AvatarFallback>
                      </Avatar>
                      <div className="text-center">
                        <h2 className="text-xl font-semibold">{currentUser.name}</h2>
                        {currentUser.location && <p className="text-muted-foreground">{currentUser.location}</p>}
                      </div>
                    </div>
                    <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full">
                      Edit Profile
                    </Button>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="public-profile">Public Profile</Label>
                      <Switch
                        id="public-profile"
                        checked={currentUser.isPublic}
                        onCheckedChange={togglePublicProfile}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {currentUser.isPublic
                        ? 'Your profile is visible to other users.'
                        : 'Your profile is hidden from other users.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Tabs defaultValue="skills">
              <TabsList className="mb-4 w-full">
                <TabsTrigger value="skills" className="flex-1">Skills</TabsTrigger>
                <TabsTrigger value="availability" className="flex-1">Availability</TabsTrigger>
                <TabsTrigger value="feedback" className="flex-1">Feedback</TabsTrigger>
              </TabsList>
              
              <TabsContent value="skills" className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Skills You Offer</h2>
                  <div className="mb-4">
                    {currentUser.skillsOffered.length > 0 ? (
                      <div className="space-y-2">
                        {currentUser.skillsOffered.map((skill) => (
                          <div key={skill.id} className="flex justify-between items-center p-3 border rounded-lg">
                            <div>
                              <h3 className="font-medium">{skill.name}</h3>
                              <p className="text-sm text-muted-foreground">{skill.description}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSkillOffered(skill.id)}
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No skills added yet. Add skills you can offer to others.</p>
                    )}
                  </div>
                  <SkillForm
                    onSubmit={(name, description) => addSkillOffered({ name, description })}
                    title="Add a Skill You Can Offer"
                    buttonText="Add Skill"
                  />
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold mb-4">Skills You Want to Learn</h2>
                  <div className="mb-4">
                    {currentUser.skillsWanted.length > 0 ? (
                      <div className="space-y-2">
                        {currentUser.skillsWanted.map((skill) => (
                          <div key={skill.id} className="flex justify-between items-center p-3 border rounded-lg">
                            <div>
                              <h3 className="font-medium">{skill.name}</h3>
                              <p className="text-sm text-muted-foreground">{skill.description}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSkillWanted(skill.id)}
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No skills added yet. Add skills you want to learn.</p>
                    )}
                  </div>
                  <SkillForm
                    onSubmit={(name, description) => addSkillWanted({ name, description })}
                    title="Add a Skill You Want to Learn"
                    buttonText="Add Skill"
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="availability" className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Your Availability</h2>
                <p className="text-muted-foreground mb-4">Let others know when you're available for skill swapping.</p>
                <AvailabilitySelector
                  availabilities={currentUser.availability}
                  onChange={updateAvailability}
                />
              </TabsContent>
              
              <TabsContent value="feedback" className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Your Feedback</h2>
                <ProfileFeedback userId={currentUser.id} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}