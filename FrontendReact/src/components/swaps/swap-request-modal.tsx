import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore, useSwapRequestsStore } from '@/lib/store';
import { Skill, User } from '@/types';

interface SwapRequestModalProps {
  receiver: User;
  receiverSkill: Skill;
  trigger: React.ReactNode;
}

export function SwapRequestModal({ receiver, receiverSkill, trigger }: SwapRequestModalProps) {
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { currentUser } = useAuthStore();
  const { createSwapRequest } = useSwapRequestsStore();

  const handleSubmit = () => {
    if (!currentUser || !selectedSkillId) return;
    
    const skillOffered = currentUser.skillsOffered.find(skill => skill.id === selectedSkillId);
    
    if (!skillOffered) return;
    
    createSwapRequest(receiver.id, skillOffered, receiverSkill);
    setIsDialogOpen(false);
    setSelectedSkillId('');
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Skill Swap</DialogTitle>
          <DialogDescription>
            Request to swap your skill with {receiver.name}'s {receiverSkill.name} skill.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">You will receive:</h3>
              <div className="p-3 border rounded-md">
                <p className="font-medium">{receiverSkill.name}</p>
                <p className="text-sm text-muted-foreground">{receiverSkill.description}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Select a skill to offer:</h3>
              <Select value={selectedSkillId} onValueChange={setSelectedSkillId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select one of your skills" />
                </SelectTrigger>
                <SelectContent>
                  {currentUser?.skillsOffered.map((skill) => (
                    <SelectItem key={skill.id} value={skill.id}>
                      {skill.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedSkillId && (
                <div className="mt-2 p-3 border rounded-md">
                  <p className="text-sm text-muted-foreground">
                    {currentUser?.skillsOffered.find(skill => skill.id === selectedSkillId)?.description}
                  </p>
                </div>
              )}
              
              {currentUser?.skillsOffered.length === 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  You haven't added any skills yet. Add skills to your profile first.
                </p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsDialogOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedSkillId}
          >
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}