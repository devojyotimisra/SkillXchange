import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Feedback, User } from '@/types';
import { useFeedbackStore, useUsersStore } from '@/lib/store';

interface ProfileFeedbackProps {
  userId: string;
}

export function ProfileFeedback({ userId }: ProfileFeedbackProps) {
  const { getUserFeedbacks } = useFeedbackStore();
  const { getUserById } = useUsersStore();
  
  const feedbacks = getUserFeedbacks(userId);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <span key={i} className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>
          ★
        </span>
      ));
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback & Ratings</CardTitle>
      </CardHeader>
      <CardContent>
        {feedbacks.length > 0 ? (
          <div className="space-y-4">
            {feedbacks.map((feedback) => {
              const fromUser = getUserById(feedback.fromUserId);
              
              return (
                <div key={feedback.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{fromUser?.name || 'Unknown User'}</div>
                    <div className="text-sm text-muted-foreground">{formatDate(feedback.createdAt)}</div>
                  </div>
                  <div className="mt-1 flex">{renderStars(feedback.rating)}</div>
                  {feedback.comment && <p className="mt-2 text-sm">{feedback.comment}</p>}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No feedback yet.</p>
        )}
      </CardContent>
    </Card>
  );
}