import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface SkillFormProps {
  onSubmit: (name: string, description: string) => void;
  title: string;
  buttonText: string;
}

export function SkillForm({ onSubmit, title, buttonText }: SkillFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Skill name is required',
        variant: 'destructive',
      });
      return;
    }
    
    if (!description.trim()) {
      toast({
        title: 'Error',
        description: 'Skill description is required',
        variant: 'destructive',
      });
      return;
    }
    
    onSubmit(name, description);
    setName('');
    setDescription('');
    
    toast({
      title: 'Success',
      description: 'Skill added successfully',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="skill-name">Skill Name</Label>
            <Input
              id="skill-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. JavaScript Programming, Photography, Guitar Lessons"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skill-description">Description</Label>
            <Textarea
              id="skill-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe your skill, experience level, etc."
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">{buttonText}</Button>
        </CardFooter>
      </form>
    </Card>
  );
}