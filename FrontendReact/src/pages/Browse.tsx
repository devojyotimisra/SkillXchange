import { useState } from 'react';
import { Layout } from '@/components/layout/layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SkillCard } from '@/components/skills/skill-card';
import { SwapRequestModal } from '@/components/swaps/swap-request-modal';
import { Search } from 'lucide-react';
import { useUsersStore, useAuthStore, useSwapRequestsStore } from '@/lib/store';
import { User, Skill } from '@/types';
import { showToast } from '@/lib/toast';

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  
  const { getPublicUsers, searchUsersBySkill } = useUsersStore();
  const { currentUser } = useAuthStore();
  
  const {createSwapRequest} = useSwapRequestsStore();

  const publicUsers = searchQuery ? 
    searchUsersBySkill(searchQuery) : 
    getPublicUsers().filter(user => user.id !== currentUser?.id);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search results are already updated based on the searchQuery state
  };
  
  const handleRequestSwap = (user: User, skill: Skill) => {
    setSelectedUser(user);
    setSelectedSkill(skill);
    createSwapRequest(user.id, skill,skill)
    showToast.success('Request Send');
    // The modal will be opened via the trigger
  };
  
  return (
    <Layout requireAuth>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold">Browse Skills</h1>
          
          <form onSubmit={handleSearch} className="flex w-full md:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by skill (e.g., JavaScript, Cooking)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-full md:w-[300px]"
              />
            </div>
            <Button type="submit" className="ml-2">Search</Button>
          </form>
        </div>
        
        {publicUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicUsers.flatMap((user) =>
              user.skillsOffered.map((skill) => (
                <SkillCard
                  key={`${user.id}-${skill.id}`}
                  user={user}
                  skillOffered={skill}
                  skillAvailable={user.skillsWanted}
                  onRequestSwap={() => handleRequestSwap(user, skill)}
                />
              ))
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold">No skills found</h2>
            <p className="text-muted-foreground mt-2">
              {searchQuery
                ? `No one is offering skills matching "${searchQuery}"`
                : "There are no public skills available at the moment."}
            </p>
            {searchQuery && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
        
        {selectedUser && selectedSkill && (
          <SwapRequestModal
            receiver={selectedUser}
            receiverSkill={selectedSkill}
            trigger={<span style={{ display: 'none' }}></span>} // Hidden trigger as we manage the modal state from the card
          />
        )}
      </div>
    </Layout>
  );
}