import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { User, SwapRequest, Feedback, Skill, Availability } from '@/types';

const API = 'https://skz41mcm-5000.inc1.devtunnels.ms/api';
const API_AUTH = 'https://skz41mcm-5000.inc1.devtunnels.ms/api/auth';
const API_SKILL = 'https://skz41mcm-5000.inc1.devtunnels.ms/api/skills';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  users: User[];  // Store all users
  register: (email: string, password: string, name: string, location?: string, profilePhoto?: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (user: Partial<User>) => void;
  addSkillOffered: (skill: Omit<Skill, 'id'>) => void;
  addSkillWanted: (skill: Omit<Skill, 'id'>) => void;
  removeSkillOffered: (skillId: string) => void;
  removeSkillWanted: (skillId: string) => void;
  updateAvailability: (availability: Availability[]) => void;
  togglePublicProfile: () => void;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

interface UsersState {
  users: User[];
  getPublicUsers: () => User[];
  getUserById: (id: string) => User | undefined;
  searchUsersBySkill: (skill: string) => User[];
}

interface SwapRequestsState {
  swapRequests: SwapRequest[];
  createSwapRequest: (
    receiverId: string,
    skillOffered: Skill,
    skillRequested: Skill
  ) => void;
  acceptSwapRequest: (requestId: string) => void;
  rejectSwapRequest: (requestId: string) => void;
  completeSwapRequest: (requestId: string) => void;
  deleteSwapRequest: (requestId: string) => void;
  getRequestsByUserId: (userId: string, type: 'sent' | 'received') => SwapRequest[];
}

interface FeedbackState {
  feedbacks: Feedback[];
  addFeedback: (
    swapRequestId: string,
    toUserId: string,
    rating: number,
    comment: string
  ) => void;
  getUserFeedbacks: (userId: string) => Feedback[];
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      users: [],
      register: async (email, password, name, location = '', profilePhoto = '') => {
        // Check if email already exists
        // const existingUser = get().users.find(user => user.email.toLowerCase() === email.toLowerCase());
        // if (existingUser) {
        //   return false; // Email already exists
        // }
        
        const newUser: User = {
          id: uuidv4(),
          email,
          password,
          name,
          location,
          profilePhoto,
          skillsOffered: [],
          skillsWanted: [],
          availability: [],
          isPublic: true,
          createdAt: new Date().toISOString(),
        };

        console.log(newUser);

        try{
          const response = await fetch(`${API_AUTH}/register`,{
            method: 'POST',
            body: JSON.stringify(newUser),
            headers: {
              'Content-Type': 'application/json'
            }
          })

           if (!response.ok) {
            console.error('Registration failed:', response.statusText);
            return false;
          }

          const info = await response.json();
          localStorage.setItem('token', info.token);

          set(state => ({ 
          users: [...state.users, info.user],
          currentUser: info.user,
          isAuthenticated: true
        }));

        } catch (error) {
          console.error('Registration failed:', error);
          return false;
        }
        
        // Update both current user and users array
        // set(state => ({ 
        //   users: [...state.users, newUser],
        //   currentUser: newUser,
        //   isAuthenticated: true
        // }));
        
        
        // Add user to users store for backwards compatibility
        const usersStore = useUsersStore.getState();
        const currentUsers = usersStore.users;
        if (!currentUsers.find(user => user.id === newUser.id)) {
          useUsersStore.setState({ users: [...currentUsers, newUser] });
        }
        
        return true;
      },
      login: async (email, password) => {
        // Find user by email and password
        try{
          const response = await fetch(`${API_AUTH}/login`,{
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: {
              'Content-Type': 'application/json'
            }
          })

           if (!response.ok) {
            console.error('Login failed:', response.statusText);
            return false;
          }

          const info = await response.json();
          localStorage.setItem('token', info.token);

          set({ currentUser: info.user , isAuthenticated: true });
          return true;
        }
        catch (error) {
          console.error('Login failed:', error);
          return false;
        }       
      },
      logout: () => set({ currentUser: null, isAuthenticated: false }),
      updateProfile: (userData) => {
        set((state) => {
          if (!state.currentUser) return state;
          
          const updatedUser = {
            ...state.currentUser,
            ...userData,
          };
          
          // Update in users store as well
          const usersStore = useUsersStore.getState();
          const updatedUsers = usersStore.users.map(user => 
            user.id === updatedUser.id ? updatedUser : user
          );
          useUsersStore.setState({ users: updatedUsers });

          localStorage.removeItem('token');
          
          return { currentUser: updatedUser };
        });
      },
      addSkillOffered: async (skill) => {
        try{
          const response = await fetch(`${API_SKILL}/offered`,{
            method: 'POST',
            body: JSON.stringify({ name: skill.name, description: skill.description }),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
          })
          if (!response.ok) {
            console.error('Add skill failed:', response.statusText);
            return;
          }
          const uid = await response.json();
          set((state) => {
            if (!state.currentUser) return state;

            const newSkill = { id: uid.skill.id, ...skill };
            const updatedUser = {
              ...state.currentUser,
              skillsOffered: [...state.currentUser.skillsOffered, newSkill],
            };

              const usersStore = useUsersStore.getState();
              const updatedUsers = usersStore.users.map(user => 
                user.id === updatedUser.id ? updatedUser : user
              );
              useUsersStore.setState({ users: updatedUsers });
              
              return { currentUser: updatedUser };

          });
        }
        catch (error) {
          console.error('Add skill failed:', error);
          return;
        }
      },
      addSkillWanted: async (skill) => {
        try{ 
          const response = await fetch(`${API_SKILL}/wanted`,{
            method: 'POST',
            body: JSON.stringify({ name: skill.name, description: skill.description }),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
          })
          const uid = await response.json();
          if (!response.ok) {
            console.error('Add skill failed:', response.statusText);
            return;
          }
          set((state) => {
            if (!state.currentUser) return state;
            const newSkill = { id: uid.skill.id, ...skill };
            const updatedUser = {
              ...state.currentUser,
              skillsWanted: [...state.currentUser.skillsWanted, newSkill],
            };
            const usersStore = useUsersStore.getState();
            const updatedUsers = usersStore.users.map(user => 
              user.id === updatedUser.id ? updatedUser : user
            );
            useUsersStore.setState({ users: updatedUsers });
            
            return { currentUser: updatedUser };
          });
        }
        catch (error) {
          console.error('Add skill failed:', error);
          return;
        }
      },
      removeSkillOffered: async (skillId) => {

        try{
          const response = await fetch(`${API_SKILL}/offered/${skillId}`,{
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
          })
          if (!response.ok) {
            console.error('Remove skill failed:', response.statusText);
            return;
          }
          set((state) => {
            if (!state.currentUser) return state;
            const updatedUser = {
              ...state.currentUser,
              skillsOffered: state.currentUser.skillsOffered.filter(skill => skill.id !== skillId),
            };
            
            // Update in users store as well
            const usersStore = useUsersStore.getState();
            const updatedUsers = usersStore.users.map(user => 
              user.id === updatedUser.id ? updatedUser : user
            );
            useUsersStore.setState({ users: updatedUsers });
            
            return { currentUser: updatedUser };
          });
        }
        catch (error) {
          console.error('Remove skill failed:', error);
          return;
        }
      },
      removeSkillWanted: async (skillId) => {
        try{
          const response = await fetch(`${API_SKILL}/wanted/${skillId}`,{
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
          })
          if (!response.ok) {
            console.error('Remove skill failed:', response.statusText);
            return;
          }
          set((state) => {
            if (!state.currentUser) return state;
            const updatedUser = {
              ...state.currentUser,
              skillsWanted: state.currentUser.skillsWanted.filter(skill => skill.id !== skillId),
            };
            
            // Update in users store as well
            const usersStore = useUsersStore.getState();
            const updatedUsers = usersStore.users.map(user => 
              user.id === updatedUser.id ? updatedUser : user
            );
            useUsersStore.setState({ users: updatedUsers });
            
            return { currentUser: updatedUser };
          });
        }
        catch (error) {
          console.error('Remove skill failed:', error);
          return;
        }
      },
      updateAvailability: async (availability) => {
        try {
          const response = await fetch(`${API}/users/availability`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ availability }),
          });

          if (!response.ok) {
            console.error('Update availability failed:', response.statusText);
            return false;
          }

          const data = await response.json();
          set({ currentUser: data.user });
          return true;
        } catch (error) {
          console.error('Update availability failed:', error);
          return false;
        }
      },
      togglePublicProfile: async () => {
        try {
          const response = await fetch(`${API}/users/toggle-public`, {
            method: 'PUT',
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            console.error('Toggle public profile failed:', response.statusText);
            return false;
          }

          const data = await response.json();
          set({ currentUser: data.user });
          return true;
        } catch (error) {
          console.error('Toggle public profile failed:', error);
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useUsersStore = create<UsersState>()(
  persist(
    (set, get) => ({
      users: [],
      getPublicUsers: () => {
        return get().users.filter(user => user.isPublic);
      },
      getUserById: (id) => {
        return get().users.find(user => user.id === id);
      },
      searchUsersBySkill: (skillQuery) => {
        const normalizedQuery = skillQuery.toLowerCase();
        return get().users.filter(user => 
          user.isPublic && 
          (user.skillsOffered.some(skill => skill.name.toLowerCase().includes(normalizedQuery)) ||
           user.skillsWanted.some(skill => skill.name.toLowerCase().includes(normalizedQuery)))
        );
      }
    }),
    {
      name: 'users-storage',
    }
  )
);

export const useSwapRequestsStore = create<SwapRequestsState>()(
  persist(
    (set, get) => ({
      swapRequests: [],
      createSwapRequest: (receiverId, skillOffered, skillRequested) => {
        const currentUser = useAuthStore.getState().currentUser;
        if (!currentUser) return;
        
        const newRequest: SwapRequest = {
          id: uuidv4(),
          senderId: currentUser.id,
          receiverId,
          skillOffered,
          skillRequested,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          swapRequests: [...state.swapRequests, newRequest]
        }));
      },
      acceptSwapRequest: (requestId) => {
        set((state) => ({
          swapRequests: state.swapRequests.map(request => 
            request.id === requestId ? { ...request, status: 'accepted' } : request
          )
        }));
      },
      rejectSwapRequest: (requestId) => {
        set((state) => ({
          swapRequests: state.swapRequests.map(request => 
            request.id === requestId ? { ...request, status: 'rejected' } : request
          )
        }));
      },
      completeSwapRequest: (requestId) => {
        set((state) => ({
          swapRequests: state.swapRequests.map(request => 
            request.id === requestId ? { ...request, status: 'completed' } : request
          )
        }));
      },
      deleteSwapRequest: (requestId) => {
        set((state) => ({
          swapRequests: state.swapRequests.filter(request => request.id !== requestId)
        }));
      },
      getRequestsByUserId: (userId, type) => {
        return get().swapRequests.filter(request => 
          type === 'sent' ? request.senderId === userId : request.receiverId === userId
        );
      }
    }),
    {
      name: 'swap-requests-storage',
    }
  )
);

export const useFeedbackStore = create<FeedbackState>()(
  persist(
    (set, get) => ({
      feedbacks: [],
      addFeedback: (swapRequestId, toUserId, rating, comment) => {
        const currentUser = useAuthStore.getState().currentUser;
        if (!currentUser) return;
        
        const newFeedback: Feedback = {
          id: uuidv4(),
          swapRequestId,
          fromUserId: currentUser.id,
          toUserId,
          rating,
          comment,
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          feedbacks: [...state.feedbacks, newFeedback]
        }));
      },
      getUserFeedbacks: (userId) => {
        return get().feedbacks.filter(feedback => feedback.toUserId === userId);
      }
    }),
    {
      name: 'feedbacks-storage',
    }
  )
);