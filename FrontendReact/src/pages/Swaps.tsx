import { Layout } from '@/components/layout/layout';
import { SwapRequestCard } from '@/components/swaps/swap-request-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore, useSwapRequestsStore, useUsersStore } from '@/lib/store';

export default function SwapsPage() {
  const { currentUser } = useAuthStore();
  const { getRequestsByUserId, acceptSwapRequest, rejectSwapRequest, completeSwapRequest, deleteSwapRequest } = useSwapRequestsStore();
  const { getUserById } = useUsersStore();
  
  if (!currentUser) return null;
  
  const receivedRequests = getRequestsByUserId(currentUser.id, 'received');
  const sentRequests = getRequestsByUserId(currentUser.id, 'sent');
  
  return (
    <Layout requireAuth>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Skill Swaps</h1>
        
        <Tabs defaultValue="received" className="space-y-6">
          <TabsList className="w-full">
            <TabsTrigger value="received" className="flex-1">
              Received Requests {receivedRequests.length > 0 && `(${receivedRequests.length})`}
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex-1">
              Sent Requests {sentRequests.length > 0 && `(${sentRequests.length})`}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="received">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Swap Requests From Others</h2>
              
              {receivedRequests.length > 0 ? (
                <div className="grid gap-4">
                  {receivedRequests.map((request) => {
                    const sender = getUserById(request.senderId);
                    if (!sender) return null;
                    
                    return (
                      <SwapRequestCard
                        key={request.id}
                        swapRequest={request}
                        otherUser={sender}
                        isReceived={true}
                        onAccept={() => acceptSwapRequest(request.id)}
                        onReject={() => rejectSwapRequest(request.id)}
                        onComplete={() => completeSwapRequest(request.id)}
                      />
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">No swap requests received yet.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="sent">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Swap Requests You Sent</h2>
              
              {sentRequests.length > 0 ? (
                <div className="grid gap-4">
                  {sentRequests.map((request) => {
                    const receiver = getUserById(request.receiverId);
                    if (!receiver) return null;
                    
                    return (
                      <SwapRequestCard
                        key={request.id}
                        swapRequest={request}
                        otherUser={receiver}
                        isReceived={false}
                        onComplete={() => completeSwapRequest(request.id)}
                        onDelete={() => deleteSwapRequest(request.id)}
                      />
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">You haven't sent any swap requests yet.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}