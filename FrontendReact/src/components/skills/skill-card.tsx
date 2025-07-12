import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Skill } from '@/types';
import { Link } from 'react-router-dom';
import { useState } from 'react';

interface SkillCardProps {
  user: User;
  skillOffered: Skill;
  skillAvailable: Skill[];
  onRequestSwap?: (user: User, skill: Skill) => void;
}

export function SkillCard({ user, skillOffered, skillAvailable, onRequestSwap }: SkillCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const [selectedValue, setSelectedValue] = useState('');

  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.profilePhoto} alt={user.name} />
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-base">
            <Link to={`/users/${user.id}`} className="hover:underline">
              {user.name}
            </Link>
          </CardTitle>
          {user.location && <CardDescription>{user.location}</CardDescription>}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="mb-4">
          <h3 className="font-medium mb-1">Offering</h3>
          <Badge className="mb-2">{skillOffered.name}</Badge>
          <p className="text-sm text-muted-foreground">{skillOffered.description}</p>
        </div>
        
        <div className="mt-auto space-y-4">
          <div>
            <h3 className="font-medium mb-1">Looking for</h3>
            <div className="flex flex-wrap gap-2">
              {user.skillsWanted.map((skill) => (
                <Badge key={skill.id} variant="outline">{skill.name}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-1">Skill to Offer</h3>
            <div className="flex flex-wrap gap-2">
              <select value={selectedValue} onChange={(e) => setSelectedValue(e.target.value)}>
                {skillAvailable.map((skill) => (
                  <option key={skill.id} value={skill.id}>
                    {skill.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-1">Available</h3>
            <div className="flex flex-wrap gap-1">
              {user.availability.map((avail) => (
                <span key={avail.id} className="text-xs bg-muted px-2 py-1 rounded-md">
                  {avail.day} ({avail.timeSlot})
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {onRequestSwap && (
          <Button 
            onClick={() => onRequestSwap(user, skillOffered)} 
            className="mt-4 w-full"
          >
            Request Swap
          </Button>
        )}
      </CardContent>
    </Card>
  );
}