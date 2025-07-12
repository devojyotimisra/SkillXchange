import { useParams, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProfileFeedback } from '@/components/user/profile-feedback';
import { SwapRequestModal } from '@/components/swaps/swap-request-modal';
import { useAuthStore, useUsersStore } from '@/lib/store';
import { useState } from 'react';
import { Skill } from '@/types';

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { getUserById } = useUsersStore();
  const { currentUser } = useAuthStore();
  
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  
  const user = userId ? getUserById(userId) : null;
  
  if (!userId || !user) {
    return <Navigate to="/browse" />;
  }
  
  if (user.id === currentUser?.id) {
    return <Navigate to="/profile" />;
  }
  
  if (!user.isPublic) {
    return (
      <Layout requireAuth>
        <div className="max-w-2xl mx-auto text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Private Profile</h1>
          <p className="text-muted-foreground mb-6">This user has set their profile to private.</p>
          <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </Layout>
    );
  }
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <Layout requireAuth>
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user.profilePhoto} />
                    <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    {user.location && <p className="text-muted-foreground">{user.location}</p>}
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Available</h3>
                  <div className="flex flex-wrap gap-2">
                    {user.availability.length > 0 ? (
                      user.availability.map((avail) => (
                        <span key={avail.id} className="text-xs bg-muted px-2 py-1 rounded-md">
                          {avail.day} ({avail.timeSlot})
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No availability specified</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Feedback & Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileFeedback userId={user.id} />
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Skills Offered</h2>
                {user.skillsOffered.length > 0 ? (
                  <div className="space-y-4">
                    {user.skillsOffered.map((skill) => (
                      <Card key={skill.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge>{skill.name}</Badge>
                              </div>
                              <p className="text-muted-foreground">{skill.description}</p>
                            </div>
                            <Button 
                              onClick={() => setSelectedSkill(skill)}
                              className="whitespace-nowrap"
                            >
                              Request Swap
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">This user is not offering any skills yet.</p>
                )}
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Skills Wanted</h2>
                {user.skillsWanted.length > 0 ? (
                  <div className="space-y-4">
                    {user.skillsWanted.map((skill) => (
                      <Card key={skill.id}>
                        <CardContent className="pt-6">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{skill.name}</Badge>
                            </div>
                            <p className="text-muted-foreground mt-2">{skill.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">This user hasn't listed any skills they want to learn.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {selectedSkill && (
        <SwapRequestModal
          receiver={user}
          receiverSkill={selectedSkill}
          trigger={<div style={{ display: 'none' }}></div>}
        />
      )}
    </Layout>
  );
}