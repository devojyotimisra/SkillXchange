export type User = {
  id: string;
  email: string;
  password: string; // In a real app, this would be hashed
  name: string;
  location?: string;
  profilePhoto?: string;
  skillsOffered: Skill[];
  skillsWanted: Skill[];
  availability: Availability[];
  isPublic: boolean;
  createdAt: string;
};

export type Skill = {
  id: string;
  name: string;
  description: string;
};

export type Availability = {
  id: string;
  day: string;
  timeSlot: string;
};

export type SwapRequest = {
  id: string;
  senderId: string;
  receiverId: string;
  skillOffered: Skill;
  skillRequested: Skill;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt: string;
};

export type Feedback = {
  id: string;
  swapRequestId: string;
  fromUserId: string;
  toUserId: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type AuthFormMode = 'login' | 'register';