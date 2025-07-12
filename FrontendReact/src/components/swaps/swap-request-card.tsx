import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { SwapRequest, User } from '@/types';
import { useAuthStore, useFeedbackStore, useUsersStore } from '@/lib/store';

interface SwapRequestCardProps {
  swapRequest: SwapRequest;
  otherUser: User;
  onAccept?: () => void;
  onReject?: () => void;
  onComplete?: () => void;
  onDelete?: () => void;
  isReceived?: boolean;
}

export function SwapRequestCard({
  swapRequest,
  otherUser,
  onAccept,
  onReject,
  onComplete,
  onDelete,
  isReceived = false
}: SwapRequestCardProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { addFeedback } = useFeedbackStore();
  const { currentUser } = useAuthStore();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  const getStatusBadge = () => {
    switch (swapRequest.status) {
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'accepted':
        return <Badge className="bg-green-500">Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">Rejected</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      default:
        return null;
    }
  };
  
  const handleSubmitFeedback = () => {
    if (!currentUser) return;
    
    addFeedback(swapRequest.id, otherUser.id, rating, comment);
    setIsDialogOpen(false);
    setRating(0);
    setComment('');
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={otherUser.profilePhoto} />
              <AvatarFallback>{getInitials(otherUser.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{otherUser.name}</CardTitle>
              <CardDescription>Requested on {formatDate(swapRequest.createdAt)}</CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium">{isReceived ? 'Requested' : 'You offered'}</p>
            <div className="flex gap-2 mt-1">
              <Badge>{swapRequest.skillRequested.name}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{swapRequest.skillRequested.description}</p>
          </div>
          <div>
            <p className="text-sm font-medium">{isReceived ? 'Offering' : 'In return for'}</p>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline">{swapRequest.skillOffered.name}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{swapRequest.skillOffered.description}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2 w-full">
          {isReceived && swapRequest.status === 'pending' && (
            <>
              <Button onClick={onAccept} variant="default" size="sm" className="flex-1">
                Accept
              </Button>
              <Button onClick={onReject} variant="outline" size="sm" className="flex-1">
                Reject
              </Button>
            </>
          )}
          
          {!isReceived && swapRequest.status === 'pending' && (
            <Button onClick={onDelete} variant="destructive" size="sm" className="flex-1">
              Cancel Request
            </Button>
          )}
          
          {swapRequest.status === 'accepted' && (
            <Button onClick={onComplete} variant="default" size="sm" className="flex-1">
              Mark as Completed
            </Button>
          )}
          
          {swapRequest.status === 'completed' && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1">
                  Leave Feedback
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Leave feedback for {otherUser.name}</DialogTitle>
                  <DialogDescription>
                    Rate your experience and leave a comment about your SkillXchange.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Rating</p>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Comment</p>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Tell us about your experience..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleSubmitFeedback} disabled={!rating}>
                    Submit Feedback
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}